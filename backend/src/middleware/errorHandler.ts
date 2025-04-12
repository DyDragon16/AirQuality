import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logger";

export interface AppError extends Error {
	statusCode?: number;
	code?: string;
	isOperational?: boolean;
}

// Middleware xử lý lỗi
export const errorHandler = (
	err: AppError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Nếu đã xử lý response, bỏ qua
	if (res.headersSent) {
		return next(err);
	}

	// Lấy thông tin request
	const { method, originalUrl, ip } = req;

	// Ghi log lỗi
	logError(`Error processing request: ${method} ${originalUrl}`, err, {
		ip,
		statusCode: err.statusCode || 500,
		code: err.code,
	});

	// Mặc định status code 500 nếu không có
	const statusCode = err.statusCode || 500;

	// Định dạng thông báo lỗi
	const errorResponse = {
		status: "error",
		message: err.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.",
		code: err.code || "INTERNAL_ERROR",
		timestamp: new Date().toISOString(),
		path: originalUrl,
	};

	// Chỉ trả về stack trace trong development
	if (process.env.NODE_ENV !== "production" && err.stack) {
		Object.assign(errorResponse, { stack: err.stack.split("\n") });
	}

	res.status(statusCode).json(errorResponse);
};

// Tạo AppError có gắn các thuộc tính phù hợp
export const createAppError = (
	message: string,
	statusCode = 500,
	code = "INTERNAL_ERROR",
	isOperational = true
): AppError => {
	const error = new Error(message) as AppError;
	error.statusCode = statusCode;
	error.code = code;
	error.isOperational = isOperational;
	return error;
};

// Các helpers hữu ích
export const notFoundError = (entity: string) =>
	createAppError(`${entity} không tìm thấy`, 404, "NOT_FOUND");

export const badRequestError = (message: string) =>
	createAppError(message, 400, "BAD_REQUEST");

export const unauthorizedError = () =>
	createAppError("Bạn không có quyền truy cập", 401, "UNAUTHORIZED");

export const rateLimitError = () =>
	createAppError(
		"Quá nhiều yêu cầu. Vui lòng thử lại sau.",
		429,
		"TOO_MANY_REQUESTS"
	);
