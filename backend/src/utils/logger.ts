import winston from "winston";
import path from "path";
import fs from "fs";

// Tạo thư mục logs nếu chưa tồn tại
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir);
}

// Định dạng log
const logFormat = winston.format.printf(
	({ level, message, timestamp, ...meta }) => {
		return `${timestamp} [${level.toUpperCase()}]: ${message} ${
			Object.keys(meta).length ? JSON.stringify(meta) : ""
		}`;
	}
);

// Tạo logger instance
const logger = winston.createLogger({
	level: process.env.NODE_ENV === "production" ? "info" : "debug",
	format: winston.format.combine(
		winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		logFormat
	),
	defaultMeta: { service: "weather-api" },
	transports: [
		// Console transport
		new winston.transports.Console({
			format: winston.format.combine(winston.format.colorize(), logFormat),
		}),
		// File transport cho các errors
		new winston.transports.File({
			filename: path.join(logDir, "error.log"),
			level: "error",
			maxsize: 5242880, // 5MB
			maxFiles: 5,
		}),
		// File transport cho tất cả các logs
		new winston.transports.File({
			filename: path.join(logDir, "combined.log"),
			maxsize: 5242880, // 5MB
			maxFiles: 5,
		}),
	],
	exitOnError: false,
});

// Export functions để dễ sử dụng
export const logInfo = (message: string, data?: any): void => {
	const timestamp = new Date().toISOString();
	console.log(`[INFO] ${timestamp}: ${message}`);
	if (data) {
		console.log(data);
	}
};

export const logWarning = (message: string, data?: any): void => {
	const timestamp = new Date().toISOString();
	console.warn(`[WARNING] ${timestamp}: ${message}`);
	if (data) {
		console.warn(data);
	}
};

export const logError = (message: string, error?: any): void => {
	const timestamp = new Date().toISOString();
	console.error(`[ERROR] ${timestamp}: ${message}`);
	if (error) {
		console.error(error);
	}
};

export const logDebug = (message: string, data?: any): void => {
	const timestamp = new Date().toISOString();
	console.debug(`[DEBUG] ${timestamp}: ${message}`);
	if (data) {
		console.debug(data);
	}
};

export default logger;
