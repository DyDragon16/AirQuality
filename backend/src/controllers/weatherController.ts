import { Request, Response } from "express";
import mongoose from "mongoose";
import { logInfo, logError } from "../utils/logger";
import { WeatherRecord } from "../models/WeatherRecord";
import weatherService from "../services/weatherService";
import { weatherDataService } from "../services/weatherDataService";
import { cityDataService } from "../services/cityDataService";

/**
 * Controller Pattern cho API thời tiết
 */
class WeatherController {
	/**
	 * Lấy thông tin thời tiết dựa trên ID thành phố
	 */
	async getWeatherByCityId(req: Request, res: Response): Promise<void> {
		try {
			const cityId = req.params.cityId;

			// Đảm bảo route này không xử lý các endpoints đặc biệt
			if (cityId === 'ranking' || cityId === 'stats' || cityId === 'alerts') {
				console.warn(`Yêu cầu không hợp lệ: ${cityId} là endpoint đặc biệt, không phải city ID`);
				res.status(400).json({
					status: "failed",
					data: { 
						message: `'${cityId}' là một endpoint đặc biệt, không phải ID thành phố. Hãy sử dụng route /api/weather/${cityId} thay vì /api/weather/cities/${cityId}` 
					},
				});
				return;
			}

			if (!cityId) {
				res.status(400).json({
					status: "failed",
					data: { message: "City ID is required" },
				});
				return;
			}

			console.log(`Controller processing request for city ID: ${cityId}`);
			const weatherData = await weatherService.getWeatherByCityId(cityId);
			console.log("Controller sending response");
			res.status(200).json(weatherData);
		} catch (error) {
			console.error("Error fetching weather data:", error);

			// Nếu error đã được format trong repository
			if (error && typeof error === "object" && "status" in error) {
				res.status(500).json(error);
				return;
			}

			res.status(500).json({
				status: "failed",
				data: { message: "An unexpected error occurred" },
			});
		}
	}

	/**
	 * Lấy lịch sử thời tiết của một thành phố
	 */
	async getWeatherHistory(req: Request, res: Response): Promise<void> {
		try {
			const { cityId } = req.params;
			const days = req.query.days ? parseInt(req.query.days as string) : 7;

			if (!cityId) {
				res.status(400).json({
					status: "failed",
					data: { message: "Yêu cầu cung cấp ID thành phố" },
				});
				return;
			}

			// Kiểm tra giá trị days
			if (isNaN(days) || days <= 0 || days > 30) {
				res.status(400).json({
					status: "failed",
					data: { message: "Tham số days phải là số > 0 và <= 30" },
				});
				return;
			}

			console.log(
				`Đang xử lý yêu cầu lấy lịch sử thời tiết cho thành phố: ${cityId}, days: ${days}`
			);

			// Gọi service để lấy dữ liệu lịch sử
			const historyData = await weatherDataService.getWeatherHistory(
				cityId,
				days
			);

			if (!historyData) {
				res.status(404).json({
					status: "failed",
					data: {
						message: `Không tìm thấy dữ liệu lịch sử cho thành phố: ${cityId}`,
					},
				});
				return;
			}

			// Trả về dữ liệu lịch sử
			res.status(200).json({
				status: "success",
				data: {
					...historyData,
					days,
					timestamp: new Date(),
				},
			});
		} catch (error) {
			console.error("Lỗi khi lấy dữ liệu lịch sử thời tiết:", error);

			res.status(500).json({
				status: "failed",
				data: { message: "Đã xảy ra lỗi khi lấy dữ liệu lịch sử thời tiết" },
			});
		}
	}

	/**
	 * Cập nhật dữ liệu thời tiết cho tất cả các thành phố
	 */
	async updateAllCitiesData(req: Request, res: Response): Promise<void> {
		try {
			await weatherDataService.updateAllCitiesData();
			res.status(200).json({
				success: true,
				message:
					"Đã cập nhật thành công dữ liệu thời tiết cho tất cả các thành phố",
			});
		} catch (error) {
			logError("Lỗi khi xử lý yêu cầu cập nhật dữ liệu thời tiết:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi cập nhật dữ liệu thời tiết",
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	/**
	 * Lấy ranking AQI của các thành phố
	 */
	async getAQIRanking(req: Request, res: Response): Promise<void> {
		try {
			const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
			
			console.log(`Đang lấy xếp hạng AQI cho ${limit} thành phố...`);
			
			// Lấy bản ghi mới nhất cho mỗi thành phố
			const latestRecords = await WeatherRecord.aggregate([
				// Nhóm theo cityId và lấy bản ghi mới nhất
				{
					$sort: { timestamp: -1 }
				},
				{
					$group: {
						_id: "$cityId",
						cityName: { $first: "$cityName" },
						aqi: { $first: "$aqi" },
						timestamp: { $first: "$timestamp" }
					}
				},
				// Sắp xếp theo AQI giảm dần
				{
					$sort: { aqi: -1 }
				},
				// Giới hạn số lượng kết quả
				{
					$limit: limit
				}
			]);
			
			// Lấy các bản ghi cũ hơn để tính xu hướng
			const results = await Promise.all(latestRecords.map(async (record: any) => {
				// Lấy bản ghi trước đó của cùng thành phố
				const previousRecord = await WeatherRecord.find({
					cityId: record._id,
					timestamp: { $lt: record.timestamp }
				}).sort({ timestamp: -1 }).limit(1);
				
				const previousAqi = previousRecord.length > 0 ? previousRecord[0].aqi : null;
				
				return {
					cityId: record._id,
					cityName: record.cityName,
					aqi: record.aqi,
					previousAqi: previousAqi,
					timestamp: record.timestamp
				};
			}));
			
			console.log(`Đã tìm thấy ${results.length} bản ghi xếp hạng`);
			res.json(results);
		} catch (error) {
			console.error('Lỗi khi lấy xếp hạng AQI:', error);
			res.status(500).json({ error: 'Không thể lấy xếp hạng AQI' });
		}
	}

	/**
	 * Lấy ranking nhiệt độ của các thành phố
	 */
	async getTemperatureRanking(req: Request, res: Response): Promise<void> {
		try {
			const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
			const sort = (req.query.sort as "asc" | "desc") || "desc";
			const ranking = await weatherDataService.getTemperatureRanking(
				limit,
				sort
			);
			res.status(200).json({ success: true, data: ranking });
		} catch (error) {
			logError("Lỗi khi xử lý yêu cầu lấy ranking nhiệt độ:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi lấy ranking nhiệt độ",
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	/**
	 * Dọn dẹp dữ liệu thời tiết cũ
	 */
	async cleanupOldWeatherData(req: Request, res: Response): Promise<void> {
		try {
			// Mặc định giữ lại 30 ngày, cho phép điều chỉnh thông qua tham số
			const daysToKeep = req.query.days
				? parseInt(req.query.days as string)
				: 30;

			// Đảm bảo giá trị hợp lệ
			if (isNaN(daysToKeep) || daysToKeep <= 0) {
				res.status(400).json({
					success: false,
					message: "Tham số 'days' không hợp lệ, phải là số nguyên dương",
				});
				return;
			}

			await weatherDataService.cleanupOldWeatherData(daysToKeep);

			res.status(200).json({
				success: true,
				message: `Đã dọn dẹp dữ liệu thời tiết cũ thành công, giữ lại ${daysToKeep} ngày gần nhất`,
			});
		} catch (error) {
			logError("Lỗi khi xử lý yêu cầu dọn dẹp dữ liệu cũ:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi dọn dẹp dữ liệu cũ",
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	/**
	 * Nén dữ liệu thời tiết cũ để tiết kiệm dung lượng nhưng vẫn giữ lịch sử
	 */
	async compressWeatherData(req: Request, res: Response): Promise<void> {
		try {
			// Mặc định nén dữ liệu cũ hơn 7 ngày, cho phép điều chỉnh thông qua tham số
			const olderThanDays = req.query.days
				? parseInt(req.query.days as string)
				: 7;

			// Khoảng thời gian để gộp dữ liệu (mặc định 3 giờ)
			const aggregationInterval = req.query.interval
				? parseInt(req.query.interval as string)
				: 3;

			// Đảm bảo giá trị hợp lệ
			if (isNaN(olderThanDays) || olderThanDays <= 0) {
				res.status(400).json({
					success: false,
					message: "Tham số 'days' không hợp lệ, phải là số nguyên dương",
				});
				return;
			}

			if (
				isNaN(aggregationInterval) ||
				aggregationInterval <= 0 ||
				aggregationInterval > 24
			) {
				res.status(400).json({
					success: false,
					message: "Tham số 'interval' không hợp lệ, phải là số nguyên từ 1-24",
				});
				return;
			}

			await weatherDataService.compressWeatherData(
				olderThanDays,
				aggregationInterval
			);

			res.status(200).json({
				success: true,
				message: `Đã nén dữ liệu thời tiết cũ thành công, dữ liệu cũ hơn ${olderThanDays} ngày đã được gộp theo khoảng ${aggregationInterval} giờ`,
			});
		} catch (error) {
			logError("Lỗi khi xử lý yêu cầu nén dữ liệu:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi nén dữ liệu",
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	/**
	 * Lấy thống kê tổng quan về dữ liệu thời tiết
	 */
	async getWeatherStats(req: Request, res: Response): Promise<void> {
		try {
			// Đảm bảo mô hình được import đúng cách
			console.log("Đang tính toán thống kê từ dữ liệu thật...");
			
			// Lấy tổng số bản ghi trong database
			const totalRecords = await WeatherRecord.countDocuments();
			
			// Lấy số lượng trạm quan trắc (các thành phố có dữ liệu)
			const activeStations = await WeatherRecord.distinct('cityId');
			
			// Lấy các cảnh báo (records với AQI > 100) mới nhất
			const alerts = await WeatherRecord.find({ aqi: { $gt: 100 } })
				.sort({ timestamp: -1 })
				.limit(5)
				.lean();
				
			// Tìm bản ghi mới nhất
			const latestRecord = await WeatherRecord.findOne()
				.sort({ timestamp: -1 })
				.lean();
				
			const stats = {
				totalStations: activeStations.length,
				totalMeasurements: totalRecords,
				lastUpdated: latestRecord?.timestamp || new Date(),
				alerts: alerts.map((alert: any) => ({
					cityName: alert.cityName,
					aqi: alert.aqi,
					timestamp: alert.timestamp
				}))
			};
			
			console.log("Thống kê được tính toán thành công:", stats);
			res.status(200).json(stats);
		} catch (error) {
			console.error("Lỗi khi lấy thống kê dữ liệu thời tiết:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi lấy thống kê",
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}

	/**
	 * Lấy danh sách cảnh báo chất lượng không khí
	 */
	async getAirQualityAlerts(req: Request, res: Response): Promise<void> {
		try {
			const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
			
			console.log(`Đang truy vấn dữ liệu cảnh báo thật với limit=${limit}...`);
			
			// Truy vấn MongoDB trực tiếp để lấy dữ liệu cảnh báo mới nhất
			const alerts = await WeatherRecord.aggregate([
				// Chỉ lấy các bản ghi có AQI > 100
				{ $match: { aqi: { $gt: 100 } } },
				
				// Sắp xếp theo thời gian giảm dần và AQI giảm dần
				{ $sort: { timestamp: -1, aqi: -1 } },
				
				// Chỉ lấy bản ghi mới nhất cho mỗi thành phố
				{ $group: { 
					_id: "$cityId", 
					cityName: { $first: "$cityName" },
					aqi: { $first: "$aqi" },
					timestamp: { $first: "$timestamp" },
					temperature: { $first: "$temperature" },
					humidity: { $first: "$humidity" }
				}},
				
				// Sắp xếp lại kết quả theo AQI giảm dần
				{ $sort: { aqi: -1 } },
				
				// Giới hạn số lượng kết quả
				{ $limit: limit }
			]);
			
			if (alerts.length === 0) {
				console.log('Không có dữ liệu cảnh báo chất lượng không khí');
				res.status(200).json([]);
				return;
			}
			
			// Chuyển đổi mức độ cảnh báo dựa trên giá trị AQI
			const formattedAlerts = alerts.map((alert: any) => ({
				cityName: alert.cityName,
				aqi: alert.aqi,
				level: alert.aqi > 150 ? 'danger' : 'warning',
				timestamp: alert.timestamp,
				temperature: alert.temperature || 0,
				humidity: alert.humidity || 0
			}));
			
			console.log(`Trả về ${formattedAlerts.length} cảnh báo từ dữ liệu thực`);
			res.status(200).json(formattedAlerts);
		} catch (error) {
			console.error("Lỗi khi lấy cảnh báo chất lượng không khí:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi lấy cảnh báo chất lượng không khí",
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}

	/**
	 * Lấy danh sách tất cả các thành phố
	 */
	async getAllCities(req: Request, res: Response): Promise<void> {
		try {
			// Lấy tất cả thành phố từ cityDataService
			const allCities = cityDataService.getAllCities();
			
			// Kiểm tra số lượng thành phố
			console.log(`Tìm thấy ${allCities.length} thành phố trong hệ thống`);
			
			// Trả về tất cả thành phố, bao gồm cả hidden cities
			res.status(200).json(allCities);
		} catch (error) {
			logError("Lỗi khi lấy danh sách thành phố:", error);
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi lấy danh sách thành phố",
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}
}

const weatherController = new WeatherController();

// Thêm phương thức getAllCities vào đối tượng weatherController
Object.defineProperty(weatherController, 'getAllCities', {
	value: weatherController.getAllCities.bind(weatherController),
	writable: true,
	configurable: true
});

export default weatherController;
