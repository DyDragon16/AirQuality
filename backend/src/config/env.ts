import dotenv from "dotenv";
import crypto from "crypto";

/**
 * Tải biến môi trường từ file .env
 * Đảm bảo file .env đã được tạo dựa trên .env.example
 */
dotenv.config();

/**
 * Tạo một JWT secret ngẫu nhiên nếu không được cung cấp
 * CẢNH BÁO: Điều này chỉ nên sử dụng trong môi trường phát triển
 * Trong sản xuất, luôn đặt JWT_SECRET trong biến môi trường
 */
const generateRandomSecret = () => {
	console.warn(
		"CẢNH BÁO: Sử dụng JWT secret ngẫu nhiên. Trong môi trường sản xuất, hãy đặt JWT_SECRET trong .env"
	);
	return crypto.randomBytes(64).toString("hex");
};

/**
 * Cấu hình môi trường tập trung
 * Các giá trị mặc định chỉ được sử dụng trong môi trường phát triển
 */
const env = {
	// Cổng server Express
	port: parseInt(process.env.PORT || "4000"),

	// URL API AirVisual để lấy dữ liệu thời tiết
	airvisualApiUrl:
		process.env.AIRVISUAL_API_URL || "https://website-api.airvisual.com/v1",

	// CORS origin cho frontend
	corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",

	// Thông tin xác thực Google OAuth
	googleClientID: process.env.GOOGLE_CLIENT_ID || "",
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
	googleCallbackURL:
		process.env.GOOGLE_CALLBACK_URL ||
		"http://localhost:4000/api/auth/google/callback",

	// URL của frontend
	frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

	// JWT secret để tạo và xác minh tokens
	// Trong sản xuất, hãy luôn đặt biến môi trường JWT_SECRET
	jwtSecret: process.env.JWT_SECRET || generateRandomSecret(),

	// URL cơ sở cho hình ảnh bản đồ
	mapImageBaseUrl:
		process.env.MAP_IMAGE_BASE_URL ||
		"https://www.iqair.com/dl/web/nav/world-air-quality",

	// Tần suất cập nhật dữ liệu thời tiết (tính bằng phút)
	weatherUpdateInterval: parseInt(process.env.WEATHER_UPDATE_INTERVAL || "60"),

	// Thời gian tối đa để lưu cache (tính bằng giờ)
	maxCacheAgeHours: parseInt(process.env.MAX_CACHE_AGE_HOURS || "48"),

	// Số lần thử lại tối đa khi gọi API thất bại
	maxApiRetries: parseInt(process.env.MAX_API_RETRIES || "2"),

	// TimescaleDB URL - cấu hình kết nối đến TimescaleDB
	timescaleDbUrl:
		process.env.TIMESCALE_DB_URL ||
		"postgres://username:password@localhost:5432/tsdb",

	// TimescaleDB retention policy - thời gian lưu giữ dữ liệu chi tiết (theo ngày)
	timescaleRetentionDays: parseInt(
		process.env.TIMESCALE_RETENTION_DAYS || "90"
	),

	// Cấu hình compression TimescaleDB - thời điểm nén dữ liệu (theo ngày)
	timescaleCompressAfterDays: parseInt(
		process.env.TIMESCALE_COMPRESS_AFTER_DAYS || "7"
	),

	// Cấu hình connection pool cho TimescaleDB
	timescalePoolMax: parseInt(process.env.TIMESCALE_POOL_MAX || "20"),
	timescalePoolMin: parseInt(process.env.TIMESCALE_POOL_MIN || "5"),
	timescaleIdleTimeout: parseInt(process.env.TIMESCALE_IDLE_TIMEOUT || "30000"),
	timescaleAcquireTimeout: parseInt(
		process.env.TIMESCALE_ACQUIRE_TIMEOUT || "8000"
	),

	// Cấu hình đồng bộ MongoDB và TimescaleDB
	syncBatchSize: parseInt(process.env.SYNC_BATCH_SIZE || "100"),
	syncIntervalMinutes: parseInt(process.env.SYNC_INTERVAL_MINUTES || "15"),
};

export default env;
