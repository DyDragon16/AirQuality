import axios from "axios";
import env from "../config/env";
import { WeatherResponse, ErrorResponse } from "../types/weather";
import { CITIES as CITY_CONSTANTS } from "../constants/cities";
import { CITIES } from "../data/cities";
import { logInfo, logError, logWarning, logDebug } from "../utils/logger";

/**
 * Repository Pattern cho việc truy cập dữ liệu thời tiết
 */
class WeatherRepository {
	private baseUrl: string;
	private cityIdMap: Record<string, string> = {};
	private cache: Map<string, { data: any; timestamp: number }> = new Map();
	private readonly CACHE_TTL = 10 * 60 * 1000; // 10 phút

	constructor() {
		this.baseUrl = env.airvisualApiUrl;
		logInfo("WeatherRepository initialized with base URL", {
			baseUrl: this.baseUrl,
		});

		// Tạo map từ id thành phố (hanoi, hochiminh) đến id API (ZPGtcusBx9JWBKYxm, ...)
		CITIES.forEach((city) => {
			this.cityIdMap[city.id] = city.aqi_station_id;
		});

		// Thêm mapping uppercase
		Object.entries(CITY_CONSTANTS).forEach(([key, value]) => {
			this.cityIdMap[key.toLowerCase()] = value.id;
		});

		logInfo("City ID mappings created", {
			mappingCount: Object.keys(this.cityIdMap).length,
		});
	}

	/**
	 * Lấy thông tin thời tiết dựa trên ID thành phố
	 */
	async getWeatherByCityId(cityId: string): Promise<any> {
		try {
			// Chuyển đổi ID nếu cần
			const apiCityId = this.cityIdMap[cityId.toLowerCase()] || cityId;

			// Kiểm tra cache trước
			const cacheKey = `weather_${apiCityId}`;
			const cachedData = this.getFromCache(cacheKey);
			if (cachedData) {
				logInfo(
					`Using cached data for city ID: ${cityId} (API ID: ${apiCityId})`
				);
				return cachedData;
			}

			logInfo(`Resolving city ID ${cityId} to API ID ${apiCityId}`);
			logInfo(`Calling API: ${this.baseUrl}/cities/${apiCityId}`);

			const response = await axios.get(`${this.baseUrl}/cities/${apiCityId}`, {
				timeout: 5000, // Thêm timeout 5 giây
				headers: {
					Accept: "application/json",
					"User-Agent": "Weather App v1.0",
				},
			});

			logInfo("API response received successfully", {
				cityId,
				apiCityId,
				status: response.status,
			});

			// Lưu vào cache
			const data = {
				...response.data,
				lastUpdated: new Date().toISOString(), // Thêm thời gian cập nhật
			};
			this.saveToCache(cacheKey, data);

			return data;
		} catch (error) {
			// Xử lý các loại lỗi cụ thể
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const errorMsg = error.response?.data?.message || error.message;

				if (status === 404) {
					logWarning(`City ID not found: ${cityId}`, {
						status,
						message: errorMsg,
					});
					throw {
						status: "failed",
						data: {
							message: `Không tìm thấy dữ liệu cho thành phố này (ID: ${cityId})`,
							code: "CITY_NOT_FOUND",
						},
					} as ErrorResponse;
				} else if (status === 429) {
					logWarning(`Rate limit exceeded for API`, {
						status,
						message: errorMsg,
					});
					throw {
						status: "failed",
						data: {
							message: "Đã vượt quá giới hạn request. Vui lòng thử lại sau.",
							code: "RATE_LIMIT",
						},
					} as ErrorResponse;
				} else if (error.code === "ECONNABORTED") {
					logWarning(`API request timeout for ${cityId}`, { timeout: 5000 });
					throw {
						status: "failed",
						data: {
							message:
								"Kết nối đến server thời tiết bị timeout. Vui lòng thử lại sau.",
							code: "TIMEOUT",
						},
					} as ErrorResponse;
				}

				// Lỗi khác
				logError(
					`Error in API request for city ${cityId}, status: ${error.response?.status}, url: ${error.config?.url}`,
					error
				);
			} else {
				// Lỗi không phải từ Axios
				logError(
					"Unexpected error in repository",
					error instanceof Error ? error : new Error(String(error))
				);
			}

			throw {
				status: "failed",
				data: {
					message:
						"Đã xảy ra lỗi khi lấy dữ liệu thời tiết. Vui lòng thử lại sau.",
					code: "UNEXPECTED_ERROR",
				},
			} as ErrorResponse;
		}
	}

	// Lưu vào cache
	private saveToCache(key: string, data: any): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
		});
		logDebug(`Saved data to cache: ${key}`);
	}

	// Lấy từ cache
	private getFromCache(key: string): any | null {
		const cached = this.cache.get(key);
		if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
			return cached.data;
		}
		return null;
	}

	// Xóa cache cũ
	cleanupCache(): void {
		const now = Date.now();
		let count = 0;

		for (const [key, value] of this.cache.entries()) {
			if (now - value.timestamp > this.CACHE_TTL) {
				this.cache.delete(key);
				count++;
			}
		}

		if (count > 0) {
			logInfo(`Cleaned up ${count} expired cache entries`);
		}
	}
}

// Singleton pattern
export default new WeatherRepository();
