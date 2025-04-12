import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth";
import { logError, logWarning } from "../utils/logger";
import { User } from "../models/User";

/**
 * Middleware để xác thực người dùng thông qua JWT
 */
export const authenticateUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// Lấy token từ Authorization header
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(401).json({
				success: false,
				message: "Không có token xác thực",
			});
			return;
		}

		// Lấy token từ header
		const token = authHeader.split(" ")[1];

		// Verify token
		const secretKey = process.env.JWT_SECRET || "your-default-secret-key";
		const decoded = jwt.verify(token, secretKey) as JwtPayload;

		// Kiểm tra trạng thái người dùng trong database
		const user = await User.findById(decoded.userId);
		
		if (!user) {
			res.status(401).json({
				success: false,
				message: "Người dùng không tồn tại",
				code: "user_not_found"
			});
			return;
		}
		
		// Kiểm tra nếu tài khoản bị khóa
		if (user.status === "inactive") {
			logWarning(`Người dùng bị khóa cố gắng truy cập: ${user.email}`);
			res.status(403).json({
				success: false,
				message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
				code: "account_suspended"
			});
			return;
		}

		// Gắn thông tin người dùng vào request
		// @ts-ignore - Thêm thuộc tính user vào Request
		req.user = decoded;

		next();
	} catch (error: any) {
		logError("Lỗi xác thực:", error);

		// Xử lý các loại lỗi JWT
		if (error.name === "TokenExpiredError") {
			res.status(401).json({
				success: false,
				message: "Token đã hết hạn",
				code: "token_expired"
			});
			return;
		}

		if (error.name === "JsonWebTokenError") {
			res.status(401).json({
				success: false,
				message: "Token không hợp lệ",
				code: "invalid_token"
			});
			return;
		}

		res.status(401).json({
			success: false,
			message: "Không thể xác thực người dùng",
			code: "auth_failed"
		});
	}
};

/**
 * Middleware để kiểm tra quyền admin
 */
export const checkAdminRole = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	try {
		// @ts-ignore - req.user được gắn trong middleware trước đó
		const userRole = req.user?.role;

		if (userRole !== "admin") {
			res.status(403).json({
				success: false,
				message: "Không có quyền truy cập",
			});
			return;
		}

		next();
	} catch (error) {
		logError("Lỗi kiểm tra quyền admin:", error);
		res.status(500).json({
			success: false,
			message: "Đã xảy ra lỗi khi kiểm tra quyền",
		});
	}
};

/**
 * Mở rộng interface Request để thêm user
 */
declare global {
	namespace Express {
		interface Request {
			user?: JwtPayload;
		}
	}
}
