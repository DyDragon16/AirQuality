import React from "react";
import { WeatherData } from "@/types/weather";

interface DailyForecastProps {
	weatherData: WeatherData;
}

const DailyForecast = ({ weatherData }: DailyForecastProps) => {
	// Lấy dữ liệu dự báo theo ngày từ API
	const dailyForecasts = weatherData.forecasts?.daily || [];

	// Hàm lấy màu dựa trên chỉ số AQI
	const getAqiColorClass = (aqi: number) => {
		if (aqi <= 50) return "bg-green-500";
		if (aqi <= 100) return "bg-yellow-500";
		if (aqi <= 150) return "bg-orange-500";
		if (aqi <= 200) return "bg-red-500";
		if (aqi <= 300) return "bg-purple-500";
		return "bg-red-800";
	};

	// Hàm lấy biểu tượng thời tiết dựa trên condition
	const getWeatherIcon = (condition: string, probabilityOfRain?: number) => {
		if (probabilityOfRain && probabilityOfRain >= 50) return "🌧️";

		const conditionLower = condition?.toLowerCase() || "";
		if (
			conditionLower.includes("rain") ||
			conditionLower.includes("thunderstorm")
		)
			return "🌧️";
		if (conditionLower.includes("cloud")) return "☁️";
		if (conditionLower.includes("sunny") || conditionLower.includes("clear"))
			return "☀️";
		if (conditionLower.includes("snow")) return "❄️";
		if (conditionLower.includes("fog") || conditionLower.includes("mist"))
			return "🌫️";

		return "☁️"; // Mặc định
	};

	// Hàm lấy hướng mũi tên gió
	const getWindDirection = (direction: number) => {
		if (direction < 45 || direction >= 315) return "↑"; // North
		if (direction >= 45 && direction < 135) return "→"; // East
		if (direction >= 135 && direction < 225) return "↓"; // South
		return "←"; // West
	};

	// Hàm chuyển đổi ngày sang múi giờ Việt Nam (UTC+7)
	const getVietnamTime = (date: Date): Date => {
		// Sử dụng timezone của Việt Nam (UTC+7)
		const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
		return new Date(utcTime + 7 * 3600000); // UTC+7
	};

	// Hàm lấy tên ngày trong tuần (tiếng Việt) - đồng bộ với backend
	const getDayName = (date: Date) => {
		const inputDate = new Date(date);
		const today = getVietnamTime(new Date());

		// Set cả 2 về đầu ngày để so sánh chính xác
		const todayStart = new Date(today);
		todayStart.setHours(0, 0, 0, 0);

		const compareDate = getVietnamTime(inputDate);
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
	};

	// Nếu không có dữ liệu dự báo, hiển thị thông báo
	if (dailyForecasts.length === 0) {
		return (
			<div className="text-center text-gray-500">
				Không có dữ liệu dự báo theo ngày
			</div>
		);
	}

	return (
		<div>
			<h3 className="text-lg font-medium mb-4 text-gray-900">
				Dự báo chất lượng không khí (AQI) tại {weatherData.name}
			</h3>

			<div className="bg-[#1f2937] text-white rounded-lg p-2">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<tbody>
							{dailyForecasts.map((forecast, index) => {
								// Lấy ngày từ timestamp
								const forecastDate = new Date(forecast.ts);
								// Lấy tên ngày trong tuần (tiếng Việt)
								const dayName = getDayName(forecastDate);
								const weatherIcon = getWeatherIcon(
									forecast.condition,
									forecast.probabilityOfRain
								);
								const rainProb = forecast.probabilityOfRain
									? `${Math.round(forecast.probabilityOfRain)}%`
									: "";

								return (
									<tr
										key={index}
										className="border-b border-gray-700 hover:bg-[#2d3748]"
									>
										<td className="py-2 pl-2 pr-2 whitespace-nowrap">
											<div className="font-medium">{dayName}</div>
										</td>
										<td className="py-2 px-1 whitespace-nowrap">
											<div
												className={`inline-block px-2 py-1 rounded-md text-white font-medium ${getAqiColorClass(
													forecast.aqi
												)}`}
											>
												{forecast.aqi}
											</div>
										</td>
										<td className="py-2 px-1 whitespace-nowrap text-center">
											<div className="text-xl">{weatherIcon}</div>
											{rainProb && (
												<div className="text-xs text-blue-400">
													{rainProb}
												</div>
											)}
										</td>
										<td className="py-2 px-1 whitespace-nowrap">
											<div className="flex items-center">
												<span className="font-medium">
													{Math.round(forecast.temperature.max)}°
												</span>
												<span className="mx-1 text-gray-400">/</span>
												<span className="text-gray-300">
													{Math.round(forecast.temperature.min)}°
												</span>
											</div>
										</td>
										<td className="py-2 px-1 whitespace-nowrap">
											<div className="flex items-center">
												<span className="text-gray-400 mr-1">
													{getWindDirection(forecast.wind.direction)}
												</span>
												<span>
													{Math.round(forecast.wind.speed * 3.6)} km/h
												</span>
											</div>
										</td>
										<td className="py-2 px-1 whitespace-nowrap">
											<div className="flex items-center">
												<span className="text-blue-400 mr-1">💧</span>
												<span>{forecast.humidity}%</span>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default DailyForecast;
