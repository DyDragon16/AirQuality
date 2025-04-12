import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import {
	RegisterUserDto,
	LoginUserDto,
	AuthResponse,
	JwtPayload,
	EmailVerificationDto,
} from "../types/auth";
import { logError, logInfo, logWarning } from "../utils/logger";
import { Types } from "mongoose";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService";

class AuthService {
	/**
	 * Đăng ký người dùng mới
	 * @param userData Thông tin đăng ký
	 */
	async register(userData: RegisterUserDto): Promise<AuthResponse | null> {
		try {
			// Kiểm tra email đã tồn tại chưa
			const existingUser = await User.findOne({ email: userData.email });
			if (existingUser) {
				throw new Error("Email đã được sử dụng");
			}

			// Tạo mã xác nhận email ngẫu nhiên
			const verificationToken = crypto.randomBytes(32).toString("hex");

			// Tạo ngày hết hạn cho token (24 giờ)
			const tokenExpires = new Date();
			tokenExpires.setHours(tokenExpires.getHours() + 24);

			// Tạo người dùng mới với mã xác nhận email
			const user = new User({
				email: userData.email,
				password: userData.password,
				firstName: userData.firstName,
				lastName: userData.lastName,
				emailVerificationToken: verificationToken,
				emailVerificationExpires: tokenExpires,
				isEmailVerified: false,
				status: "pending", // Đảm bảo trạng thái là pending khi tạo tài khoản mới
			});

			// Lưu vào database
			const savedUser = await user.save();
			logInfo(`Người dùng mới đã đăng ký: ${savedUser.email}`);

			// Tạo JWT token
			const token = this.generateToken(savedUser);

			// Gửi email xác nhận
			const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
			const verificationUrl = `${frontendUrl}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(
				userData.email
			)}`;

			await this.sendVerificationEmail(
				userData.email,
				verificationUrl,
				userData.firstName
			);

			// Trả về response
			return {
				token,
				user: {
					id:
						savedUser._id instanceof Types.ObjectId
							? savedUser._id.toString()
							: String(savedUser._id),
					email: savedUser.email,
					firstName: savedUser.firstName,
					lastName: savedUser.lastName,
					role: savedUser.role,
					favorites: savedUser.favorites,
					isEmailVerified: savedUser.isEmailVerified,
					status: savedUser.status,
				},
			};
		} catch (error) {
			logError("Lỗi khi đăng ký người dùng:", error);
			throw error;
		}
	}

	/**
	 * Gửi email xác nhận đến người dùng
	 * @param email Email người dùng
	 * @param verificationUrl URL xác nhận email
	 * @param firstName Tên người dùng
	 */
	private async sendVerificationEmail(
		email: string,
		verificationUrl: string,
		firstName: string
	): Promise<void> {
		try {
			const emailOptions = {
				to: email,
				subject: "Xác nhận email để kích hoạt tài khoản của bạn",
				html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
					<h1 style="color: #4F46E5; text-align: center;">Xác nhận email của bạn</h1>
					<p>Xin chào ${firstName},</p>
					<p>Cảm ơn bạn đã đăng ký tài khoản trên hệ thống Air Quality. Vui lòng xác nhận email của bạn để <span style="color: #e53e3e; font-weight: bold;">kích hoạt tài khoản</span> và bắt đầu sử dụng đầy đủ các dịch vụ của chúng tôi.</p>
					
					<div style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; margin: 15px 0;">
						<p><strong>Lưu ý:</strong> Tài khoản của bạn hiện đang ở trạng thái chờ xác nhận. Bạn cần xác nhận email trước khi có thể đăng nhập và sử dụng hệ thống.</p>
						<p><strong>Liên kết xác minh email này sẽ hết hạn sau 24 giờ.</strong> Nếu bạn không xác minh kịp thời, bạn có thể yêu cầu gửi lại email xác nhận tại trang đăng nhập.</p>
					</div>
					
					<div style="text-align: center; margin: 30px 0;">
						<a href="${verificationUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Xác nhận email & Kích hoạt tài khoản</a>
					</div>
					
					<p>Nếu bạn không yêu cầu email này, vui lòng bỏ qua.</p>
					<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; text-align: center; color: #666; font-size: 12px;">
						<p>© 2025 Air Quality. Tất cả các quyền được bảo lưu.</p>
					</div>
				</div>
				`,
			};

			await sendEmail(emailOptions);
			logInfo(`Email xác nhận đã được gửi đến: ${email}`);
		} catch (error) {
			logError(`Lỗi khi gửi email xác nhận đến ${email}:`, error);
			// Không ném lỗi ở đây, chỉ ghi log để quy trình đăng ký vẫn tiếp tục
		}
	}

	/**
	 * Xác nhận email
	 * @param verificationData Dữ liệu xác nhận email
	 */
	async verifyEmail(verificationData: EmailVerificationDto): Promise<boolean> {
		try {
			logInfo(
				`Đang xác thực email: ${
					verificationData.email
				} với token: ${verificationData.token.substring(0, 10)}...`
			);

			// Kiểm tra đầu vào
			if (!verificationData.email || !verificationData.token) {
				logWarning("Thiếu dữ liệu xác thực email");
				throw new Error("Thông tin xác thực không đầy đủ");
			}

			// Tìm người dùng với email và token xác nhận
			const user = await User.findOne({
				email: verificationData.email,
				emailVerificationToken: verificationData.token,
			});

			if (!user) {
				logWarning(
					`Không tìm thấy người dùng với email: ${verificationData.email} và token đã cung cấp`
				);
				throw new Error(
					"Token xác nhận không hợp lệ. Vui lòng kiểm tra lại email của bạn."
				);
			}

			// Kiểm tra token có hết hạn không
			if (
				user.emailVerificationExpires &&
				user.emailVerificationExpires < new Date()
			) {
				logWarning(
					`Token đã hết hạn cho người dùng: ${user.email}, hết hạn: ${user.emailVerificationExpires}`
				);
				throw new Error(
					"Liên kết xác nhận đã hết hạn. Vui lòng yêu cầu gửi lại email xác nhận."
				);
			}

			// Cập nhật trạng thái xác nhận email
			user.isEmailVerified = true;
			user.emailVerificationToken = undefined;
			user.emailVerificationExpires = undefined;
			if (user.status === "pending") {
				user.status = "active";
			}

			await user.save();
			logInfo(
				`Email đã được xác nhận thành công cho người dùng: ${user.email}`
			);

			return true;
		} catch (error) {
			logError("Lỗi khi xác nhận email:", error);
			throw error;
		}
	}

	/**
	 * Gửi lại email xác nhận cho người dùng
	 * @param email Email của người dùng
	 */
	async resendVerificationEmail(email: string): Promise<boolean> {
		try {
			// Tìm người dùng theo email
			const user = await User.findOne({ email });

			if (!user) {
				throw new Error("Không tìm thấy người dùng với email này");
			}

			if (user.isEmailVerified) {
				throw new Error("Email này đã được xác nhận");
			}

			// Tạo mã xác nhận mới
			const verificationToken = crypto.randomBytes(32).toString("hex");
			user.emailVerificationToken = verificationToken;

			// Cập nhật thời hạn mới (24 giờ)
			const tokenExpires = new Date();
			tokenExpires.setHours(tokenExpires.getHours() + 24);
			user.emailVerificationExpires = tokenExpires;

			await user.save();

			// Gửi email xác nhận
			const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
			const verificationUrl = `${frontendUrl}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(
				email
			)}`;

			await this.sendVerificationEmail(email, verificationUrl, user.firstName);

			return true;
		} catch (error) {
			logError("Lỗi khi gửi lại email xác nhận:", error);
			throw error;
		}
	}

	/**
	 * Đăng nhập người dùng
	 * @param loginData Thông tin đăng nhập
	 */
	async login(loginData: LoginUserDto): Promise<AuthResponse | null> {
		try {
			logInfo(`Đang thử đăng nhập với email: ${loginData.email}`);

			// Chuẩn hóa email (chuyển thành chữ thường) trước khi tìm kiếm
			const normalizedEmail = loginData.email.toLowerCase().trim();

			// Tìm người dùng theo email và lấy cả password
			const user = await User.findOne({ email: normalizedEmail }).select(
				"+password"
			);

			// Log kết quả tìm kiếm người dùng
			if (!user) {
				logWarning(`Không tìm thấy người dùng với email: ${normalizedEmail}`);
				throw new Error("Email hoặc mật khẩu không đúng");
			}

			logInfo(`Tìm thấy người dùng: ${user.email}, đang kiểm tra mật khẩu`);

			// Kiểm tra mật khẩu
			const isPasswordValid = await user.comparePassword(loginData.password);

			// Log kết quả kiểm tra mật khẩu
			if (!isPasswordValid) {
				logWarning(`Mật khẩu không đúng cho người dùng: ${user.email}`);
				throw new Error("Email hoặc mật khẩu không đúng");
			}

			// Kiểm tra trạng thái tài khoản
			if (user.status === "inactive") {
				logWarning(`Tài khoản bị tạm ngưng: ${user.email}`);
				throw new Error(
					"Tài khoản của bạn đã bị tạm ngưng. Vui lòng liên hệ quản trị viên để được hỗ trợ."
				);
			}

			logInfo(
				`Mật khẩu hợp lệ, đang tạo JWT token cho người dùng: ${user.email}`
			);

			// Tạo JWT token
			const token = this.generateToken(user);
			logInfo(`Người dùng đã đăng nhập thành công: ${user.email}`);

			// Trả về response
			return {
				token,
				user: {
					id:
						user._id instanceof Types.ObjectId
							? user._id.toString()
							: String(user._id),
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					role: user.role,
					favorites: user.favorites,
					isEmailVerified: user.isEmailVerified,
					status: user.status,
				},
			};
		} catch (error) {
			logError("Lỗi khi đăng nhập:", error);
			throw error;
		}
	}

	/**
	 * Tạo JWT token cho người dùng đăng nhập bằng Google
	 * @param user Đối tượng người dùng từ Google
	 */
	generateTokenForUser(user: IUser): string {
		return this.generateToken(user);
	}

	/**
	 * Thêm/xóa thành phố vào danh sách yêu thích
	 * @param userId ID của người dùng
	 * @param cityId ID của thành phố
	 * @param action add hoặc remove
	 */
	async updateFavorites(
		userId: string,
		cityId: string,
		action: "add" | "remove"
	): Promise<string[]> {
		try {
			// Tìm người dùng theo ID
			const user = await User.findById(userId);
			if (!user) {
				throw new Error("Không tìm thấy người dùng");
			}

			// Cập nhật danh sách yêu thích
			if (action === "add" && !user.favorites.includes(cityId)) {
				user.favorites.push(cityId);
			} else if (action === "remove") {
				user.favorites = user.favorites.filter((id) => id !== cityId);
			}

			// Lưu thay đổi
			await user.save();
			logInfo(`Cập nhật danh sách yêu thích cho người dùng ${user.email}`);

			return user.favorites;
		} catch (error) {
			logError("Lỗi khi cập nhật danh sách yêu thích:", error);
			throw error;
		}
	}

	/**
	 * Lấy thông tin người dùng hiện tại
	 * @param userId ID của người dùng
	 */
	async getCurrentUser(userId: string): Promise<Partial<IUser> | null> {
		try {
			const user = await User.findById(userId);
			if (!user) {
				return null;
			}

			return {
				id:
					user._id instanceof Types.ObjectId
						? user._id.toString()
						: String(user._id),
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
				favorites: user.favorites,
			};
		} catch (error) {
			logError("Lỗi khi lấy thông tin người dùng:", error);
			throw error;
		}
	}

	/**
	 * Cập nhật thông tin người dùng
	 * @param userId ID của người dùng
	 * @param updateData Dữ liệu cập nhật (firstName, lastName)
	 */
	async updateProfile(
		userId: string,
		updateData: { firstName?: string; lastName?: string }
	): Promise<Partial<IUser> | null> {
		try {
			// Tìm người dùng theo ID
			const user = await User.findById(userId);
			if (!user) {
				throw new Error("Không tìm thấy người dùng");
			}

			// Cập nhật thông tin
			if (updateData.firstName !== undefined) {
				user.firstName = updateData.firstName;
			}
			if (updateData.lastName !== undefined) {
				user.lastName = updateData.lastName;
			}

			// Lưu thay đổi
			await user.save();
			logInfo(`Cập nhật thông tin cho người dùng ${user.email}`);

			return {
				id:
					user._id instanceof Types.ObjectId
						? user._id.toString()
						: String(user._id),
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
				favorites: user.favorites,
			};
		} catch (error) {
			logError("Lỗi khi cập nhật thông tin người dùng:", error);
			throw error;
		}
	}

	/**
	 * Tạo JWT token
	 * @param user Đối tượng người dùng
	 * @private
	 */
	private generateToken(user: IUser): string {
		const payload: JwtPayload = {
			userId:
				user._id instanceof Types.ObjectId
					? user._id.toString()
					: String(user._id),
			email: user.email,
			role: user.role,
		};

		const secretKey = process.env.JWT_SECRET || "your-default-secret-key";
		const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

		// Sử dụng interface SignOptions từ jsonwebtoken
		return jwt.sign(payload, secretKey, { expiresIn } as jwt.SignOptions);
	}

	/**
	 * Lấy danh sách tất cả người dùng
	 * @returns Danh sách người dùng
	 */
	async getAllUsers(): Promise<Partial<IUser>[]> {
		try {
			const users = await User.find().select("-password");

			return users.map((user) => ({
				id:
					user._id instanceof Types.ObjectId
						? user._id.toString()
						: String(user._id),
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
				favorites: user.favorites,
				status: user.status,
				isEmailVerified: user.isEmailVerified,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			}));
		} catch (error) {
			logError("Lỗi khi lấy danh sách người dùng:", error);
			throw error;
		}
	}

	/**
	 * Xóa người dùng theo ID
	 * @param userId ID của người dùng cần xóa
	 * @returns true nếu xóa thành công, false nếu không tìm thấy người dùng
	 */
	async deleteUser(userId: string): Promise<boolean> {
		try {
			// Kiểm tra định dạng ID MongoDB hợp lệ
			if (!Types.ObjectId.isValid(userId)) {
				throw new Error(`ID người dùng không hợp lệ: ${userId}`);
			}

			// Xác nhận người dùng tồn tại trước khi xóa
			const user = await User.findById(userId);
			if (!user) {
				logInfo(`Không tìm thấy người dùng với ID: ${userId}`);
				return false;
			}

			// Lưu email để ghi log sau khi xóa
			const userEmail = user.email;

			// Thực hiện xóa người dùng
			const result = await User.findByIdAndDelete(userId);

			if (result) {
				logInfo(`Đã xóa người dùng: ${userEmail} (ID: ${userId})`);
				return true;
			} else {
				logWarning(`Không thể xóa người dùng với ID: ${userId}`);
				return false;
			}
		} catch (error) {
			logError(`Lỗi khi xóa người dùng với ID ${userId}:`, error);
			throw error;
		}
	}

	/**
	 * Cập nhật vai trò của người dùng
	 * @param userId ID của người dùng
	 * @param newRole Vai trò mới (admin hoặc user)
	 * @returns Thông tin người dùng đã được cập nhật
	 */
	async updateUserRole(
		userId: string,
		newRole: string
	): Promise<Partial<IUser> | null> {
		try {
			// Kiểm tra định dạng ID MongoDB hợp lệ
			if (!Types.ObjectId.isValid(userId)) {
				throw new Error(`ID người dùng không hợp lệ: ${userId}`);
			}

			// Kiểm tra vai trò hợp lệ
			if (newRole !== "admin" && newRole !== "user") {
				throw new Error(`Vai trò không hợp lệ: ${newRole}`);
			}

			// Tìm và cập nhật người dùng
			const user = await User.findById(userId);
			if (!user) {
				logInfo(`Không tìm thấy người dùng với ID: ${userId}`);
				return null;
			}

			// Cập nhật vai trò
			user.role = newRole;
			await user.save();

			logInfo(
				`Đã cập nhật vai trò cho người dùng ${user.email} thành ${newRole}`
			);

			// Trả về thông tin người dùng đã cập nhật
			return {
				id:
					user._id instanceof Types.ObjectId
						? user._id.toString()
						: String(user._id),
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
				status: user.status,
				isEmailVerified: user.isEmailVerified,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			};
		} catch (error) {
			logError(`Lỗi khi cập nhật vai trò cho người dùng ${userId}:`, error);
			throw error;
		}
	}

	/**
	 * Cập nhật trạng thái của người dùng
	 * @param userId ID của người dùng
	 * @param newStatus Trạng thái mới (active, inactive hoặc pending)
	 * @returns Thông tin người dùng đã được cập nhật
	 */
	async updateUserStatus(
		userId: string,
		newStatus: string
	): Promise<Partial<IUser> | null> {
		try {
			// Kiểm tra định dạng ID MongoDB hợp lệ
			if (!Types.ObjectId.isValid(userId)) {
				throw new Error(`ID người dùng không hợp lệ: ${userId}`);
			}

			// Kiểm tra trạng thái hợp lệ
			if (
				newStatus !== "active" &&
				newStatus !== "inactive" &&
				newStatus !== "pending"
			) {
				throw new Error(`Trạng thái không hợp lệ: ${newStatus}`);
			}

			// Tìm và cập nhật người dùng
			const user = await User.findById(userId);
			if (!user) {
				logInfo(`Không tìm thấy người dùng với ID: ${userId}`);
				return null;
			}

			// Cập nhật trạng thái
			user.status = newStatus;
			await user.save();

			logInfo(
				`Đã cập nhật trạng thái cho người dùng ${user.email} thành ${newStatus}`
			);

			// Trả về thông tin người dùng đã cập nhật
			return {
				id:
					user._id instanceof Types.ObjectId
						? user._id.toString()
						: String(user._id),
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
				status: user.status,
				isEmailVerified: user.isEmailVerified,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			};
		} catch (error) {
			logError(`Lỗi khi cập nhật trạng thái cho người dùng ${userId}:`, error);
			throw error;
		}
	}
}

// Singleton pattern
export const authService = new AuthService();
