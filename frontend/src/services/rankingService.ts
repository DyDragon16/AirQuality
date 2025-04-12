import { WeatherRanking } from "@/types/ranking";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Service để gọi API ranking từ backend
 */
export const rankingService = {
	/**
	 * Lấy ranking AQI của các thành phố
	 */
	async getAQIRanking(limit: number = 10): Promise<WeatherRanking[]> {
		try {
			const response = await fetch(`${API_URL}/ranking/aqi?limit=${limit}`);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.data?.message || "Failed to fetch AQI ranking data"
				);
			}

			const data = await response.json();
			return data.data.ranking;
		} catch (error) {
			console.error("Error fetching AQI ranking data:", error);
			throw error;
		}
	},

	/**
	 * Lấy ranking nhiệt độ của các thành phố
	 */
	async getTemperatureRanking(
		limit: number = 10,
		sort: "asc" | "desc" = "desc"
	): Promise<WeatherRanking[]> {
		try {
			const response = await fetch(
				`${API_URL}/ranking/temperature?limit=${limit}&sort=${sort}`
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.data?.message || "Failed to fetch temperature ranking data"
				);
			}

			const data = await response.json();
			return data.data.ranking;
		} catch (error) {
			console.error("Error fetching temperature ranking data:", error);
			throw error;
		}
	},

	/**
	 * Yêu cầu cập nhật dữ liệu thời tiết mới
	 */
	async updateWeatherData(): Promise<void> {
		try {
			const response = await fetch(`${API_URL}/ranking/update-data`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.data?.message || "Failed to update weather data"
				);
			}
		} catch (error) {
			console.error("Error updating weather data:", error);
			throw error;
		}
	},
};
