import axios from "axios";
import { API_ENDPOINTS } from "../constants/apiConfig";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface City {
	id: string;
	name: string;
	slug: string;
	aqi_station_id?: string;
	coordinates?: {
		latitude: number;
		longitude: number;
	};
	forecasts?: Array<{
		date: string;
		aqi: number;
		status: string;
	}>;
	lastUpdated?: string;
	lastUpdate?: string;
	stations?: number;
	status?: string;
	aqi?: number;
}

class CityService {
	/**
	 * Tiện ích: Gọi API với xử lý lỗi và retry
	 */
	private async fetchWithErrorHandling(
		url: string,
		retries = 3,
		timeout = 60000
	) {
		let attemptCount = 0;

		while (attemptCount < retries) {
			try {
				console.log(
					`Đang gọi API ${url} (lần thử ${attemptCount + 1}/${retries})`
				);

				return await axios.get(url, {
					timeout: timeout,
					validateStatus: function (status) {
						return status < 500; // Chấp nhận status code < 500
					},
				});
			} catch (error) {
				attemptCount++;
				console.error(
					`Lỗi khi gọi API ${url} (lần thử ${attemptCount}/${retries}):`,
					error
				);

				// Nếu là lỗi timeout và còn cơ hội thử lại
				if (attemptCount < retries) {
					console.log(`Đang thử lại sau 1 giây...`);
					await new Promise((resolve) => setTimeout(resolve, 1000)); // Đợi 1 giây trước khi thử lại
				} else {
					console.error(
						`Đã thử ${retries} lần nhưng vẫn thất bại khi gọi ${url}`
					);
					return null;
				}
			}
		}

		return null;
	}

	// Lấy danh sách tất cả các thành phố
	async getAllCities(forceRefresh = false) {
		try {
			console.log(
				"Đang lấy danh sách thành phố từ DB:",
				API_ENDPOINTS.WEATHER.CITIES
			);

			const response = await this.fetchWithErrorHandling(
				API_ENDPOINTS.WEATHER.CITIES,
				3,
				60000
			);

			if (!response) {
				console.error("Không thể kết nối đến API để lấy danh sách thành phố");
				return [];
			}

			// Debug response data
			console.log("API response:", response.status, response.data);

			// Xử lý dữ liệu trả về từ API
			let citiesData: City[] = [];

			if (Array.isArray(response.data)) {
				citiesData = response.data;
			} else if (response.data && Array.isArray(response.data.data)) {
				// Trong trường hợp API trả về dạng { data: [...] }
				citiesData = response.data.data;
			} else {
				console.error("Dữ liệu API không đúng định dạng:", response.data);
				return [];
			}

			// Đảm bảo các trường dữ liệu chính xác
			return citiesData.map((city) => {
				const aqi = city.aqi ? Number(city.aqi) : 0;
				let status = city.status || "";

				// Nếu có AQI nhưng không có status, tính status từ AQI
				if (!status && aqi > 0) {
					status = this.getStatusFromAQI(aqi);
				}

				return {
					...city,
					aqi,
					status,
				};
			});
		} catch (error) {
			console.error("Lỗi khi lấy danh sách thành phố:", error);
			return []; // Trả về mảng rỗng thay vì ném lỗi
		}
	}

	// Lấy thông tin chi tiết của thành phố theo ID
	async getCityById(id: string) {
		try {
			const response = await this.fetchWithErrorHandling(
				API_ENDPOINTS.CITIES.BY_ID(id),
				3,
				60000
			);

			if (!response) {
				console.error(`Không thể kết nối đến API để lấy thành phố ID ${id}`);
				return null;
			}

			return response.data;
		} catch (error) {
			console.error(`Lỗi khi lấy thành phố với ID ${id}:`, error);
			return null;
		}
	}

	// Lấy thông tin chi tiết của thành phố theo slug
	async getCityBySlug(slug: string) {
		try {
			const response = await this.fetchWithErrorHandling(
				API_ENDPOINTS.CITIES.BY_SLUG(slug),
				3,
				60000
			);

			if (!response) {
				console.error(
					`Không thể kết nối đến API để lấy thành phố với slug ${slug}`
				);
				return null;
			}

			return response.data;
		} catch (error) {
			console.error(`Lỗi khi lấy thành phố với slug ${slug}:`, error);
			return null;
		}
	}

	// Tìm kiếm thành phố theo từ khóa
	async searchCities(query: string) {
		try {
			const response = await this.fetchWithErrorHandling(
				API_ENDPOINTS.CITIES.SEARCH(query),
				3,
				60000
			);

			if (!response) {
				console.error(
					`Không thể kết nối đến API để tìm kiếm thành phố với từ khóa ${query}`
				);
				return [];
			}

			return response.data;
		} catch (error) {
			console.error(`Lỗi khi tìm kiếm thành phố với từ khóa ${query}:`, error);
			return [];
		}
	}

	// Chuyển đổi trạng thái AQI thành nhãn dễ đọc
	getStatusLabel(status: string): string {
		console.log("getStatusLabel được gọi với giá trị:", status);

		switch (status) {
			case "good":
				return "Tốt";
			case "moderate":
				return "Trung bình";
			case "warning":
			case "unhealthy-sensitive":
				return "Kém";
			case "danger":
			case "unhealthy":
				return "Không lành mạnh";
			case "very-unhealthy":
				return "Rất không lành mạnh";
			case "hazardous":
				return "Nguy hiểm";
			case "unknown":
				return "Chưa cập nhật";
			default:
				console.log("Status không khớp với bất kỳ case nào:", status);
				return "Chưa cập nhật";
		}
	}

	// Chuyển đổi giá trị AQI thành status
	getStatusFromAQI(aqi: number): string {
		if (aqi <= 50) return "good";
		if (aqi <= 100) return "moderate";
		if (aqi <= 150) return "warning";
		return "danger";
	}
}

export default new CityService();
