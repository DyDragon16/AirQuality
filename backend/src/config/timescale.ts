import env from "./env";

/**
 * Cấu hình kết nối TimescaleDB
 * Chuỗi kết nối mẫu: postgres://user:password@host:port/database?sslmode=require
 */
const timescaleConfig = {
	// Sử dụng biến môi trường hoặc chuỗi kết nối mặc định
	connectionString: env.timescaleDbUrl,
	ssl: {
		rejectUnauthorized: false, // Điều chỉnh tùy theo yêu cầu bảo mật
	},
	// Cấu hình pool kết nối
	pool: {
		max: env.timescalePoolMax || 20, // Tăng số kết nối tối đa
		min: env.timescalePoolMin || 5, // Tăng số kết nối tối thiểu để giảm thời gian khởi tạo
		idleTimeoutMillis: env.timescaleIdleTimeout || 30000, // Thời gian chờ trước khi đóng kết nối không sử dụng
		acquireTimeoutMillis: env.timescaleAcquireTimeout || 8000, // Thời gian timeout khi lấy kết nối mới
	},
	// Thêm cấu hình retry cho kết nối
	retry: {
		retries: 5, // Số lần thử lại tối đa
		factor: 1.5, // Hệ số tăng thời gian giữa các lần thử
		minTimeout: 1000, // Thời gian tối thiểu giữa các lần thử (ms)
		maxTimeout: 10000, // Thời gian tối đa giữa các lần thử (ms)
	},
};

export default timescaleConfig;
