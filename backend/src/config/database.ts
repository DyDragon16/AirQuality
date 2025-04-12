import mongoose from "mongoose";
import { logInfo, logError } from "../utils/logger";

// Kết nối đến MongoDB
export const connectDatabase = async (): Promise<void> => {
	try {
		const mongoURI =
			process.env.MONGODB_URI || "mongodb://localhost:27017/weather-app";

		console.log("Đang cố kết nối đến MongoDB với URI:", mongoURI);

		await mongoose.connect(mongoURI);

		logInfo("Kết nối MongoDB thành công");

		// Xử lý sự kiện kết nối
		mongoose.connection.on("error", (err) => {
			logError("Lỗi kết nối MongoDB:", err);
		});

		mongoose.connection.on("disconnected", () => {
			logInfo("MongoDB bị ngắt kết nối");
		});
	} catch (error) {
		logError("Không thể kết nối đến MongoDB:", error);
		process.exit(1);
	}
};
