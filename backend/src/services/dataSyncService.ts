import { WeatherRecord, IWeatherRecord } from "../models/WeatherRecord";
import { timescaleService } from "./timescaleService";
import { logInfo, logError, logWarning, logDebug } from "../utils/logger";
import env from "../config/env";

/**
 * Service để đồng bộ dữ liệu giữa MongoDB và TimescaleDB
 */
class DataSyncService {
	private isSyncing: boolean = false;
	private syncTimer: NodeJS.Timeout | null = null;
	private readonly syncInterval: number = env.syncIntervalMinutes * 60 * 1000; // Chuyển phút thành ms
	private readonly batchSize: number = env.syncBatchSize; // Số lượng bản ghi xử lý mỗi lô
	private lastSyncTime: Date = new Date(0); // Thời điểm đồng bộ cuối cùng

	/**
	 * Khởi tạo quá trình đồng bộ tự động
	 */
	async initialize(): Promise<void> {
		try {
			// Kiểm tra kết nối đến TimescaleDB
			const isConnected = await timescaleService.testConnection();

			if (!isConnected) {
				logWarning(
					"Không thể kết nối đến TimescaleDB, quá trình đồng bộ sẽ không được khởi tạo"
				);
				// Thử lại sau 5 phút
				setTimeout(() => this.initialize(), 5 * 60 * 1000);
				return;
			}

			// Khởi tạo cấu trúc bảng trong TimescaleDB
			await timescaleService.initializeWeatherTable();
			logInfo("Đã khởi tạo cấu trúc bảng TimescaleDB thành công");

			// Bắt đầu quá trình đồng bộ ban đầu
			await this.syncData();

			// Thiết lập quá trình đồng bộ tự động
			if (this.syncTimer) {
				clearInterval(this.syncTimer);
			}

			this.syncTimer = setInterval(() => {
				this.syncData().catch((err) => {
					logError("Lỗi trong quá trình đồng bộ tự động", err);
				});
			}, this.syncInterval);

			logInfo(
				`Đã thiết lập đồng bộ dữ liệu tự động mỗi ${env.syncIntervalMinutes} phút với kích thước lô ${this.batchSize}`
			);
		} catch (error) {
			logError("Lỗi khi khởi tạo quá trình đồng bộ dữ liệu", error);
			// Thử lại sau 5 phút
			setTimeout(() => this.initialize(), 5 * 60 * 1000);
		}
	}

	/**
	 * Đồng bộ dữ liệu từ MongoDB sang TimescaleDB
	 * Sử dụng batch processing để xử lý hiệu quả
	 */
	async syncData(): Promise<void> {
		// Tránh chạy nhiều process đồng bộ cùng lúc
		if (this.isSyncing) {
			logWarning("Đã có một quá trình đồng bộ đang chạy, bỏ qua yêu cầu mới");
			return;
		}

		this.isSyncing = true;
		let processedCount = 0;
		let hasMoreData = true;
		let currentPage = 0;

		try {
			logInfo("Bắt đầu quá trình đồng bộ dữ liệu từ MongoDB sang TimescaleDB", {
				lastSyncTime: this.lastSyncTime.toISOString(),
				batchSize: this.batchSize,
			});

			// Lặp qua từng lô dữ liệu
			while (hasMoreData) {
				// Tìm các bản ghi chưa được đồng bộ kể từ lần đồng bộ cuối
				const recordBatch = await WeatherRecord.find({
					timestamp: { $gt: this.lastSyncTime },
				})
					.sort({ timestamp: 1 })
					.skip(currentPage * this.batchSize)
					.limit(this.batchSize)
					.lean();

				if (recordBatch.length === 0) {
					hasMoreData = false;
					break;
				}

				logDebug(
					`Xử lý lô dữ liệu thứ ${currentPage + 1}, với ${
						recordBatch.length
					} bản ghi`
				);

				// Xử lý từng lô
				const batches = [];
				for (const record of recordBatch) {
					batches.push({
						cityId: record.cityId,
						cityName: record.cityName,
						aqi: record.aqi,
						temperature: record.temperature,
						humidity: record.humidity,
						pressure: record.pressure,
						windSpeed: record.windSpeed,
						windDirection: record.windDirection,
						condition: record.condition,
						mainPollutant: record.mainPollutant,
						timestamp: record.timestamp, // Thêm timestamp để lưu thời điểm chính xác
					});

					// Cập nhật thời gian đồng bộ cuối cùng
					if (record.timestamp > this.lastSyncTime) {
						this.lastSyncTime = new Date(record.timestamp);
					}
				}

				// Gửi cả lô dữ liệu tới TimescaleDB
				if (batches.length > 0) {
					await timescaleService.saveWeatherDataBatch(batches);
					processedCount += batches.length;
					logDebug(
						`Đã đồng bộ lô ${currentPage + 1} với ${batches.length} bản ghi`
					);
				}

				currentPage++;

				// Kiểm tra nếu đã lấy ít hơn batch size, tức là không còn dữ liệu
				if (recordBatch.length < this.batchSize) {
					hasMoreData = false;
				}
			}

			logInfo(`Đồng bộ dữ liệu hoàn tất: đã xử lý ${processedCount} bản ghi`);
		} catch (error) {
			logError("Lỗi trong quá trình đồng bộ dữ liệu", error);

			// Nếu lỗi, giữ lastSyncTime không đổi để thử lại sau
		} finally {
			this.isSyncing = false;
		}
	}

	/**
	 * Đồng bộ toàn bộ dữ liệu lịch sử (thao tác nặng, chỉ nên chạy một lần)
	 */
	async syncHistoricalData(days: number = 30): Promise<void> {
		if (this.isSyncing) {
			logWarning("Đã có một quá trình đồng bộ đang chạy, bỏ qua yêu cầu mới");
			return;
		}

		this.isSyncing = true;
		let processedCount = 0;
		let hasMoreData = true;
		let currentPage = 0;

		try {
			const startTime = new Date();
			startTime.setDate(startTime.getDate() - days);

			logInfo(`Bắt đầu đồng bộ dữ liệu lịch sử từ ${startTime.toISOString()}`);

			// Lặp qua từng lô dữ liệu
			while (hasMoreData) {
				// Tìm các bản ghi trong khoảng thời gian
				const recordBatch = await WeatherRecord.find({
					timestamp: { $gte: startTime },
				})
					.sort({ timestamp: 1 })
					.skip(currentPage * this.batchSize)
					.limit(this.batchSize)
					.lean();

				if (recordBatch.length === 0) {
					hasMoreData = false;
					break;
				}

				logDebug(
					`Xử lý lô dữ liệu lịch sử thứ ${currentPage + 1}, với ${
						recordBatch.length
					} bản ghi`
				);

				// Xử lý từng lô
				const batches = [];
				for (const record of recordBatch) {
					batches.push({
						cityId: record.cityId,
						cityName: record.cityName,
						aqi: record.aqi,
						temperature: record.temperature,
						humidity: record.humidity,
						pressure: record.pressure,
						windSpeed: record.windSpeed,
						windDirection: record.windDirection,
						condition: record.condition,
						mainPollutant: record.mainPollutant,
						timestamp: record.timestamp,
					});
				}

				// Gửi cả lô dữ liệu tới TimescaleDB
				if (batches.length > 0) {
					await timescaleService.saveWeatherDataBatch(batches);
					processedCount += batches.length;
					logDebug(
						`Đã đồng bộ lô lịch sử ${currentPage + 1} với ${
							batches.length
						} bản ghi`
					);
				}

				currentPage++;

				// Kiểm tra nếu đã lấy ít hơn batch size, tức là không còn dữ liệu
				if (recordBatch.length < this.batchSize) {
					hasMoreData = false;
				}
			}

			logInfo(
				`Đồng bộ dữ liệu lịch sử hoàn tất: đã xử lý ${processedCount} bản ghi`
			);
		} catch (error) {
			logError("Lỗi trong quá trình đồng bộ dữ liệu lịch sử", error);
		} finally {
			this.isSyncing = false;
		}
	}

	/**
	 * Hủy quá trình đồng bộ
	 */
	destroy(): void {
		if (this.syncTimer) {
			clearInterval(this.syncTimer);
			this.syncTimer = null;
			logInfo("Đã hủy quá trình đồng bộ dữ liệu tự động");
		}
	}
}

// Tạo và export một instance duy nhất
export const dataSyncService = new DataSyncService();
