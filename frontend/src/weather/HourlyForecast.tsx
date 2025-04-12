import React, { useState, useRef, useEffect } from "react";
import { WeatherData } from "@/types/weather";

interface HourlyForecastProps {
	weatherData: WeatherData;
}

const HourlyForecast = ({ weatherData }: HourlyForecastProps) => {
	// Lấy dữ liệu dự báo theo giờ từ API
	const hourlyForecasts = weatherData.forecasts?.hourly || [];

	// Lấy 24 giờ đầu tiên nếu có
	const hourlyData = hourlyForecasts.slice(0, 24).map((forecast) => ({
		time: new Date(forecast.ts).toLocaleTimeString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
		}),
		temp: Math.round(forecast.temperature),
		windSpeed: forecast.wind?.speed || 0,
		humidity: forecast.humidity || 0,
		aqi: forecast.aqi || 0,
		icon: getWeatherIcon(forecast.icon || ""),
	}));

	// Hàm để xác định icon thời tiết bằng emoji
	function getWeatherIcon(icon: string): string {
		if (icon.includes("rain")) return "🌧️";
		if (icon.includes("cloud")) return "☁️";
		if (icon.includes("clear") || icon.includes("sun")) return "☀️";
		if (icon.includes("snow")) return "❄️";
		if (icon.includes("fog") || icon.includes("mist")) return "🌫️";
		if (icon.includes("thunder")) return "⛈️";
		if (icon.includes("night")) return "🌙";
		return "🌡️";
	}

	const getAqiColorClass = (aqi: number) => {
		if (aqi <= 50) return "bg-green-500";
		if (aqi <= 100) return "bg-yellow-500";
		if (aqi <= 150) return "bg-orange-500";
		if (aqi <= 200) return "bg-red-500";
		if (aqi <= 300) return "bg-purple-500";
		return "bg-red-800";
	};

	// Refs và state cho animation slide
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [scrollPosition, setScrollPosition] = useState(0);
	const [maxScroll, setMaxScroll] = useState(0);
	const [visibleItems, setVisibleItems] = useState(5); // Số lượng item hiển thị mặc định

	// Tính toán vị trí scroll và số lượng item hiển thị
	useEffect(() => {
		const updateScrollInfo = () => {
			if (scrollContainerRef.current) {
				const container = scrollContainerRef.current;
				setMaxScroll(container.scrollWidth - container.clientWidth);

				// Tính số lượng item hiển thị dựa trên kích thước container
				const itemWidth = 96; // w-24 = 6rem = 96px
				const visibleCount = Math.floor(container.clientWidth / itemWidth);
				setVisibleItems(visibleCount);
			}
		};

		updateScrollInfo();
		window.addEventListener("resize", updateScrollInfo);

		return () => {
			window.removeEventListener("resize", updateScrollInfo);
		};
	}, [hourlyData.length]);

	// Xử lý sự kiện scroll
	const handleScroll = () => {
		if (scrollContainerRef.current) {
			setScrollPosition(scrollContainerRef.current.scrollLeft);
		}
	};

	// Hàm scroll sang trái
	const scrollLeft = () => {
		if (scrollContainerRef.current) {
			const itemWidth = 96; // w-24 = 6rem = 96px
			const newPosition = Math.max(
				0,
				scrollPosition - itemWidth * visibleItems
			);

			scrollContainerRef.current.scrollTo({
				left: newPosition,
				behavior: "smooth",
			});
		}
	};

	// Hàm scroll sang phải
	const scrollRight = () => {
		if (scrollContainerRef.current) {
			const itemWidth = 96; // w-24 = 6rem = 96px
			const newPosition = Math.min(
				maxScroll,
				scrollPosition + itemWidth * visibleItems
			);

			scrollContainerRef.current.scrollTo({
				left: newPosition,
				behavior: "smooth",
			});
		}
	};

	// Tính toán phần trăm đã scroll
	const scrollPercentage =
		maxScroll > 0 ? (scrollPosition / maxScroll) * 100 : 0;

	// Nếu không có dữ liệu dự báo, hiển thị thông báo
	if (hourlyData.length === 0) {
		return (
			<div>
				<h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
					Dự báo theo giờ
				</h2>
				<div className="bg-[#1f2937] text-white rounded-lg p-4 text-center">
					Không có dữ liệu dự báo theo giờ
				</div>
			</div>
		);
	}

	return (
		<div>
			<h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
				Dự báo theo giờ cho {weatherData.name}
			</h2>

			<div className="bg-[#1f2937] text-white rounded-lg p-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
					<div>
						<h3 className="text-base font-medium mb-2">Dự báo 24 giờ tới</h3>
						<p className="text-sm text-gray-300">
							Cập nhật mới nhất: {new Date().toLocaleString("vi-VN")}
						</p>
					</div>
				</div>

				<div
					ref={scrollContainerRef}
					className="flex overflow-x-auto pb-2 space-x-2 scrollbar-hide"
					onScroll={handleScroll}
					style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
				>
					{hourlyData.map((hour, index) => (
						<div
							key={index}
							className="flex-shrink-0 w-24 bg-[#2d3748] rounded-lg p-3 text-center"
						>
							<div className="font-medium">{hour.time}</div>
							<div className="text-4xl my-2">{hour.icon}</div>
							<div className="text-xl font-bold">{hour.temp}°</div>
							<div className="text-sm text-gray-300 mt-1">
								{hour.windSpeed.toFixed(1)} m/s
							</div>
							<div className="text-sm text-gray-300">{hour.humidity}%</div>
							<div className="mt-2">
								<span
									className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getAqiColorClass(
										hour.aqi
									)}`}
								>
									AQI {hour.aqi}
								</span>
							</div>
						</div>
					))}
				</div>

				<div className="flex justify-between mt-4">
					<button
						className={`text-gray-400 hover:text-white focus:outline-none transition-colors ${
							scrollPosition <= 0 ? "opacity-50 cursor-not-allowed" : ""
						}`}
						onClick={scrollLeft}
						disabled={scrollPosition <= 0}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
					<div className="h-1 bg-gray-600 rounded-full flex-grow mx-2 self-center">
						<div
							className="h-1 bg-blue-500 rounded-full transition-all duration-300"
							style={{ width: `${scrollPercentage}%` }}
						></div>
					</div>
					<button
						className={`text-gray-400 hover:text-white focus:outline-none transition-colors ${
							scrollPosition >= maxScroll ? "opacity-50 cursor-not-allowed" : ""
						}`}
						onClick={scrollRight}
						disabled={scrollPosition >= maxScroll}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

export default HourlyForecast;
