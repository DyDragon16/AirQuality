import { Request, Response } from "express";
import { weatherDataService } from "../services/weatherDataService";
import { logInfo, logError } from "../utils/logger";
import { WeatherRecord } from "../models/WeatherRecord";

/**
 * Controller cho các API ranking
 */
class RankingController {
	/**
	 * Lấy ranking chất lượng không khí 
	 */
	async getAQIRanking(req: Request, res: Response): Promise<void> {
		try {
			// Lấy thông số limit từ query parameter
			const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

			logInfo(`Đang lấy ranking AQI với limit=${limit}`);

			// Kiểm tra số lượng bản ghi trong DB
			const recordCount = await WeatherRecord.countDocuments();
			logInfo(`Số lượng bản ghi thời tiết trong DB: ${recordCount}`);

			// Kiểm tra bản ghi mới nhất
			const latestRecord = await WeatherRecord.findOne().sort({
				timestamp: -1,
			});
			logInfo(
				`Bản ghi mới nhất: ${
					latestRecord
						? new Date(latestRecord.timestamp).toISOString()
						: "không có bản ghi"
				}`
			);

			// Lấy dữ liệu ranking từ service
			const ranking = await weatherDataService.getAQIRanking(limit);

			logInfo(`Số lượng kết quả ranking trả về: ${ranking.length}`);

			res.status(200).json({
				status: "success",
				data: {
					title: "Thành phố có không khí tốt nhất",
					description: "Dữ liệu AQI trung bình 24 giờ qua",
					timestamp: new Date(),
					ranking,
				},
			});
		} catch (error) {
			logError("Lỗi khi lấy AQI ranking:", error);

			res.status(500).json({
				status: "failed",
				data: { message: "Không thể lấy dữ liệu ranking AQI" },
			});
		}
	}

	/**
	 * Lấy ranking nhiệt độ của các thành phố
	 */
	async getTemperatureRanking(req: Request, res: Response): Promise<void> {
		try {
			const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
			const sort = (req.query.sort as "asc" | "desc") || "desc";

			logInfo(`Đang lấy ranking nhiệt độ với limit=${limit}, sort=${sort}`);

			// Kiểm tra số lượng bản ghi trong DB
			const recordCount = await WeatherRecord.countDocuments();
			logInfo(`Số lượng bản ghi thời tiết trong DB: ${recordCount}`);

			// Lấy dữ liệu ranking từ service
			const ranking = await weatherDataService.getTemperatureRanking(
				limit,
				sort
			);

			logInfo(`Số lượng kết quả ranking trả về: ${ranking.length}`);

			const title =
				sort === "asc"
					? "Thành phố có nhiệt độ thấp nhất"
					: "Thành phố có nhiệt độ cao nhất";

			res.status(200).json({
				status: "success",
				data: {
					title,
					description: "Dữ liệu nhiệt độ trung bình 24 giờ qua",
					timestamp: new Date(),
					ranking,
				},
			});
		} catch (error) {
			logError("Lỗi khi lấy Temperature ranking:", error);

			res.status(500).json({
				status: "failed",
				data: { message: "Không thể lấy dữ liệu ranking nhiệt độ" },
			});
		}
	}

	/**
	 * Cập nhật dữ liệu thời tiết cho tất cả các thành phố
	 */
	async updateAllWeatherData(req: Request, res: Response): Promise<void> {
		try {
			logInfo("Bắt đầu cập nhật dữ liệu thời tiết cho tất cả các thành phố");

			// Chạy cập nhật dữ liệu bất đồng bộ
			weatherDataService
				.updateAllCitiesData()
				.then(() => logInfo("Cập nhật dữ liệu thời tiết hoàn tất"))
				.catch((err) => logError("Lỗi khi cập nhật dữ liệu thời tiết:", err));

			// Trả về ngay lập tức không đợi hoàn thành
			res.status(200).json({
				status: "success",
				data: {
					message: "Đang cập nhật dữ liệu thời tiết cho tất cả các thành phố",
					timestamp: new Date(),
				},
			});
		} catch (error) {
			logError("Lỗi khi bắt đầu cập nhật dữ liệu thời tiết:", error);

			res.status(500).json({
				status: "failed",
				data: { message: "Không thể cập nhật dữ liệu thời tiết" },
			});
		}
	}
}

// Singleton pattern
export default new RankingController();
