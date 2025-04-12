import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	role: "user" | "admin";
	status: "active" | "inactive" | "pending"; // Trạng thái tài khoản người dùng
	favorites: string[]; // Danh sách ID các thành phố yêu thích
	googleId?: string; // ID từ tài khoản Google
	resetPasswordToken?: string;
	resetPasswordExpires?: Date;
	isEmailVerified: boolean;
	emailVerificationToken?: string;
	emailVerificationExpires?: Date; // Thời gian hết hạn của token xác minh email
	createdAt: Date;
	updatedAt: Date;
	comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
	{
		email: {
			type: String,
			required: [true, "Email là bắt buộc"],
			unique: true,
			trim: true,
			lowercase: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				"Vui lòng cung cấp email hợp lệ",
			],
		},
		password: {
			type: String,
			required: [true, "Mật khẩu là bắt buộc"],
			minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
			select: false, // Không trả về password khi query
		},
		firstName: {
			type: String,
			required: [true, "Tên là bắt buộc"],
			trim: true,
		},
		lastName: {
			type: String,
			required: function (this: IUser) {
				// Chỉ bắt buộc nếu không phải đăng nhập qua Google
				return !this.googleId;
			},
			trim: true,
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		status: {
			type: String,
			enum: ["active", "inactive", "pending"],
			default: "pending", // Người dùng mới được thêm vào sẽ ở trạng thái chờ xác nhận
		},
		favorites: {
			type: [String],
			default: [],
		},
		googleId: {
			type: String,
			sparse: true,
			unique: true,
		},
		resetPasswordToken: {
			type: String,
		},
		resetPasswordExpires: {
			type: Date,
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		emailVerificationToken: {
			type: String,
		},
		emailVerificationExpires: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

// Hash mật khẩu trước khi lưu
UserSchema.pre("save", async function (next) {
	// Chỉ hash mật khẩu nếu nó được sửa đổi hoặc là mới
	if (!this.isModified("password")) return next();

	try {
		// Tạo salt ngẫu nhiên
		const salt = await bcrypt.genSalt(10);
		// Hash mật khẩu với salt
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error: any) {
		next(error);
	}
});

// Phương thức so sánh mật khẩu
UserSchema.methods.comparePassword = async function (
	candidatePassword: string
): Promise<boolean> {
	try {
		return await bcrypt.compare(candidatePassword, this.password);
	} catch (error) {
		return false;
	}
};

export const User = mongoose.model<IUser>("User", UserSchema);
