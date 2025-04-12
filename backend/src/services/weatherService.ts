import weatherRepository from "../repositories/weatherRepository";

/**
 * Service Pattern cho việc xử lý business logic thời tiết
 */
class WeatherService {
	/**
	 * Lấy thông tin thời tiết và format dữ liệu nếu cần
	 */
	async getWeatherByCityId(cityId: string): Promise<any> {
		// Gọi repository để lấy dữ liệu
		const weatherData = await weatherRepository.getWeatherByCityId(cityId);
		console.log("Service received weather data");

		// Trả về dữ liệu thô
		return weatherData;
	}
}

// Singleton pattern
export default new WeatherService();
