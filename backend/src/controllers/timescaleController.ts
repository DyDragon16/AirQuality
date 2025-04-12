import { Request, Response } from "express";
import { timescaleService } from "../services/timescaleService";
import { logInfo, logError } from "../utils/logger";

/**
 * Controller xử lý các yêu cầu liên quan đến TimescaleDB
 */
class TimescaleController {
	/**
	 * Kiểm tra kết nối đến TimescaleDB
	 */
	async checkConnection(req: Request, res: Response): Promise<void> {
		try {
			const connectionStatus = await timescaleService.testConnection();

			res.status(200).json({
				success: connectionStatus,
				message: connectionStatus
					? "Kết nối đến TimescaleDB thành công"
					: "Kết nối đến TimescaleDB thất bại",
			});
		} catch (error) {
			logError("Lỗi kiểm tra kết nối TimescaleDB", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi kiểm tra kết nối TimescaleDB",
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	/**
	 * Khởi tạo cấu trúc bảng trong TimescaleDB
	 */
	async initializeDatabase(req: Request, res: Response): Promise<void> {
		try {
			await timescaleService.initializeWeatherTable();

			res.status(200).json({
				success: true,
				message: "Đã khởi tạo cấu trúc bảng trong TimescaleDB thành công",
			});
		} catch (error) {
			logError("Lỗi khởi tạo TimescaleDB", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi khởi tạo cấu trúc bảng trong TimescaleDB",
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	/**
	 * Lấy lịch sử thời tiết từ TimescaleDB
	 */
	async getWeatherHistory(req: Request, res: Response): Promise<void> {
		try {
			const { cityId } = req.params;
			const days = req.query.days ? parseInt(req.query.days as string) : 7;

			if (!cityId) {
				res.status(400).json({
					success: false,
					message: "Thiếu tham số cityId",
				});
				return;
			}

			// Giới hạn số ngày tối đa có thể truy vấn
			const maxDays = 90;
			const actualDays = Math.min(days, maxDays);

			const historyData = await timescaleService.getWeatherHistory(
				cityId,
				actualDays
			);

			res.status(200).json({
				success: true,
				data: {
					cityId,
					days: actualDays,
					totalRecords: historyData.length,
					history: historyData,
					timestamp: new Date(),
				},
			});
		} catch (error) {
			logError("Lỗi lấy lịch sử thời tiết từ TimescaleDB", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi lấy lịch sử thời tiết",
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	/**
	 * Lấy xếp hạng AQI của các thành phố từ TimescaleDB
	 */
	async getAQIRanking(req: Request, res: Response): Promise<void> {
		try {
			const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
			const ranking = await timescaleService.getAQIRanking(limit);

			res.status(200).json({
				success: true,
				data: {
					timestamp: new Date(),
					ranking,
				},
			});
		} catch (error) {
			logError("Lỗi lấy xếp hạng AQI từ TimescaleDB", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi lấy xếp hạng AQI",
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}
}

export default new TimescaleController();
