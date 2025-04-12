import { WeatherRecord, IWeatherRecord } from "../models/WeatherRecord";
import { logInfo, logError } from "../utils/logger";
import { CITIES } from "../data/cities";
import weatherRepository from "../repositories/weatherRepository";

interface WeatherRanking {
	cityId: string;
	cityName: string;
	averageAQI: number;
	averageTemperature: number;
	lastUpdated: Date;
}

// Thêm interface mới cho dữ liệu lịch sử
interface WeatherHistoryData {
	cityId: string;
	cityName: string;
	records: Array<{
		timestamp: Date;
		aqi: number;
		temperature: number;
		humidity: number;
		windSpeed: number;
		condition: string;
	}>;
}

class WeatherDataService {
	/**
	 * Lưu dữ liệu thời tiết vào MongoDB
	 */
	async saveWeatherData(
		cityId: string,
		weatherData: any
	): Promise<IWeatherRecord | null> {
		try {
			// Tìm thông tin thành phố từ CITIES
			const city = CITIES.find(
				(city) => city.id === cityId || city.aqi_station_id === cityId
			);

			if (!city) {
				logError(`Không tìm thấy thông tin thành phố với ID: ${cityId}`);
				return null;
			}

			// Kiểm tra dữ liệu đầu vào
			if (!weatherData) {
				logError(`Dữ liệu thời tiết không hợp lệ cho ${cityId}`);
				return null;
			}

			// API trả về current ở cấp cao, không nằm trong data
			const currentData = weatherData.current;

			if (!currentData) {
				logError(`Không tìm thấy dữ liệu thời tiết hiện tại cho ${cityId}`);
				return null;
			}

			// Log dữ liệu để debug
			console.log(
				`[DEBUG] Dữ liệu thời tiết cho ${city.name}:`,
				JSON.stringify(currentData, null, 2)
			);

			// Tạo record mới
			const weatherRecord = new WeatherRecord({
				cityId: city.id,
				cityName: city.name,
				timestamp: new Date(currentData.ts || new Date()),
				aqi: currentData.aqi || 0,
				temperature: currentData.temperature || 0,
				humidity: currentData.humidity || 0,
				pressure: currentData.pressure || 0,
				windSpeed: currentData.wind?.speed || 0,
				windDirection: currentData.wind?.direction || 0,
				condition: currentData.condition || "",
				mainPollutant: currentData.mainPollutant || "",
				pollutants: currentData.pollutants || [],
				coordinates: {
					latitude: weatherData.coordinates?.latitude || 0,
					longitude: weatherData.coordinates?.longitude || 0,
				},
			});

			console.log(`[DEBUG] Đang lưu record cho ${city.name} vào MongoDB...`);

			// Lưu vào database với Promise rõ ràng hơn để bắt lỗi
			try {
				const savedRecord = await weatherRecord.save();
				console.log(`[DEBUG] Đã lưu thành công với ID: ${savedRecord._id}`);
				logInfo(`Đã lưu dữ liệu thời tiết cho ${city.name} vào database`);
				return savedRecord;
			} catch (saveError) {
				console.error(`[DEBUG] Lỗi khi save vào MongoDB:`, saveError);
				if (saveError instanceof Error) {
					console.error(`[DEBUG] Chi tiết lỗi:`, saveError.message);
					console.error(`[DEBUG] Stack trace:`, saveError.stack);
				}
				throw saveError; // Ném lại lỗi để xử lý bên ngoài
			}
		} catch (error) {
			console.error(`[DEBUG] Lỗi tổng quát:`, error);
			logError("Lỗi khi lưu dữ liệu thời tiết:", error);
			return null;
		}
	}

	/**
	 * Nén dữ liệu thời tiết cũ để tiết kiệm dung lượng nhưng vẫn giữ được lịch sử
	 * @param olderThanDays Nén dữ liệu cũ hơn số ngày được chỉ định (mặc định 7 ngày)
	 * @param aggregationInterval Khoảng thời gian để gộp dữ liệu (mặc định 3 giờ)
	 */
	async compressWeatherData(
		olderThanDays: number = 7,
		aggregationInterval: number = 3
	): Promise<void> {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

			logInfo(
				`Bắt đầu nén dữ liệu thời tiết cũ hơn ${olderThanDays} ngày (gộp theo khoảng ${aggregationInterval} giờ)`
			);

			// Tìm tất cả các thành phố có dữ liệu
			const cities = await WeatherRecord.distinct("cityId", {
				timestamp: { $lt: cutoffDate },
			});

			for (const cityId of cities) {
				const cityData = CITIES.find((city) => city.id === cityId);
				const cityName = cityData ? cityData.name : cityId;

				// Lấy tất cả dữ liệu cũ của thành phố này
				const oldRecords = await WeatherRecord.find({
					cityId,
					timestamp: { $lt: cutoffDate },
				}).sort({ timestamp: 1 });

				if (oldRecords.length === 0) continue;

				// Nhóm dữ liệu theo khoảng thời gian
				const groupedData: { [key: string]: IWeatherRecord[] } = {};

				for (const record of oldRecords) {
					// Làm tròn thời gian xuống khoảng thời gian gần nhất
					const timestamp = new Date(record.timestamp);
					timestamp.setUTCHours(
						Math.floor(timestamp.getUTCHours() / aggregationInterval) *
							aggregationInterval,
						0,
						0,
						0
					);

					const timeKey = timestamp.toISOString();

					if (!groupedData[timeKey]) {
						groupedData[timeKey] = [];
					}

					groupedData[timeKey].push(record);
				}

				// Tạo dữ liệu gộp và xóa dữ liệu cũ
				const bulkOps = [];
				const recordsToDelete = [];

				for (const [timeKey, records] of Object.entries(groupedData)) {
					if (records.length <= 1) continue; // Nếu chỉ có 1 bản ghi thì không cần nén

					// Tính giá trị trung bình
					const aqi =
						records.reduce((sum, r) => sum + r.aqi, 0) / records.length;
					const temperature =
						records.reduce((sum, r) => sum + r.temperature, 0) / records.length;
					const humidity =
						records.reduce((sum, r) => sum + r.humidity, 0) / records.length;
					const pressure =
						records.reduce((sum, r) => sum + r.pressure, 0) / records.length;
					const windSpeed =
						records.reduce((sum, r) => sum + r.windSpeed, 0) / records.length;

					// Lấy giá trị phổ biến nhất cho các trường không phải số
					const conditions = records.map((r) => r.condition);
					const condition =
						conditions
							.sort(
								(a, b) =>
									conditions.filter((v) => v === a).length -
									conditions.filter((v) => v === b).length
							)
							.pop() || "";

					// Tạo bản ghi mới đã nén
					const compressedRecord = {
						cityId,
						cityName,
						timestamp: new Date(timeKey),
						aqi: Math.round(aqi * 10) / 10,
						temperature: Math.round(temperature * 10) / 10,
						humidity: Math.round(humidity * 10) / 10,
						pressure: Math.round(pressure * 10) / 10,
						windSpeed: Math.round(windSpeed * 10) / 10,
						windDirection: records[0].windDirection, // Chỉ lấy giá trị đầu tiên
						condition,
						mainPollutant: records[0].mainPollutant,
						isCompressed: true, // Đánh dấu đây là bản ghi đã nén
						compressedFromCount: records.length, // Số lượng bản ghi gốc
						pollutants: records[0].pollutants,
						coordinates: records[0].coordinates,
					};

					// Thêm vào danh sách thao tác hàng loạt
					bulkOps.push({
						insertOne: {
							document: compressedRecord,
						},
					});

					// Thêm ID của các bản ghi cũ vào danh sách xóa
					recordsToDelete.push(...records.map((r) => r._id));
				}

				// Thực hiện thao tác hàng loạt nếu có
				if (bulkOps.length > 0) {
					await WeatherRecord.bulkWrite(bulkOps);
					await WeatherRecord.deleteMany({ _id: { $in: recordsToDelete } });

					logInfo(
						`Đã nén ${recordsToDelete.length} bản ghi thành ${bulkOps.length} bản ghi cho thành phố ${cityName}`
					);
				}
			}

			logInfo("Hoàn thành quá trình nén dữ liệu thời tiết cũ");
		} catch (error) {
			logError("Lỗi khi nén dữ liệu thời tiết cũ:", error);
		}
	}

	/**
	 * Xóa dữ liệu thời tiết cũ để tránh dữ liệu tích tụ quá nhiều
	 * @param daysToKeep Số ngày dữ liệu được giữ lại (mặc định 30 ngày)
	 */
	async cleanupOldWeatherData(daysToKeep: number = 30): Promise<void> {
		try {
			// Đảm bảo giữ lại ít nhất 7 ngày dữ liệu cho tính năng xem lịch sử
			if (daysToKeep < 7) {
				daysToKeep = 7;
				logInfo(
					`Điều chỉnh thời gian giữ lại dữ liệu lên ${daysToKeep} ngày để đảm bảo chức năng lịch sử hoạt động`
				);
			}

			// Thay vì xóa hẳn dữ liệu cũ, chúng ta nén nó trước
			const compressionCutoff = 30; // Nén dữ liệu cũ hơn 30 ngày
			if (daysToKeep > compressionCutoff) {
				await this.compressWeatherData(compressionCutoff);
			}

			// Tính thời gian ngưỡng để xóa (chỉ xóa dữ liệu cực kỳ cũ)
			const deleteCutoffDate = new Date();
			deleteCutoffDate.setDate(deleteCutoffDate.getDate() - 365); // Giữ dữ liệu trong 1 năm

			logInfo(`Bắt đầu xóa dữ liệu thời tiết cực kỳ cũ (cũ hơn 1 năm)`);

			// Đếm số lượng bản ghi trước khi xóa
			const beforeCount = await WeatherRecord.countDocuments();

			// Xóa tất cả bản ghi có timestamp cũ hơn ngưỡng
			const result = await WeatherRecord.deleteMany({
				timestamp: { $lt: deleteCutoffDate },
			});

			// Đếm số lượng bản ghi sau khi xóa
			const afterCount = await WeatherRecord.countDocuments();

			logInfo(
				`Đã xóa ${result.deletedCount} bản ghi cũ (trước: ${beforeCount}, sau: ${afterCount})`
			);
			logInfo(
				`Còn lại dữ liệu từ ${deleteCutoffDate.toISOString()} đến hiện tại`
			);
		} catch (error) {
			logError("Lỗi khi xóa dữ liệu thời tiết cũ:", error);
		}
	}

	/**
	 * Cập nhật dữ liệu thời tiết cho tất cả các thành phố
	 */
	async updateAllCitiesData(): Promise<void> {
		try {
			logInfo("Bắt đầu cập nhật dữ liệu thời tiết cho tất cả các thành phố");

			// Duyệt qua tất cả các thành phố
			for (const city of CITIES) {
				try {
					// Lấy dữ liệu thời tiết mới nhất từ API
					const weatherData = await weatherRepository.getWeatherByCityId(
						city.id
					);

					// Lưu vào database
					await this.saveWeatherData(city.id, weatherData);
				} catch (error) {
					logError(`Lỗi khi cập nhật dữ liệu cho ${city.name}:`, error);
				}
			}

			logInfo("Hoàn thành cập nhật dữ liệu thời tiết cho tất cả các thành phố");

			// Xóa dữ liệu cũ sau khi cập nhật
			await this.cleanupOldWeatherData();
		} catch (error) {
			logError("Lỗi trong quá trình cập nhật dữ liệu:", error);
		}
	}

	/**
	 * Lấy ranking AQI của các thành phố
	 */
	async getAQIRanking(limit: number = 10): Promise<WeatherRanking[]> {
		try {
			// Lấy dữ liệu AQI trung bình trong 24 giờ qua
			const oneDayAgo = new Date();
			oneDayAgo.setDate(oneDayAgo.getDate() - 1);
			
			logInfo(`Đang lấy dữ liệu AQI ranking từ ${oneDayAgo.toISOString()} đến hiện tại`);

			// Đếm số lượng bản ghi có sẵn trong khoảng thời gian
			const recordCount = await WeatherRecord.countDocuments({
				timestamp: { $gte: oneDayAgo }
			});
			
			logInfo(`Tìm thấy ${recordCount} bản ghi thời tiết trong khoảng thời gian yêu cầu`);

			const aqiRanking = await WeatherRecord.aggregate([
				{
					$match: {
						timestamp: { $gte: oneDayAgo },
						$and: [
							{ aqi: { $ne: null } },
							{ aqi: { $ne: 0 } }
						]
					},
				},
				{
					$group: {
						_id: "$cityId",
						cityName: { $first: "$cityName" },
						averageAQI: { $avg: "$aqi" },
						averageTemperature: { $avg: "$temperature" },
						lastUpdated: { $max: "$timestamp" },
					},
				},
				{
					$sort: { averageAQI: 1 }, // Sắp xếp tăng dần theo AQI (chất lượng không khí tốt nhất đứng đầu)
				},
				{
					$limit: limit,
				},
			]);

			logInfo(`Kết quả AQI ranking: ${JSON.stringify(aqiRanking.map(i => ({ city: i.cityName, aqi: i.averageAQI })))}`);

			return aqiRanking.map((item) => ({
				cityId: item._id,
				cityName: item.cityName,
				averageAQI: Math.round(item.averageAQI * 10) / 10,
				averageTemperature: Math.round(item.averageTemperature * 10) / 10,
				lastUpdated: item.lastUpdated,
			}));
		} catch (error) {
			logError("Lỗi khi lấy ranking AQI:", error);
			return [];
		}
	}

	/**
	 * Lấy ranking nhiệt độ của các thành phố
	 */
	async getTemperatureRanking(
		limit: number = 10,
		sort: "asc" | "desc" = "desc"
	): Promise<WeatherRanking[]> {
		try {
			const oneDayAgo = new Date();
			oneDayAgo.setDate(oneDayAgo.getDate() - 1);
			
			logInfo(`Đang lấy dữ liệu nhiệt độ ranking từ ${oneDayAgo.toISOString()} đến hiện tại (sort: ${sort})`);

			// Đếm số lượng bản ghi có sẵn trong khoảng thời gian
			const recordCount = await WeatherRecord.countDocuments({
				timestamp: { $gte: oneDayAgo }
			});
			
			logInfo(`Tìm thấy ${recordCount} bản ghi thời tiết trong khoảng thời gian yêu cầu`);

			const temperatureRanking = await WeatherRecord.aggregate([
				{
					$match: {
						timestamp: { $gte: oneDayAgo },
						$and: [
							{ temperature: { $ne: null } },
							{ temperature: { $ne: 0 } }
						]
					},
				},
				{
					$group: {
						_id: "$cityId",
						cityName: { $first: "$cityName" },
						averageAQI: { $avg: "$aqi" },
						averageTemperature: { $avg: "$temperature" },
						lastUpdated: { $max: "$timestamp" },
					},
				},
				{
					$sort: {
						averageTemperature: sort === "asc" ? 1 : -1,
					},
				},
				{
					$limit: limit,
				},
			]);

			logInfo(`Kết quả nhiệt độ ranking (${sort}): ${JSON.stringify(temperatureRanking.map(i => ({ city: i.cityName, temp: i.averageTemperature })))}`);

			return temperatureRanking.map((item) => ({
				cityId: item._id,
				cityName: item.cityName,
				averageAQI: Math.round(item.averageAQI * 10) / 10,
				averageTemperature: Math.round(item.averageTemperature * 10) / 10,
				lastUpdated: item.lastUpdated,
			}));
		} catch (error) {
			logError("Lỗi khi lấy ranking nhiệt độ:", error);
			return [];
		}
	}

	/**
	 * Lấy lịch sử thời tiết của một thành phố trong khoảng thời gian
	 * @param cityId ID của thành phố
	 * @param days Số ngày lấy dữ liệu (mặc định 7 ngày)
	 */
	async getWeatherHistory(
		cityId: string,
		days: number = 7
	): Promise<WeatherHistoryData | null> {
		try {
			// Tìm thông tin thành phố từ CITIES
			const city = CITIES.find((city) => city.id === cityId);

			if (!city) {
				logError(`Không tìm thấy thông tin thành phố với ID: ${cityId}`);
				return null;
			}

			// Tính thời gian bắt đầu dựa trên số ngày
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - days);

			// Truy vấn dữ liệu từ database
			const records = await WeatherRecord.find({
				cityId: city.id,
				timestamp: { $gte: startDate },
			}).sort({ timestamp: 1 });

			if (!records || records.length === 0) {
				logInfo(
					`Không tìm thấy dữ liệu lịch sử cho thành phố ${city.name} trong ${days} ngày qua`
				);
				return {
					cityId: city.id,
					cityName: city.name,
					records: [],
				};
			}

			logInfo(
				`Đã lấy ${records.length} bản ghi lịch sử thời tiết cho ${city.name}`
			);

			// Chuyển đổi dữ liệu sang định dạng WeatherHistoryData
			return {
				cityId: city.id,
				cityName: city.name,
				records: records.map((record) => ({
					timestamp: record.timestamp,
					aqi: record.aqi,
					temperature: record.temperature,
					humidity: record.humidity,
					windSpeed: record.windSpeed,
					condition: record.condition,
				})),
			};
		} catch (error) {
			logError(`Lỗi khi lấy lịch sử thời tiết cho cityId ${cityId}:`, error);
			return null;
		}
	}
}

// Singleton pattern
export const weatherDataService = new WeatherDataService();
