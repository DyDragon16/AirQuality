import express, { Request, Response, NextFunction, Express } from "express";
import cors from "cors";
import compression from "compression";
import env from "./config/env";
import weatherRoutes from "./routes/weatherRoutes";
import citiesRouter from "./routes/cities";
import weatherUpdatesRouter from "./routes/weather";
import { apiLimiter, weatherLimiter } from "./middleware/rateLimit";
import { errorHandler } from "./middleware/errorHandler";
import { logInfo, logError, logWarning } from "./utils/logger";
import authRoutes from "./routes/authRoutes";
import timescaleRoutes from "./routes/timescaleRoutes";
import passport from "./config/passport";
import { verifyEmailConnection } from "./utils/emailService";
import { timescaleService } from "./services/timescaleService";
import { dataSyncService } from "./services/dataSyncService";

// Khởi tạo Express app
const app: Express = express();

// Middleware
app.use(express.json());

// Cấu hình CORS được cải thiện - sử dụng giá trị từ env thay vì wildcard
app.use(
	cors({
		origin: env.corsOrigin, // Sử dụng giá trị từ cấu hình môi trường
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"Cache-Control",
			"Pragma",
			"Expires",
		],
		credentials: true,
	})
);

// Khởi tạo Passport
app.use(passport.initialize());

// Log request
app.use((req: Request, res: Response, next: NextFunction) => {
	logInfo(`${req.method} ${req.originalUrl}`, {
		ip: req.ip,
		userAgent: req.get("user-agent"),
	});
	next();
});

// Thêm compression middleware để giảm kích thước response
app.use(compression());

// Rate limiting middleware
app.use("/api/", apiLimiter); // Áp dụng limiter chung cho tất cả API

// Tổ chức lại routes với cấu trúc rõ ràng
// 1. Routes API chính
app.use("/api/cities", citiesRouter);
// 2. Routes thời tiết chính với ID ngắn (như hanoi, hochiminh)
app.use("/api", weatherRoutes);
// 3. Routes cập nhật thời tiết với cấu trúc /api/weather/...
app.use("/api/weather", weatherLimiter, weatherUpdatesRouter); // Áp dụng limiter riêng
app.use("/api/auth", authRoutes);
// 4. Routes cho TimescaleDB
app.use("/api/timescale", timescaleRoutes);

// Health check endpoint
app.get("/health", (_: Request, res: Response) => {
	res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Kiểm tra kết nối email khi khởi động ứng dụng
verifyEmailConnection();

// Khởi tạo TimescaleDB và đồng bộ dữ liệu với retry logic
const initializeTimescaleAndSync = async (retryCount = 0, maxRetries = 5) => {
	try {
		// Kiểm tra kết nối đến TimescaleDB
		const connected = await timescaleService.testConnection();

		if (connected) {
			logInfo("Kết nối đến TimescaleDB thành công");

			// Khởi tạo quá trình đồng bộ dữ liệu
			try {
				await dataSyncService.initialize();
				logInfo("Đã khởi tạo quá trình đồng bộ dữ liệu với TimescaleDB");
			} catch (syncError) {
				logError("Lỗi khi khởi tạo quá trình đồng bộ dữ liệu", syncError);
				// Không retry ở đây vì dataSyncService đã có retry logic riêng
			}
		} else {
			logWarning(
				`Không thể kết nối đến TimescaleDB (lần thử ${
					retryCount + 1
				}/${maxRetries})`
			);

			// Thử lại nếu chưa đạt số lần tối đa
			if (retryCount < maxRetries) {
				const delay = Math.min(1000 * Math.pow(1.5, retryCount), 30000); // Exponential backoff
				logInfo(`Thử kết nối lại sau ${delay}ms...`);

				setTimeout(() => {
					initializeTimescaleAndSync(retryCount + 1, maxRetries);
				}, delay);
			} else {
				logError(
					`Đã thử kết nối TimescaleDB ${maxRetries} lần không thành công. Ứng dụng sẽ tiếp tục với MongoDB.`
				);
			}
		}
	} catch (error) {
		logError("Lỗi không mong đợi khi khởi tạo TimescaleDB", error);

		// Thử lại nếu chưa đạt số lần tối đa
		if (retryCount < maxRetries) {
			const delay = Math.min(1000 * Math.pow(1.5, retryCount), 30000);
			logInfo(`Thử kết nối lại sau ${delay}ms...`);

			setTimeout(() => {
				initializeTimescaleAndSync(retryCount + 1, maxRetries);
			}, delay);
		} else {
			logError(
				`Đã thử kết nối TimescaleDB ${maxRetries} lần không thành công. Ứng dụng sẽ tiếp tục với MongoDB.`
			);
		}
	}
};

// Bắt đầu quá trình khởi tạo
initializeTimescaleAndSync();

// Error handling cho lỗi không bắt được
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	// Chuyển tới error handler middleware
	errorHandler(err, req, res, next);
});

// 404 handler - nếu không có route nào khớp
app.use((req: Request, res: Response) => {
	logInfo(`Route not found: ${req.method} ${req.originalUrl}`, { ip: req.ip });
	res.status(404).json({
		status: "failed",
		data: {
			message: "Route not found",
			path: req.originalUrl,
		},
		timestamp: new Date().toISOString(),
	});
});

// Graceful shutdown
const gracefulShutdown = () => {
	logInfo("Nhận tín hiệu tắt, đóng các kết nối...");

	// Đóng kết nối TimescaleDB
	timescaleService.close().catch((err) => {
		logError("Lỗi khi đóng kết nối TimescaleDB", err);
	});

	// Hủy các tác vụ đồng bộ đang chạy
	dataSyncService.destroy();

	logInfo("Đã đóng tất cả kết nối, thoát process...");
	process.exit(0);
};

// Bắt các sự kiện tắt
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

process.on("unhandledRejection", (reason: any) => {
	logError(
		"Unhandled Rejection",
		reason instanceof Error ? reason : new Error(String(reason))
	);
});

process.on("uncaughtException", (error: Error) => {
	logError("Uncaught Exception", error);
	// Thoát process sau khi log lỗi nghiêm trọng
	process.exit(1);
});

export default app;
