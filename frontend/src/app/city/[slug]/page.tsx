"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/layout/Navbar";
import { WeatherCard } from "@/weather/WeatherCard";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import HourlyForecast from "@/weather/HourlyForecast";
import DailyForecast from "@/weather/DailyForecast";
import Footer from "@/layout/Footer";
import { useWeatherData } from "@/hooks/useWeatherData";
import { CITY_DATA } from "@/constants/cities";
import { getAQIGradient } from "@/utils/aqi";
import { AQIDisplay } from "@/air-quality/AQIDisplay";
import PollutantTable from "@/air-quality/PollutantTable";
import WHORatioDisplay from "@/air-quality/WHORatioDisplay";
import WeatherHistory from "@/weather/WeatherHistory";
import FavoriteButton from "@/components/FavoriteButton";
import useRecentlyViewed from "@/hooks/useRecentlyViewed";

export default function CityPage() {
	const params = useParams();
	const [error, setError] = useState<string | null>(null);
	const { addRecentCity } = useRecentlyViewed();

	// Tìm thành phố dựa trên slug
	const cityEntry = Object.entries(CITY_DATA).find(
		([, data]) => data.slug === params.slug
	);
	const cityName = cityEntry ? cityEntry[0] : null;
	const cityData = cityEntry ? cityEntry[1] : null;

	// Sử dụng custom hook để lấy dữ liệu thời tiết
	const {
		weatherData,
		isLoading,
		error: weatherError,
		refetch,
		formattedLastUpdated,
		lastUpdatedTimeAgo,
		cachedAt,
	} = useWeatherData(cityData?.endpoint || "", {
		enabled: !!cityData,
	});

	useEffect(() => {
		// Reset error khi thay đổi thành phố
		if (weatherError) {
			setError(weatherError.message);
		} else {
			setError(null);
		}
	}, [weatherError, params.slug]);

	// Lưu thành phố vào danh sách đã xem gần đây khi trang được tải
	useEffect(() => {
		if (cityData) {
			addRecentCity(cityData.id);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cityData]);

	if (!cityName || !cityData) {
		return (
			<div className="min-h-screen bg-[#f6f6f7]">
				<Navbar />
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
					<ErrorDisplay message="Không tìm thấy thành phố" />
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f6f6f7]">
			<Navbar />

			{/* Hero Section */}
			<div
				className={`relative bg-gradient-to-br ${
					weatherData
						? getAQIGradient(weatherData.current?.aqi || 0)
						: "bg-gray-50"
				} text-white pt-16 pb-12`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Main Weather Card */}
					{weatherData && !isLoading && (
						<div className="container mx-auto mt-8">
							<div className="flex justify-center items-start gap-6">
								<div className="w-[1000px]">
									<WeatherCard weatherData={weatherData} />
								</div>
								<div className="w-[400px]">
									<AQIDisplay
										aqi={weatherData.current?.aqi || 0}
										compact={true}
										pollutant={weatherData.current?.mainPollutant}
										temperature={weatherData.current?.temperature}
										humidity={weatherData.current?.humidity}
										windSpeed={weatherData.current?.wind?.speed}
									/>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Decorative pattern */}
				<div className="absolute inset-0 opacity-10">
					<div
						className="absolute inset-0"
						style={{
							backgroundImage:
								"radial-gradient(circle, white 1px, transparent 1px)",
							backgroundSize: "30px 30px",
						}}
					></div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Tên thành phố, thời gian cập nhật và các nút hành động */}
				<div className="flex flex-col sm:flex-row justify-between items-center mb-4 bg-white rounded-lg shadow-sm p-4">
					<div className="flex items-center mb-3 sm:mb-0">
						<h1 className="text-xl font-bold text-gray-800 mr-2">{cityName}</h1>
						{cityData && <FavoriteButton cityId={cityData.id} className="ml-2" size={20} />}
						<div className="ml-4">
							<p className="text-gray-600 text-sm">
								Cập nhật lần cuối:{" "}
								{formattedLastUpdated ? (
									<>
										<span className="font-medium">{formattedLastUpdated}</span>
										<span className="ml-2 text-gray-500 text-xs italic">
											({lastUpdatedTimeAgo})
										</span>
									</>
								) : (
									"Đang tải..."
								)}
							</p>
							{cachedAt && (
								<p className="text-gray-400 text-xs">
									Dữ liệu được lấy từ cache {cachedAt}
								</p>
							)}
						</div>
					</div>
					<button
						onClick={refetch}
						disabled={isLoading}
						className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						<span>{isLoading ? "Đang cập nhật..." : "Làm mới dữ liệu"}</span>
					</button>
				</div>

				{isLoading && (
					<div className="flex justify-center items-center py-8">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
					</div>
				)}

				{(error || weatherError) && !isLoading && (
					<div className="my-8">
						<ErrorDisplay message={error || "Lỗi khi tải dữ liệu thời tiết"} />
					</div>
				)}

				{weatherData && !isLoading && (
					<div className="space-y-6">
						{/* Hourly Forecast */}
						<div className="bg-white rounded-lg shadow-sm p-4">
							<HourlyForecast weatherData={weatherData} />
						</div>

						{/* Hai bảng nằm cạnh nhau: Dự báo theo ngày bên trái và Chất gây ô nhiễm bên phải */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Daily Forecast - Bảng dự báo theo ngày (bên trái) */}
							<div className="bg-white rounded-lg shadow-sm p-4 md:col-span-1">
								<h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
									Dự báo hàng ngày
								</h2>
								<DailyForecast weatherData={weatherData} />
							</div>

							{/* Bảng chất gây ô nhiễm không khí (bên phải) */}
							{weatherData.current?.pollutants &&
								weatherData.current.pollutants.length > 0 && (
									<div className="md:col-span-1">
										<PollutantTable
											pollutants={weatherData.current.pollutants}
											cityName={cityName}
										/>
									</div>
								)}
						</div>

						{/* Bảng tỉ lệ theo chuẩn WHO */}
						{weatherData.current?.pollutants &&
							weatherData.current.pollutants.length > 0 && (
								<div>
									{(() => {
										const pm25 = weatherData.current?.pollutants.find(
											(p) =>
												p.pollutantName === "pm25" ||
												p.pollutantName === "PM2.5"
										);
										return pm25 ? (
											<WHORatioDisplay pm25Value={pm25.concentration} />
										) : null;
									})()}
								</div>
							)}

						{/* Lịch sử dữ liệu thời tiết */}
						{cityData && (
							<div className="bg-white rounded-lg shadow-sm p-4">
								<WeatherHistory cityId={cityData.slug.replace(/-/g, "")} cityName={cityName} />
							</div>
						)}
					</div>
				)}
			</div>

			{/* Add Footer at the end */}
			<Footer />
		</div>
	);
}
