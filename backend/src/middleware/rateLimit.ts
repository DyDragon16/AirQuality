import rateLimit from "express-rate-limit";

// Rate limiter chung cho tất cả các API routes
export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 phút
	max: 100, // Giới hạn mỗi IP đến 100 requests trong khoảng thời gian trên
	standardHeaders: true, // Trả về thông tin rate limit trong headers `RateLimit-*`
	legacyHeaders: false, // Disable headers `X-RateLimit-*`
	message: {
		status: "error",
		message: "Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút",
		timestamp: new Date().toISOString(),
	},
});

// Rate limiter riêng cho route thời tiết, cho phép nhiều request hơn
export const weatherLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 phút
	max: 30, // Giới hạn 30 requests trong 5 phút
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		status: "error",
		message:
			"Quá nhiều yêu cầu cho dịch vụ thời tiết, vui lòng thử lại sau 5 phút",
		timestamp: new Date().toISOString(),
	},
});
