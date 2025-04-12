import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Nạp biến môi trường trước khi import các module khác
dotenv.config();

import weatherRoutes from "./routes/weatherRoutes";
import rankingRoutes from "./routes/rankingRoutes";
import authRoutes from "./routes/authRoutes";
import citiesRoutes from "./routes/cities";
import { cityDataService } from "./services/cityDataService";
import { connectDatabase } from "./config/database";
import { logInfo, logError } from "./utils/logger";
import { weatherDataService } from "./services/weatherDataService";
import passport from "./config/passport";

console.log("Environment variables loaded:");
console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN);
console.log("PORT:", process.env.PORT);
console.log(
	"MONGODB_URI:",
	process.env.MONGODB_URI || "mongodb://localhost:27017/weather-app"
);
console.log(
	"GOOGLE_CLIENT_ID:",
	process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set"
);

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || "http://localhost:3000",
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"Cache-Control",
			"Pragma",
			"Expires",
		],
	})
);
app.use(express.json());

// Khởi tạo Passport
app.use(passport.initialize());

// Enable pre-flight for CORS
app.options(
	"*",
	cors({
		origin: process.env.CORS_ORIGIN || "http://localhost:3000",
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"Cache-Control",
			"Pragma",
			"Expires",
		],
	})
);

// Routes
app.use("/api/weather", weatherRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cities", citiesRoutes);

// Kiểm tra các biến môi trường quan trọng
const validateEnvironmentVariables = () => {
	const requiredEnvVars = [
		"MONGODB_URI",
		"JWT_SECRET",
		"FRONTEND_URL",
		"AIRVISUAL_API_URL",
		"MAP_IMAGE_BASE_URL",
	];

	const missingVars = requiredEnvVars.filter(
		(varName) => !process.env[varName]
	);

	if (missingVars.length > 0) {
		console.error(
			"⚠️ Thiếu các biến môi trường quan trọng:",
			missingVars.join(", ")
		);
		console.error(
			"Vui lòng kiểm tra file .env.example và sao chép thành file .env với giá trị thích hợp."
		);

		// Không dừng server trong môi trường phát triển, chỉ cảnh báo
		if (process.env.NODE_ENV === "production") {
			console.error("❌ Dừng khởi động server trong môi trường production.");
			process.exit(1);
		}
	}
};

// Chạy kiểm tra biến môi trường
validateEnvironmentVariables();

// Khởi động server sau khi dữ liệu được cập nhật và DB được kết nối
const startServer = async () => {
	logInfo("Bắt đầu quy trình khởi động server...");

	try {
		// Kết nối đến MongoDB
		await connectDatabase();
		logInfo("Kết nối database thành công");

		// Đảm bảo dữ liệu được cập nhật trước khi server bắt đầu
		await cityDataService.updateData();
		logInfo("Cập nhật dữ liệu thời tiết từ API thành công");

		// Dọn dẹp dữ liệu cũ
		await weatherDataService.cleanupOldWeatherData();
		logInfo("Dọn dẹp dữ liệu cũ thành công");

		// Lưu dữ liệu thời tiết hiện tại vào database
		await weatherDataService.updateAllCitiesData();
		logInfo("Lưu dữ liệu thời tiết vào database thành công");

		// Thực hiện dọn dẹp dữ liệu cũ khi khởi động server
		weatherDataService.cleanupOldWeatherData().then(() => {
			logInfo("Đã hoàn thành dọn dẹp dữ liệu cũ khi khởi động server");
		});

		// Thiết lập tác vụ tự động nén dữ liệu hàng tuần (vào 1h sáng Chủ nhật)
		const scheduleWeeklyCompression = () => {
			const now = new Date();
			const dayOfWeek = now.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
			const hour = now.getHours();

			// Tính thời gian còn lại đến 1h sáng Chủ nhật tiếp theo
			let daysUntilSunday = 7 - dayOfWeek;
			if (dayOfWeek === 0 && hour < 1) {
				daysUntilSunday = 0;
			} else if (dayOfWeek === 0) {
				daysUntilSunday = 7;
			}

			const nextSunday = new Date();
			nextSunday.setDate(now.getDate() + daysUntilSunday);
			nextSunday.setHours(1, 0, 0, 0);

			const timeUntilNextSunday = nextSunday.getTime() - now.getTime();

			setTimeout(() => {
				// Thực hiện nén dữ liệu
				weatherDataService
					.compressWeatherData(14, 6) // Nén dữ liệu cũ hơn 14 ngày, gộp theo 6 giờ
					.then(() => {
						logInfo("Đã hoàn thành nén dữ liệu tự động hàng tuần");
						// Lên lịch cho tuần tiếp theo
						scheduleWeeklyCompression();
					})
					.catch((error) => {
						logError("Lỗi khi thực hiện nén dữ liệu tự động:", error);
						// Vẫn lên lịch cho tuần tiếp theo dù có lỗi
						scheduleWeeklyCompression();
					});
			}, timeUntilNextSunday);

			logInfo(
				`Đã lên lịch nén dữ liệu tự động vào ${nextSunday.toLocaleString()}`
			);
		};

		// Khởi động tác vụ nén dữ liệu hàng tuần
		scheduleWeeklyCompression();

		// Thiết lập tác vụ tự động dọn dẹp dữ liệu cũ mỗi ngày (vào 0h00)
		const scheduleDailyCleanup = () => {
			// ... existing code ...
		};

		// Bắt đầu lắng nghe sau khi dữ liệu đã được cập nhật
		app.listen(port, () => {
			logInfo(`Server đã được khởi động trên cổng ${port}`);
			logInfo("Sẵn sàng phục vụ requests");

			// Thiết lập cập nhật định kỳ dữ liệu thời tiết (mỗi giờ)
			setInterval(async () => {
				try {
					logInfo("Bắt đầu cập nhật dữ liệu thời tiết định kỳ");
					await weatherDataService.updateAllCitiesData();
					logInfo("Cập nhật dữ liệu thời tiết định kỳ hoàn tất");
				} catch (error) {
					logError("Lỗi khi cập nhật dữ liệu thời tiết định kỳ:", error);
				}
			}, 60 * 60 * 1000); // 1 giờ

			// Thiết lập dọn dẹp dữ liệu cũ định kỳ (mỗi ngày vào 00:00)
			setInterval(async () => {
				const now = new Date();
				if (now.getHours() === 0 && now.getMinutes() === 0) {
					try {
						logInfo("Bắt đầu quy trình dọn dẹp dữ liệu cũ định kỳ");
						await weatherDataService.cleanupOldWeatherData();
						logInfo("Dọn dẹp dữ liệu cũ định kỳ hoàn tất");
					} catch (error) {
						logError("Lỗi khi dọn dẹp dữ liệu cũ định kỳ:", error);
					}
				}
			}, 60 * 1000); // Kiểm tra mỗi phút
		});
	} catch (error) {
		logError("Lỗi khi khởi động server:", error);

		// Vẫn khởi động server ngay cả khi có lỗi
		app.listen(port, () => {
			logInfo(`Server đã khởi động trên cổng ${port} (có lỗi khởi động)`);
		});
	}
};

// Bắt đầu quá trình khởi động
startServer();
