import { WeatherResponse, WeatherHistoryResponse } from "@/types/weather";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Service để gọi API thời tiết từ backend
 */
export const weatherService = {
	/**
	 * Lấy thông tin thời tiết dựa trên ID thành phố
	 */
	async getWeatherByCityId(cityId: string): Promise<WeatherResponse> {
		try {
			const response = await fetch(`${API_URL}/weather/${cityId}`);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.data?.message || "Failed to fetch weather data"
				);
			}

			return await response.json();
		} catch (error) {
			console.error("Error fetching weather data:", error);
			throw error;
		}
	},

	/**
	 * Lấy lịch sử thời tiết của một thành phố
	 * @param cityId ID của thành phố
	 * @param days Số ngày lấy dữ liệu (mặc định 7 ngày)
	 */
	async getWeatherHistory(
		cityId: string,
		days: number = 7
	): Promise<WeatherHistoryResponse> {
		try {
			const response = await fetch(
				`${API_URL}/weather/history/${cityId}?days=${days}`
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.data?.message || "Failed to fetch weather history data"
				);
			}

			return await response.json();
		} catch (error) {
			console.error("Error fetching weather history data:", error);
			throw error;
		}
	},
};
