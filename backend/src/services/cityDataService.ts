import axios from "axios";
import { City, CITIES } from "../data/cities";
import { EventEmitter } from "events";
import env from "../config/env";

interface WeatherData {
	dt: number;
	temp: {
		min: number;
		max: number;
	};
	humidity: number;
	speed: number;
	weather: Array<{
		main: string;
		description: string;
	}>;
	pop: number;
}

interface WeatherResponse {
	list: WeatherData[];
}

interface WeatherForecast {
	day: string;
	date: string;
	aqi: number;
	temperature: {
		high: number;
		low: number;
	};
	humidity: number;
	windSpeed: number;
	weather: string;
	rainChance: number;
}

interface CityData extends City {
	forecasts: WeatherForecast[];
	lastUpdated: string;
}

class CityDataService extends EventEmitter {
	private cities: CityData[] = [];
	private lastUpdate: Date | null = null;
	private readonly updateInterval = env.weatherUpdateInterval * 60 * 1000; // Sử dụng cấu hình từ env
	private updateTimer: NodeJS.Timeout | null = null;
	private cityDataCache: Record<string, { data: any; timestamp: number }> = {};

	constructor() {
		super();
		this.cities = CITIES.map((city) => ({
			...city,
			forecasts: [],
			lastUpdated: this.getVietnamTime().toISOString(),
		}));
		this.initializeData();
		
		// Log số lượng thành phố để kiểm tra
		console.log(`CityDataService khởi tạo với ${this.cities.length} thành phố`);
	}

	private async initializeData() {
		console.log("Initializing data service...");
		try {
			await this.updateData();

			// Set up automatic updates
			if (this.updateTimer) {
				clearInterval(this.updateTimer);
			}
			this.updateTimer = setInterval(async () => {
				console.log("Running scheduled update...");
				await this.updateData();

				// Dọn dẹp cache cũ
				this.cleanupOldCache();
			}, this.updateInterval);

			console.log("Data service initialized successfully");
		} catch (error) {
			console.error("Error initializing data service:", error);
		}
	}

	private getVietnamTime(): Date {
		// Sử dụng timezone của Việt Nam (UTC+7)
		const now = new Date();
		// Không dùng toLocaleString vì nó dựa vào locale của máy
		// Thay vào đó tính trực tiếp timezone +7 để đảm bảo nhất quán
		const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
		return new Date(utcTime + 7 * 3600000); // UTC+7
	}

	private getDayName(date: Date): string {
		const today = this.getVietnamTime();

		// Set cả 2 về đầu ngày để so sánh chính xác
		const todayStart = new Date(today);
		todayStart.setHours(0, 0, 0, 0);

		const compareDate = new Date(date);
		compareDate.setHours(0, 0, 0, 0);

		// Tạo một bản sao của today để tính toán ngày mai
		const tomorrow = new Date(todayStart);
		tomorrow.setDate(tomorrow.getDate() + 1);

		// So sánh ngày
		if (compareDate.getTime() === todayStart.getTime()) {
			return "Hôm nay";
		} else if (compareDate.getTime() === tomorrow.getTime()) {
			return "Ngày mai";
		}

		// Lấy thứ trong tuần
		const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
		return days[compareDate.getDay()];
	}

	private formatDate(date: Date): string {
		const d = new Date(date);
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

	private async fetchWeatherData(city: City): Promise<any> {
		const maxRetries = env.maxApiRetries; // Sử dụng cấu hình maxApiRetries từ env
		let attempt = 0;

		while (attempt <= maxRetries) {
			try {
				console.log(
					`Fetching weather data for ${city.name}... (ID: ${
						city.aqi_station_id
					}), attempt ${attempt + 1}`
				);
				const endpoint = `${env.airvisualApiUrl}/cities/${city.aqi_station_id}`;
				const response = await axios.get(endpoint, { timeout: 5000 }); // Thêm timeout 5 giây
				console.log(`Weather data received for ${city.name}`);

				// Lưu dữ liệu thành công vào cache cho lần sau
				this.saveSuccessfulData(city.id, response.data);

				return response.data;
			} catch (error: any) {
				attempt++;
				if (error.response && error.response.status === 404) {
					console.error(
						`City ID not found: ${city.aqi_station_id} for ${city.name}`
					);
					break; // Không retry khi 404 - ID không đúng
				} else {
					console.error(
						`Error fetching weather data for ${city.name} (attempt ${attempt}):`,
						error.message
					);

					if (attempt <= maxRetries) {
						// Chờ 1 giây trước khi thử lại
						await new Promise((resolve) => setTimeout(resolve, 1000));
					}
				}
			}
		}

		// Khi tất cả retry đều thất bại, sử dụng dữ liệu dự phòng
		return this.getLastSuccessfulData(city.id);
	}

	// Lưu dữ liệu thành công vào memory cache
	private saveSuccessfulData(cityId: string, data: any): void {
		this.cityDataCache[cityId] = {
			data,
			timestamp: Date.now(),
		};
	}

	// Lấy dữ liệu cuối cùng thành công (trong vòng 24 giờ)
	private getLastSuccessfulData(cityId: string): any {
		const cached = this.cityDataCache[cityId];

		// Nếu có dữ liệu cache và chưa quá cũ (24 giờ)
		if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
			console.log(
				`Using cached data for city ID: ${cityId} (${new Date(
					cached.timestamp
				).toLocaleString()})`
			);
			return cached.data;
		}

		return null;
	}

	private async fetchCityData(city: City): Promise<CityData> {
		try {
			// Chỉ gọi API weather data, không cần gọi API AQI riêng
			const weatherData = await this.fetchWeatherData(city);

			if (!weatherData) {
				console.log(
					`No data received for ${city.name}, trying to use fallback...`
				);
				// Thử sử dụng dữ liệu dự phòng từ cache
				const fallbackData = this.getLastSuccessfulData(city.id);
				if (fallbackData) {
					console.log(`Using fallback data for ${city.name}`);
					return {
						...city,
						forecasts: this.processForecastData(fallbackData),
						lastUpdated: this.getVietnamTime().toISOString(),
					};
				}
				throw new Error(`No data received for ${city.name}`);
			}

			const forecasts = this.processForecastData(weatherData);

			const result = {
				...city,
				forecasts,
				lastUpdated: this.getVietnamTime().toISOString(),
			};

			this.emit("cityUpdated", result);
			return result;
		} catch (error) {
			console.error(`Error processing data for city ${city.name}:`, error);
			return {
				...city,
				forecasts: [],
				lastUpdated: this.getVietnamTime().toISOString(),
			};
		}
	}

	// Hàm xử lý dữ liệu forecast từ API
	private processForecastData(weatherData: any): WeatherForecast[] {
		const forecasts: WeatherForecast[] = [];
		const today = this.getVietnamTime();
		today.setHours(0, 0, 0, 0); // Reset time to start of day

		// Kiểm tra dữ liệu đầu vào
		if (
			!weatherData ||
			!weatherData.forecasts ||
			!weatherData.forecasts.daily ||
			!Array.isArray(weatherData.forecasts.daily)
		) {
			console.warn("Invalid or missing forecast data format");
			return [];
		}

		// Xử lý dữ liệu dự báo theo ngày
		weatherData.forecasts.daily.forEach((forecast: any, index: number) => {
			if (!forecast || !forecast.ts) {
				console.warn(`Invalid forecast data at index ${index}`, forecast);
				return; // Skip this item
			}

			try {
				const forecastDate = new Date(forecast.ts);
				if (isNaN(forecastDate.getTime())) {
					console.warn(
						`Invalid date in forecast at index ${index}:`,
						forecast.ts
					);
					return; // Skip this item
				}

				forecasts.push({
					day: this.getDayName(forecastDate),
					date: this.formatDate(forecastDate),
					aqi: typeof forecast.aqi === "number" ? forecast.aqi : 0,
					temperature: {
						high: Math.round(forecast.temperature?.max || 0),
						low: Math.round(forecast.temperature?.min || 0),
					},
					humidity:
						typeof forecast.humidity === "number" ? forecast.humidity : 0,
					windSpeed:
						typeof forecast.wind?.speed === "number"
							? Math.round(forecast.wind.speed * 3.6)
							: 0, // Convert to km/h
					weather:
						typeof forecast.condition === "string"
							? forecast.condition
							: "Cloudy",
					rainChance:
						typeof forecast.probabilityOfRain === "number"
							? forecast.probabilityOfRain
							: 0,
				});
			} catch (err) {
				console.error(`Error processing forecast at index ${index}:`, err);
			}
		});

		// Sort forecasts to ensure "Hôm nay" is first, followed by the correct order of days
		forecasts.sort((a, b) => {
			if (a.day === "Hôm nay") return -1;
			if (b.day === "Hôm nay") return 1;

			// Sử dụng mapping để xử lý tốt hơn
			const dayOrder: Record<string, number> = {
				T2: 0,
				T3: 1,
				T4: 2,
				T5: 3,
				T6: 4,
				T7: 5,
				CN: 6,
			};

			const aIndex = dayOrder[a.day] !== undefined ? dayOrder[a.day] : 999;
			const bIndex = dayOrder[b.day] !== undefined ? dayOrder[b.day] : 999;

			return aIndex - bIndex;
		});

		// Giới hạn số lượng forecast (thường 5-7 ngày là đủ)
		return forecasts.slice(0, 7);
	}

	async updateData(): Promise<void> {
		const currentDate = this.getVietnamTime();
		console.log(
			"Starting data update at:",
			currentDate.toLocaleString("vi-VN"),
			"(Vietnam time)"
		);

		try {
			let anySuccessfulUpdate = false;
			let errorCities: string[] = [];

			// Update data for all cities
			const updatePromises = this.cities.map(async (city) => {
				try {
					console.log(`Updating data for ${city.name}...`);
					const cityData = await this.fetchCityData(city);

					// Kiểm tra xem có dữ liệu forecast không
					if (cityData && cityData.forecasts && cityData.forecasts.length > 0) {
						anySuccessfulUpdate = true;
						console.log(
							`Data updated successfully for ${city.name} with ${cityData.forecasts.length} forecasts`
						);
						return cityData;
					} else {
						throw new Error(`No forecast data received for ${city.name}`);
					}
				} catch (error) {
					errorCities.push(city.name);
					console.error(`Failed to update data for ${city.name}:`, error);

					// Trả về dữ liệu cũ nếu có
					const existingCity = this.cities.find((c) => c.id === city.id);
					if (
						existingCity &&
						existingCity.forecasts &&
						existingCity.forecasts.length > 0
					) {
						console.log(`Using existing data for ${city.name}`);
						return existingCity;
					}

					// Nếu không có dữ liệu cũ, trả về city với forecasts trống
					return {
						...city,
						forecasts: [],
						lastUpdated: this.getVietnamTime().toISOString(),
					};
				}
			});

			// Chờ tất cả các promise hoàn thành
			const updatedCities = await Promise.all(updatePromises);

			// Chỉ cập nhật cities nếu có ít nhất một thành phố có dữ liệu
			if (anySuccessfulUpdate) {
				this.cities = updatedCities;
				this.lastUpdate = currentDate;

				console.log("Emitting dataUpdated event...");
				this.emit("dataUpdated", this.cities);

				// Ghi log kết quả
				console.log(
					`Data update completed at: ${currentDate.toLocaleString("vi-VN")}. ` +
						`Success: ${this.cities.length - errorCities.length}/${
							this.cities.length
						} cities.`
				);

				// Nếu có lỗi, nhưng vẫn có ít nhất một thành phố thành công
				if (errorCities.length > 0) {
					console.warn(
						`Failed to update: ${errorCities.join(", ")}. Will try again later.`
					);
				}
			} else {
				// Nếu tất cả đều thất bại, giữ nguyên dữ liệu cũ và log cảnh báo
				console.error(
					"No successful data updates from any city. Keeping existing data."
				);

				// Thử lại sau 5 phút nếu tất cả đều lỗi
				console.log("Will retry update in 5 minutes");
				setTimeout(() => this.updateData(), 5 * 60 * 1000);
			}
		} catch (error) {
			console.error("Critical error updating city data:", error);

			// Đảm bảo lastUpdate không bị null nếu xảy ra lỗi nghiêm trọng
			if (!this.lastUpdate) {
				this.lastUpdate = currentDate;
			}
		}
	}

	async getCities(): Promise<CityData[]> {
		try {
			console.log("Getting cities list...");
			
			// Đảm bảo các module cần thiết được import
			const { WeatherRecord } = require('../models/WeatherRecord');
			
			// Lấy dữ liệu thời tiết mới nhất cho mỗi thành phố từ database
			const newestRecords = await WeatherRecord.aggregate([
				{
					$sort: { timestamp: -1 } // Sắp xếp theo thời gian giảm dần (mới nhất đầu tiên)
				},
				{
					$group: {
						_id: "$cityId",
						cityName: { $first: "$cityName" },
						aqi: { $first: "$aqi" },
						timestamp: { $first: "$timestamp" }
					}
				}
			]);
			
			console.log(`Lấy được ${newestRecords.length} bản ghi mới nhất từ database`);
			
			// Tạo map để tra cứu nhanh dữ liệu AQI theo cityId
			const cityAqiMap = new Map();
			newestRecords.forEach((record: { _id: string, aqi: number, timestamp: Date }) => {
				cityAqiMap.set(record._id, {
					aqi: record.aqi,
					timestamp: record.timestamp
				});
			});
			
			const now = this.getVietnamTime().toISOString();
			
			// Chuyển đổi dữ liệu từ CITIES với thông tin AQI thực tế
			return CITIES.map(city => {
				// Lấy dữ liệu AQI từ database nếu có
				const aqiData = cityAqiMap.get(city.id);
				
				// Tính toán trạng thái dựa trên giá trị AQI thực tế
				let aqi = 0;
				let status = 'good';
				
				if (aqiData) {
					aqi = Math.round(aqiData.aqi);
					// Xác định trạng thái dựa trên AQI theo tiêu chuẩn
					if (aqi <= 50) status = 'good';
					else if (aqi <= 100) status = 'moderate';
					else if (aqi <= 150) status = 'warning';
					else status = 'danger';
					
					console.log(`Thành phố ${city.name}: AQI = ${aqi}, status = ${status}`);
				} else {
					console.log(`Không tìm thấy dữ liệu AQI cho thành phố ${city.name}`);
				}
				
				// Chuyển đổi từ dữ liệu từ CITIES sang định dạng CityData
				return {
					id: city.id,
					name: city.name,
					slug: city.slug,
					coordinates: city.coordinates,
					aqi_station_id: city.aqi_station_id,
					forecasts: [],
					lastUpdated: aqiData ? aqiData.timestamp : now,
					aqi: aqi,
					status: status,
					hidden: city.hidden // Thêm trường hidden vào dữ liệu trả về
				};
			});
		} catch (error) {
			console.error('Error getting cities with real AQI data:', error);
			
			// Trong trường hợp lỗi, trả về dữ liệu cơ bản
			const now = this.getVietnamTime().toISOString();
			return CITIES.map(city => ({
				id: city.id,
				name: city.name,
				slug: city.slug,
				coordinates: city.coordinates,
				aqi_station_id: city.aqi_station_id,
				forecasts: [],
				lastUpdated: now,
				aqi: 0,
				status: 'good',
				hidden: city.hidden // Thêm trường hidden vào dữ liệu trả về
			}));
		}
	}

	async getCityById(id: string): Promise<CityData | undefined> {
		await this.checkAndUpdate();
		return this.cities.find((city) => city.id === id);
	}

	async getCityBySlug(slug: string): Promise<CityData | undefined> {
		await this.checkAndUpdate();
		return this.cities.find((city) => city.slug === slug);
	}

	async searchCities(query: string): Promise<CityData[]> {
		await this.checkAndUpdate();
		const lowercaseQuery = query.toLowerCase();
		return this.cities.filter(
			(city) =>
				(city.name.toLowerCase().includes(lowercaseQuery) ||
				city.slug.includes(lowercaseQuery))
				// Không lọc theo trường hidden - hiển thị tất cả thành phố trong kết quả tìm kiếm
		);
	}

	private async checkAndUpdate(): Promise<void> {
		const now = this.getVietnamTime();
		const currentFormatDate = this.formatDate(now);

		// Kiểm tra dữ liệu hiện tại
		const dataIsValid = this.cities.every(
			(city) =>
				city.forecasts &&
				city.forecasts.length > 0 &&
				city.forecasts.some(
					(f) => f.day === "Hôm nay" && f.date === currentFormatDate
				)
		);

		// Kiểm tra thời gian đã trôi qua từ lần cập nhật cuối
		const timeElapsed = this.lastUpdate
			? now.getTime() - this.lastUpdate.getTime()
			: Number.MAX_SAFE_INTEGER;

		// Nếu vừa cập nhật gần đây (trong vòng 5 phút) và dữ liệu vẫn hợp lệ, không cần cập nhật
		if (dataIsValid && timeElapsed < 5 * 60 * 1000) {
			return;
		}

		// Cập nhật nếu:
		// 1. Chưa có dữ liệu (this.lastUpdate = null)
		// 2. Đã hết hạn cập nhật (quá interval)
		// 3. Dữ liệu không hợp lệ (thiếu ngày hôm nay)
		const needsUpdate =
			!this.lastUpdate || timeElapsed >= this.updateInterval || !dataIsValid;

		if (needsUpdate) {
			try {
				console.log("Data update needed, initiating update...");
				await this.updateData();
			} catch (error) {
				console.error("Failed to update data:", error);

				// Nếu không còn dữ liệu hợp lệ, thử lại sau 30 giây
				if (!dataIsValid) {
					console.log("Will retry update in 30 seconds");
					setTimeout(() => this.updateData(), 30 * 1000);
				}
			}
		}
	}

	getLastUpdateTime(): Date | null {
		return this.lastUpdate;
	}

	// Dọn dẹp cache quá cũ để tránh memory leak
	private cleanupOldCache(): void {
		const now = Date.now();
		const maxAge = env.maxCacheAgeHours * 60 * 60 * 1000; // Sử dụng cấu hình maxCacheAgeHours từ env

		let countRemoved = 0;
		for (const cityId in this.cityDataCache) {
			if (now - this.cityDataCache[cityId].timestamp > maxAge) {
				delete this.cityDataCache[cityId];
				countRemoved++;
			}
		}

		if (countRemoved > 0) {
			console.log(`Removed ${countRemoved} expired cache entries`);
		}
	}

	// Cleanup method
	destroy() {
		if (this.updateTimer) {
			clearInterval(this.updateTimer);
			this.updateTimer = null;
		}

		// Xóa tất cả events listeners để tránh memory leak
		this.removeAllListeners();

		// Xóa cache
		this.cityDataCache = {};

		console.log("CityDataService destroyed successfully");
	}

	// Lấy tất cả các thành phố
	public getAllCities() {
		// Đảm bảo trả về tất cả thành phố, kể cả có thuộc tính hidden
		return this.cities;
	}

	// Lấy chỉ các thành phố có hiện thị trên giao diện chính (không bị ẩn)
	public getVisibleCities() {
		return this.cities.filter(city => !city.hidden);
	}
}

// Tạo một instance duy nhất của service
export const cityDataService = new CityDataService();
