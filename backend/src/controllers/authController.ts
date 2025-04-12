import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { authService } from "../services/authService";
import { logError, logInfo, logWarning } from "../utils/logger";
import { RegisterUserDto, LoginUserDto, JwtPayload } from "../types/auth";
import { Types } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Tạo transporter cho nodemailer
const transporter = nodemailer.createTransport({
	service: process.env.EMAIL_SERVICE || "gmail",
	auth: {
		user: EMAIL_USER,
		pass: EMAIL_PASS,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

// Kiểm tra kết nối email khi khởi động
transporter.verify((error) => {
	if (error) {
		logError("Lỗi kết nối email:", error);
	} else {
		logInfo("Kết nối email thành công, sẵn sàng gửi email");
	}
});

class AuthController {
	/**
	 * Đăng ký người dùng mới
	 */
	async register(req: Request, res: Response): Promise<void> {
		try {
			const userData: RegisterUserDto = req.body;

			// Validate input
			if (
				!userData.email ||
				!userData.password ||
				!userData.firstName ||
				!userData.lastName
			) {
				res.status(400).json({
					success: false,
					message: "Vui lòng điền đầy đủ thông tin",
				});
				return;
			}

			const result = await authService.register(userData);

			res.status(201).json({
				success: true,
				message: "Đăng ký thành công",
				data: result,
			});
		} catch (error: any) {
			logError("Lỗi khi đăng ký người dùng:", error);

			// Xử lý lỗi email trùng lặp
			if (error.message === "Email đã được sử dụng") {
				res.status(409).json({
					success: false,
					message: error.message,
				});
				return;
			}

			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi đăng ký",
				error: error.message,
			});
		}
	}

	/**
	 * Đăng nhập người dùng
	 */
	async login(req: Request, res: Response): Promise<void> {
		try {
			const loginData: LoginUserDto = req.body;

			// Validate input
			if (!loginData.email || !loginData.password) {
				res.status(400).json({
					success: false,
					message: "Vui lòng cung cấp email và mật khẩu",
				});
				return;
			}

			// Gọi authService để thực hiện đăng nhập
			try {
				const result = await authService.login(loginData);

				// Kiểm tra kết quả null
				if (!result) {
					res.status(500).json({
						success: false,
						message: "Lỗi đăng nhập: Không thể lấy thông tin người dùng",
					});
					return;
				}

				// Kiểm tra trạng thái tài khoản
				if (result.user.status === "pending" && !result.user.isEmailVerified) {
					res.status(403).json({
						success: false,
						message:
							"Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email và xác nhận tài khoản.",
						needVerification: true,
						email: loginData.email,
					});
					return;
				}

				res.status(200).json({
					success: true,
					message: "Đăng nhập thành công",
					data: result,
				});
			} catch (loginError: any) {
				// Xử lý lỗi thông tin đăng nhập không đúng
				if (loginError.message === "Email hoặc mật khẩu không đúng") {
					res.status(401).json({
						success: false,
						message: loginError.message,
					});
					return;
				}
				throw loginError; // Ném lại lỗi khác để xử lý ở catch bên ngoài
			}
		} catch (error: any) {
			logError("Lỗi khi đăng nhập:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi đăng nhập",
				error: error.message,
			});
		}
	}

	/**
	 * Lấy thông tin người dùng hiện tại
	 */
	async getCurrentUser(req: Request, res: Response): Promise<void> {
		try {
			// @ts-ignore - userId được gắn trong middleware
			const userId = req.user?.userId;

			if (!userId) {
				res.status(401).json({
					success: false,
					message: "Không có quyền truy cập",
				});
				return;
			}

			const user = await authService.getCurrentUser(userId);

			if (!user) {
				res.status(404).json({
					success: false,
					message: "Không tìm thấy người dùng",
				});
				return;
			}

			res.status(200).json({
				success: true,
				data: user,
			});
		} catch (error: any) {
			logError("Lỗi khi lấy thông tin người dùng:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi lấy thông tin người dùng",
				error: error.message,
			});
		}
	}

	/**
	 * Thêm thành phố vào danh sách yêu thích
	 */
	async addFavorite(req: Request, res: Response): Promise<void> {
		try {
			// @ts-ignore - userId được gắn trong middleware
			const userId = req.user?.userId;
			const { cityId } = req.params;

			if (!userId) {
				res.status(401).json({
					success: false,
					message: "Không có quyền truy cập",
				});
				return;
			}

			if (!cityId) {
				res.status(400).json({
					success: false,
					message: "Vui lòng cung cấp ID thành phố",
				});
				return;
			}

			const favorites = await authService.updateFavorites(
				userId,
				cityId,
				"add"
			);

			res.status(200).json({
				success: true,
				message: "Đã thêm thành phố vào danh sách yêu thích",
				data: { favorites },
			});
		} catch (error: any) {
			logError("Lỗi khi thêm vào danh sách yêu thích:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi thêm vào danh sách yêu thích",
				error: error.message,
			});
		}
	}

	/**
	 * Xóa thành phố khỏi danh sách yêu thích
	 */
	async removeFavorite(req: Request, res: Response): Promise<void> {
		try {
			// @ts-ignore - userId được gắn trong middleware
			const userId = req.user?.userId;
			const { cityId } = req.params;

			if (!userId) {
				res.status(401).json({
					success: false,
					message: "Không có quyền truy cập",
				});
				return;
			}

			if (!cityId) {
				res.status(400).json({
					success: false,
					message: "Vui lòng cung cấp ID thành phố",
				});
				return;
			}

			const favorites = await authService.updateFavorites(
				userId,
				cityId,
				"remove"
			);

			res.status(200).json({
				success: true,
				message: "Đã xóa thành phố khỏi danh sách yêu thích",
				data: { favorites },
			});
		} catch (error: any) {
			logError("Lỗi khi xóa khỏi danh sách yêu thích:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi xóa khỏi danh sách yêu thích",
				error: error.message,
			});
		}
	}

	/**
	 * Cập nhật thông tin người dùng
	 */
	async updateProfile(req: Request, res: Response): Promise<void> {
		try {
			// @ts-ignore - userId được gắn trong middleware
			const userId = req.user?.userId;
			const { firstName, lastName } = req.body;

			if (!userId) {
				res.status(401).json({
					success: false,
					message: "Không có quyền truy cập",
				});
				return;
			}

			// Validate dữ liệu
			if (firstName === undefined && lastName === undefined) {
				res.status(400).json({
					success: false,
					message: "Vui lòng cung cấp ít nhất một trường để cập nhật",
				});
				return;
			}

			// Cập nhật thông tin
			const updatedUser = await authService.updateProfile(userId, {
				firstName,
				lastName,
			});

			if (!updatedUser) {
				res.status(404).json({
					success: false,
					message: "Không tìm thấy người dùng",
				});
				return;
			}

			res.status(200).json({
				success: true,
				message: "Cập nhật thông tin thành công",
				data: updatedUser,
			});
		} catch (error: any) {
			logError("Lỗi khi cập nhật thông tin người dùng:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi cập nhật thông tin",
				error: error.message,
			});
		}
	}

	/**
	 * Xử lý callback từ Google sau khi xác thực thành công
	 */
	async googleAuthCallback(req: Request, res: Response): Promise<void> {
		try {
			// req.user được gán bởi passport sau khi xác thực Google
			// @ts-ignore - user được gắn bởi passport
			const user = req.user as IUser;

			if (!user) {
				res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
				return;
			}

			// Kiểm tra trạng thái tài khoản
			if (user.status === "inactive") {
				logWarning(`Tài khoản Google bị tạm ngưng: ${user.email}`);
				res.redirect(`${FRONTEND_URL}/login?error=account_suspended`);
				return;
			}
			
			// Tạo JWT token
			const token = authService.generateTokenForUser(user);

			// Chuyển hướng về frontend với token
			res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
		} catch (error: any) {
			logError("Lỗi trong quá trình xác thực Google:", error);
			res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
		}
	}

	/**
	 * Xử lý quên mật khẩu
	 */
	async forgotPassword(req: Request, res: Response): Promise<void> {
		try {
			const { email } = req.body;

			if (!email) {
				res.status(400).json({
					success: false,
					message: "Vui lòng cung cấp email",
				});
				return;
			}

			// Tìm người dùng theo email
			const user = await User.findOne({ email });

			if (!user) {
				// Vẫn trả về phản hồi thành công để tránh rò rỉ thông tin
				res.status(200).json({
					success: true,
					message: "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi",
				});
				return;
			}

			// Tạo token đặt lại mật khẩu
			const resetToken = crypto.randomBytes(32).toString("hex");
			
			// Băm token để lưu vào database
			const hashedToken = crypto
				.createHash("sha256")
				.update(resetToken)
				.digest("hex");
				
			user.resetPasswordToken = hashedToken;
			user.resetPasswordExpires = new Date(Date.now() + 24 * 3600000); // 24 giờ thay vì 1 giờ

			await user.save();

			// Tạo URL đặt lại mật khẩu
			const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

			// Gửi email
			const mailOptions = {
				from: EMAIL_USER,
				to: user.email,
				subject: "Đặt lại mật khẩu của bạn",
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
						<h1 style="color: #4F46E5; text-align: center;">Đặt lại mật khẩu</h1>
						<p>Xin chào ${user.firstName},</p>
						<p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
						<p>Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu của bạn:</p>
						
						<div style="text-align: center; margin: 30px 0;">
							<a href="${resetUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đặt lại mật khẩu</a>
						</div>
						
						<p><strong>Lưu ý:</strong> Liên kết này sẽ hết hạn sau 24 giờ.</p>
						<p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với quản trị viên nếu bạn có câu hỏi.</p>
						
						<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; text-align: center; color: #666; font-size: 12px;">
							<p>© 2025 Air Quality. Tất cả các quyền được bảo lưu.</p>
						</div>
					</div>
				`,
			};

			await transporter.sendMail(mailOptions);

			res.status(200).json({
				success: true,
				message: "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn",
			});
		} catch (error: any) {
			logError("Lỗi quên mật khẩu:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi xử lý yêu cầu đặt lại mật khẩu",
				error: error.message,
			});
		}
	}

	/**
	 * Kiểm tra token reset password
	 */
	async checkResetToken(req: Request, res: Response): Promise<void> {
		try {
			const { token } = req.query;

			if (!token || typeof token !== "string") {
				res.status(400).json({
					success: false,
					message: "Token không hợp lệ",
					valid: false,
				});
				return;
			}

			// Hash token để kiểm tra
			const hashedToken = crypto
				.createHash("sha256")
				.update(token)
				.digest("hex");

			// Tìm người dùng với token và chưa hết hạn
			const user = await User.findOne({
				resetPasswordToken: hashedToken,
				resetPasswordExpires: { $gt: Date.now() },
			});

			res.status(200).json({
				success: true,
				valid: !!user,
			});
		} catch (error: any) {
			logError("Lỗi khi kiểm tra token:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi kiểm tra token",
				valid: false,
				error: error.message,
			});
		}
	}

	/**
	 * Thiết lập/đặt lại mật khẩu với token
	 */
	async resetPassword(req: Request, res: Response): Promise<void> {
		try {
			const { token, password } = req.body;

			if (!token || !password) {
				res.status(400).json({
					success: false,
					message: "Vui lòng cung cấp đầy đủ thông tin",
				});
				return;
			}

			// Hash token để kiểm tra
			const hashedToken = crypto
				.createHash("sha256")
				.update(token)
				.digest("hex");

			// Tìm người dùng với token và chưa hết hạn
			const user = await User.findOne({
				resetPasswordToken: hashedToken,
				resetPasswordExpires: { $gt: Date.now() },
			});

			if (!user) {
				res.status(400).json({
					success: false,
					message: "Token không hợp lệ hoặc đã hết hạn",
				});
				return;
			}

			// Cập nhật mật khẩu và xóa token
			user.password = password;
			user.resetPasswordToken = undefined;
			user.resetPasswordExpires = undefined;
			// Cập nhật trạng thái người dùng thành active nếu đang ở trạng thái pending
			if (user.status === "pending") {
				user.status = "active";
			}
			await user.save();

			res.status(200).json({
				success: true,
				message: "Mật khẩu đã được thiết lập thành công",
			});
		} catch (error: any) {
			logError("Lỗi khi thiết lập mật khẩu:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi thiết lập mật khẩu",
				error: error.message,
			});
		}
	}

	/**
	 * Lấy danh sách tất cả người dùng (chỉ admin)
	 */
	async getAllUsers(req: Request, res: Response): Promise<void> {
		try {
			// Bỏ kiểm tra quyền admin tạm thời
			// @ts-ignore - role được gắn trong middleware authenticateUser
			// const userRole = req.user?.role;

			// if (userRole !== "admin") {
			// 	res.status(403).json({
			// 		success: false,
			// 		message: "Không có quyền truy cập",
			// 	});
			// 	return;
			// }

			const users = await authService.getAllUsers();

			res.status(200).json({
				success: true,
				data: users,
			});
		} catch (error: any) {
			logError("Lỗi khi lấy danh sách người dùng:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi lấy danh sách người dùng",
				error: error.message,
			});
		}
	}

	/**
	 * Xóa người dùng theo ID (chỉ admin)
	 */
	async deleteUser(req: Request, res: Response): Promise<void> {
		try {
			// Bỏ kiểm tra quyền admin tạm thời
			// @ts-ignore - role được gắn trong middleware authenticateUser
			// const userRole = req.user?.role;

			// if (userRole !== "admin") {
			// 	res.status(403).json({
			// 		success: false,
			// 		message: "Không có quyền truy cập",
			// 	});
			// 	return;
			// }

			const userId = req.params.id;
			if (!userId) {
				res.status(400).json({
					success: false,
					message: "ID người dùng không hợp lệ",
				});
				return;
			}

			const result = await authService.deleteUser(userId);

			if (!result) {
				res.status(404).json({
					success: false,
					message: "Không tìm thấy người dùng",
				});
				return;
			}

			res.status(200).json({
				success: true,
				message: "Xóa người dùng thành công",
			});
		} catch (error: any) {
			logError("Lỗi khi xóa người dùng:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi xóa người dùng",
				error: error.message,
				details: error.stack || "Không có thông tin chi tiết",
			});
		}
	}

	/**
	 * Cập nhật vai trò người dùng (chỉ admin)
	 */
	async updateUserRole(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { role } = req.body;

			if (!id || !role) {
				res.status(400).json({
					success: false,
					message: "Thiếu ID người dùng hoặc vai trò mới",
				});
				return;
			}

			// Kiểm tra vai trò hợp lệ
			if (role !== "admin" && role !== "user") {
				res.status(400).json({
					success: false,
					message: "Vai trò không hợp lệ. Vui lòng chọn 'admin' hoặc 'user'",
				});
				return;
			}

			const updatedUser = await authService.updateUserRole(id, role);

			if (!updatedUser) {
				res.status(404).json({
					success: false,
					message: "Không tìm thấy người dùng",
				});
				return;
			}

			res.status(200).json({
				success: true,
				message: "Cập nhật vai trò người dùng thành công",
				data: updatedUser
			});
		} catch (error: any) {
			logError("Lỗi khi cập nhật vai trò người dùng:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi cập nhật vai trò người dùng",
				error: error.message
			});
		}
	}

	/**
	 * Cập nhật trạng thái người dùng (chỉ admin)
	 */
	async updateUserStatus(req: Request, res: Response): Promise<void> {
		try {
			const { id } = req.params;
			const { status } = req.body;

			if (!id || !status) {
				res.status(400).json({
					success: false,
					message: "Thiếu ID người dùng hoặc trạng thái mới",
				});
				return;
			}

			// Kiểm tra trạng thái hợp lệ
			if (status !== "active" && status !== "inactive" && status !== "pending") {
				res.status(400).json({
					success: false,
					message: "Trạng thái không hợp lệ. Vui lòng chọn 'active', 'inactive' hoặc 'pending'",
				});
				return;
			}

			const updatedUser = await authService.updateUserStatus(id, status);

			if (!updatedUser) {
				res.status(404).json({
					success: false,
					message: "Không tìm thấy người dùng",
				});
				return;
			}

			res.status(200).json({
				success: true,
				message: "Cập nhật trạng thái người dùng thành công",
				data: updatedUser
			});
		} catch (error: any) {
			logError("Lỗi khi cập nhật trạng thái người dùng:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi cập nhật trạng thái người dùng",
				error: error.message
			});
		}
	}

	/**
	 * Tạo người dùng mới và gửi email mời
	 */
	async inviteUser(req: Request, res: Response): Promise<void> {
		try {
			const { email, firstName, lastName, role } = req.body;

			// Validate input
			if (!email || !firstName || !lastName) {
				res.status(400).json({
					success: false,
					message: "Vui lòng cung cấp đầy đủ thông tin",
				});
				return;
			}

			// Kiểm tra email đã tồn tại chưa
			const existingUser = await User.findOne({ email });
			if (existingUser) {
				res.status(409).json({
					success: false,
					message: "Email đã được sử dụng",
				});
				return;
			}

			// Tạo token reset password ngẫu nhiên
			const resetToken = crypto.randomBytes(32).toString("hex");

			// Hash token trước khi lưu vào DB
			const hashedToken = crypto
				.createHash("sha256")
				.update(resetToken)
				.digest("hex");

			// Thời gian hết hạn: 24 giờ
			const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

			// Tạo người dùng mới với token reset password
			const newUser = new User({
				email,
				firstName,
				lastName,
				role: role || "user",
				status: "pending", // Người dùng mới sẽ có trạng thái chờ xác nhận
				resetPasswordToken: hashedToken,
				resetPasswordExpires: resetExpires,
				// Đặt mật khẩu tạm thời (sẽ được thay đổi khi người dùng thiết lập mật khẩu)
				password: crypto.randomBytes(20).toString("hex"),
			});

			// Lưu vào database
			const savedUser = await newUser.save();
			logInfo(`Người dùng mới đã được tạo bởi admin: ${savedUser.email}`);

			// Tạo URL reset password
			const resetUrl = `${FRONTEND_URL}/auth/set-password?token=${resetToken}`;

			// Chuẩn bị email mời
			const mailOptions = {
				from: EMAIL_USER,
				to: email,
				subject: "Mời tham gia hệ thống Air Quality",
				html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
					<h1 style="color: #4F46E5; text-align: center;">Chào mừng bạn đến với hệ thống Air Quality!</h1>
					<p>Xin chào ${firstName} ${lastName},</p>
					<p>Bạn đã được thêm vào hệ thống Air Quality với vai trò ${
						role === "admin" ? "Quản trị viên" : "Người dùng"
					}.</p>
					<p>Vui lòng nhấp vào nút bên dưới để thiết lập mật khẩu của bạn:</p>
					
					<div style="text-align: center; margin: 30px 0;">
						<a href="${resetUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Thiết lập mật khẩu</a>
					</div>
					
					<p><strong>Lưu ý:</strong> Liên kết này sẽ hết hạn sau 24 giờ.</p>
					<p>Nếu bạn không yêu cầu tham gia, vui lòng bỏ qua email này.</p>
					<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; text-align: center; color: #666; font-size: 12px;">
						<p>© 2025 Air Quality. Tất cả các quyền được bảo lưu.</p>
					</div>
				</div>
				`,
			};

			// Gửi email nhưng xử lý lỗi riêng - nếu gửi email thất bại, vẫn trả về success
			try {
				await transporter.sendMail(mailOptions);
				logInfo(`Email mời đã được gửi tới: ${email}`);
			} catch (emailError: any) {
				// Ghi log lỗi gửi email nhưng không báo lỗi cho client
				logError(`Lỗi khi gửi email đến ${email}:`, emailError);
			}

			// Phản hồi thành công cho client
			res.status(201).json({
				success: true,
				message: "Đã tạo người dùng và gửi email mời thành công",
				data: {
					user: {
						id: savedUser._id,
						email: savedUser.email,
						firstName: savedUser.firstName,
						lastName: savedUser.lastName,
						role: savedUser.role,
						status: "pending",
						favorites: savedUser.favorites,
						createdAt: savedUser.createdAt,
						updatedAt: savedUser.updatedAt,
					},
				},
			});
		} catch (error: any) {
			logError("Lỗi khi mời người dùng:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi mời người dùng",
				error: error.message,
			});
		}
	}

	/**
	 * Xác nhận email người dùng
	 */
	async verifyEmail(req: Request, res: Response): Promise<void> {
		try {
			const { token, email } = req.body;
			
			// Ghi log chi tiết thông tin nhận được
			logInfo(`Nhận yêu cầu xác thực email: ${email}, token: ${token ? token.substring(0, 10) + '...' : 'không có'}`);

			if (!token || !email) {
				logWarning(`Yêu cầu xác thực email thiếu dữ liệu. Token: ${!!token}, Email: ${!!email}`);
				res.status(400).json({
					success: false,
					message: "Vui lòng cung cấp token và email",
				});
				return;
			}

			await authService.verifyEmail({ token, email });

			logInfo(`Xác nhận email thành công cho: ${email}`);
			res.status(200).json({
				success: true,
				message: "Xác nhận email thành công",
			});
		} catch (error: any) {
			logError(`Lỗi khi xác nhận email cho ${req.body?.email || 'unknown'}: ${error.message}`);
			res.status(400).json({
				success: false,
				message: error.message || "Xác nhận email thất bại",
			});
		}
	}

	/**
	 * Gửi lại email xác nhận
	 */
	async resendVerificationEmail(req: Request, res: Response): Promise<void> {
		try {
			const { email } = req.body;

			if (!email) {
				res.status(400).json({
					success: false,
					message: "Vui lòng cung cấp email",
				});
				return;
			}

			await authService.resendVerificationEmail(email);

			res.status(200).json({
				success: true,
				message: "Đã gửi lại email xác nhận",
			});
		} catch (error: any) {
			logError("Lỗi khi gửi lại email xác nhận:", error);
			res.status(400).json({
				success: false,
				message: error.message || "Gửi lại email xác nhận thất bại",
			});
		}
	}

	/**
	 * Kiểm tra nếu tài khoản tồn tại
	 */
	async checkAccountExists(req: Request, res: Response): Promise<void> {
		try {
			const { email } = req.query;
			
			if (!email) {
				res.status(400).json({
					success: false,
					message: "Vui lòng cung cấp email",
					exists: false
				});
				return;
			}
			
			// Kiểm tra người dùng còn tồn tại trong DB không
			const user = await User.findOne({ email: email.toString() });
			
			if (!user) {
				// Người dùng không tồn tại trong DB (có thể đã bị xóa)
				res.status(404).json({
					success: false,
					message: "Tài khoản của bạn không còn tồn tại hoặc đã bị xóa",
					exists: false
				});
				return;
			}
			
			// Tài khoản tồn tại
			res.status(200).json({
				success: true,
				message: "Tài khoản tồn tại",
				exists: true
			});
		} catch (error: any) {
			logError("Lỗi khi kiểm tra tài khoản:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi kiểm tra tài khoản",
				error: error.message,
				exists: false
			});
		}
	}
}

// Singleton pattern
export default new AuthController();
