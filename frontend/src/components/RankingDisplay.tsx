"use client";

import React from "react";
import { WeatherRanking } from "@/types/ranking";
import Link from "next/link";
import { getAQIColor, getAQIText } from "@/utils/aqi";
import { CITY_DATA } from "@/constants/cities";


interface RankingDisplayProps {
	title: string;
	data: WeatherRanking[];
	isLoading: boolean;
	error: Error | null;
	showAQI?: boolean;
	showTemperature?: boolean;
	limit?: number;
}

export const RankingDisplay: React.FC<RankingDisplayProps> = ({
	title,
	data,
	isLoading,
	error,
	showAQI = true,
	showTemperature = true,
	limit = 5,
}) => {
	// Hiển thị trạng thái loading
	if (isLoading) {
		return (
			<div className="p-6 bg-white rounded-lg shadow-md h-full">
				<h2 className="text-xl font-bold mb-4 text-black border-b pb-2">
					{title}
				</h2>
				<div className="space-y-4 animate-pulse">
					{[...Array(limit)].map((_, i) => (
						<div
							key={i}
							className="flex items-center p-3 border-b border-gray-100"
						>
							<div className="w-8 h-8 bg-gray-200 rounded-full mr-3 flex-shrink-0"></div>
							<div className="flex-grow">
								<div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
								<div className="h-3 bg-gray-200 rounded w-1/3"></div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	// Hiển thị lỗi
	if (error) {
		return (
			<div className="p-6 bg-white rounded-lg shadow-md h-full">
				<h2 className="text-xl font-bold mb-4 text-black border-b pb-2">
					{title}
				</h2>
				<div className="text-red-500 p-4 bg-red-50 rounded-md">
					<div className="flex items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5 mr-2"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clipRule="evenodd"
							/>
						</svg>
						Không thể tải dữ liệu: {error.message}
					</div>
				</div>
			</div>
		);
	}

	// Hiển thị khi không có dữ liệu
	if (!data || data.length === 0) {
		return (
			<div className="p-6 bg-white rounded-lg shadow-md h-full">
				<h2 className="text-xl font-bold mb-4 text-black border-b pb-2">
					{title}
				</h2>
				<div className="text-gray-500 p-4 bg-gray-50 rounded-md flex items-center justify-center h-40">
					<div className="text-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-10 w-10 mx-auto text-gray-400 mb-2"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
							/>
						</svg>
						<p>Không có dữ liệu ranking</p>
					</div>
				</div>
			</div>
		);
	}

	// Giới hạn số lượng hiển thị
	const displayData = data.slice(0, limit);

	// Hàm lấy màu cho rank
	const getRankColor = (index: number) => {
		if (index === 0) return "bg-yellow-400 text-black"; // Hạng 1: vàng
		if (index === 1) return "bg-gray-300 text-black"; // Hạng 2: bạc
		if (index === 2) return "bg-amber-600 text-white"; // Hạng 3: đồng
		return "bg-gray-100 text-black"; // Các hạng khác
	};

	// Hàm lấy emoji cho nhiệt độ
	const getTemperatureEmoji = (temp: number) => {
		if (temp >= 35) return "🔥"; // Rất nóng
		if (temp >= 30) return "☀️"; // Nóng
		if (temp >= 25) return "⛅"; // Ấm áp
		if (temp >= 20) return "🌤️"; // Mát mẻ
		if (temp >= 15) return "🌥️"; // Hơi lạnh
		if (temp >= 10) return "❄️"; // Lạnh
		return "🧊"; // Rất lạnh
	};

	return (
		<div className="p-6 bg-white rounded-lg shadow-md h-full">
			<h2 className="text-xl font-bold mb-4 text-black border-b pb-2">
				{title}
			</h2>
			<div className="space-y-0.5">
				{displayData.map((item, index) => {
					// Tìm slug của thành phố từ CITY_DATA
					const cityEntry = Object.entries(CITY_DATA).find(
						([, data]) => data.name === item.cityName
					);
					const citySlug = cityEntry ? cityEntry[1].slug : "";

					// Xác định màu AQI
					const aqiColor = getAQIColor(item.averageAQI);
					const aqiText = getAQIText(item.averageAQI);

					// Xác định màu cho rank
					const rankColor = getRankColor(index);

					return (
						<Link
							key={item.cityId}
							href={`/city/${citySlug}`}
							className={`flex items-center p-3 hover:bg-blue-50 rounded-md transition border-b ${
								index === displayData.length - 1 ? "" : "border-gray-100"
							}`}
						>
							<div
								className={`w-8 h-8 flex items-center justify-center ${rankColor} rounded-full mr-3 font-bold shadow-sm`}
							>
								{index + 1}
							</div>
							<div className="flex-grow">
								<div className="font-semibold text-black text-base">
									{item.cityName}
								</div>
								<div className="flex space-x-4 text-sm items-center mt-1">
									{showAQI && (
										<span className="inline-flex items-center bg-gray-50 px-2 py-1 rounded-md">
											<span
												className="w-3 h-3 rounded-full mr-1"
												style={{ backgroundColor: aqiColor }}
											></span>
											<span className="font-medium text-black" title={aqiText}>
												AQI: {Math.round(item.averageAQI)}
											</span>
										</span>
									)}

									{showTemperature && (
										<span className="bg-gray-50 px-2 py-1 rounded-md flex items-center">
											<span className="mr-1">
												{getTemperatureEmoji(item.averageTemperature)}
											</span>
											<span className="text-black font-medium">
												{Math.round(item.averageTemperature)}°C
											</span>
										</span>
									)}
								</div>
							</div>
							<div className="text-blue-500">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
};
