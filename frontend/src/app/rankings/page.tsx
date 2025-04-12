"use client";

import React, { useState } from "react";
import { Navbar } from "@/layout/Navbar";
import Footer from "@/layout/Footer";
import { RankingDisplay } from "@/components/RankingDisplay";
import { useAQIRanking, useTemperatureRanking } from "@/hooks/useRankingData";
import { rankingService } from "@/services/rankingService";

export default function RankingsPage() {
	const [isUpdating, setIsUpdating] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<string | null>(null);

	// Lấy dữ liệu ranking AQI
	const {
		rankingData: aqiRankingData,
		isLoading: aqiLoading,
		error: aqiError,
		refetch: refetchAQI,
	} = useAQIRanking({ limit: 10 });

	// Lấy dữ liệu ranking nhiệt độ cao nhất
	const {
		rankingData: hotCitiesData,
		isLoading: hotCitiesLoading,
		error: hotCitiesError,
		refetch: refetchHotCities,
	} = useTemperatureRanking({ limit: 10, sort: "desc" });

	// Lấy dữ liệu ranking nhiệt độ thấp nhất
	const {
		rankingData: coldCitiesData,
		isLoading: coldCitiesLoading,
		error: coldCitiesError,
		refetch: refetchColdCities,
	} = useTemperatureRanking({ limit: 10, sort: "asc" });

	// Xử lý cập nhật dữ liệu
	const handleUpdateData = async () => {
		try {
			setIsUpdating(true);
			await rankingService.updateWeatherData();

			// Đợi 2 giây trước khi refresh dữ liệu
			setTimeout(async () => {
				await Promise.all([
					refetchAQI(),
					refetchHotCities(),
					refetchColdCities(),
				]);
				setIsUpdating(false);

				// Lưu thời gian cập nhật
				const now = new Date();
				const formattedDate = now.toLocaleDateString("vi-VN", {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
				});
				const formattedTime = now.toLocaleTimeString("vi-VN", {
					hour: "2-digit",
					minute: "2-digit",
				});
				setLastUpdated(`${formattedTime} - ${formattedDate}`);
			}, 2000);
		} catch (error) {
			console.error("Lỗi khi cập nhật dữ liệu:", error);
			setIsUpdating(false);
		}
	};

	// Kiểm tra nếu tất cả các ranking đều đang loading
	const allLoading = aqiLoading && hotCitiesLoading && coldCitiesLoading;

	return (
		<div className="min-h-screen bg-[#f6f6f7]">
			<Navbar />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
				<div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 mb-8 text-white">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold mb-2">
								Bảng xếp hạng thời tiết
							</h1>
							<p className="text-blue-100">
								Thông tin đánh giá chất lượng không khí và nhiệt độ các thành
								phố Việt Nam
							</p>
							{lastUpdated && (
								<p className="text-blue-200 text-sm mt-2">
									Cập nhật lần cuối: {lastUpdated}
								</p>
							)}
						</div>

						<button
							onClick={handleUpdateData}
							disabled={isUpdating}
							className={`px-5 py-3 rounded-lg shadow ${
								isUpdating
									? "bg-gray-400 cursor-not-allowed"
									: "bg-white text-blue-700 hover:bg-blue-50"
							} transition duration-200 font-medium`}
						>
							{isUpdating ? (
								<span className="flex items-center">
									<svg
										className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-700"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Đang cập nhật...
								</span>
							) : (
								<span className="flex items-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 mr-2"
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
									Cập nhật dữ liệu
								</span>
							)}
						</button>
					</div>
				</div>

				{allLoading && (
					<div className="flex justify-center items-center py-8">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
					</div>
				)}

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					{/* Ranking AQI */}
					<div className="lg:col-span-1">
						<RankingDisplay
							title="Chất lượng không khí tốt nhất"
							data={aqiRankingData || []}
							isLoading={aqiLoading}
							error={aqiError}
							showTemperature={false}
							limit={9}
						/>
					</div>

					{/* Ranking nhiệt độ cao nhất */}
					<div className="lg:col-span-1">
						<RankingDisplay
							title="Thành phố nóng nhất"
							data={hotCitiesData || []}
							isLoading={hotCitiesLoading}
							error={hotCitiesError}
							showAQI={false}
							limit={9}
						/>
					</div>

					{/* Ranking nhiệt độ thấp nhất */}
					<div className="lg:col-span-1">
						<RankingDisplay
							title="Thành phố mát mẻ nhất"
							data={coldCitiesData || []}
							isLoading={coldCitiesLoading}
							error={coldCitiesError}
							showAQI={false}
							limit={9}
						/>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-md p-6 mb-8">
					<h2 className="text-xl font-bold mb-4 text-black border-b pb-2">
						Về bảng xếp hạng
					</h2>
					<div className="grid md:grid-cols-3 gap-6 mt-4">
						<div className="bg-gray-50 p-4 rounded-lg">
							<div className="flex items-center mb-3">
								<div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6 text-green-600"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 10V3L4 14h7v7l9-11h-7z"
										/>
									</svg>
								</div>
								<h3 className="font-semibold text-black">
									Chất lượng không khí tốt nhất
								</h3>
							</div>
							<p className="text-black text-sm">
								Xếp hạng dựa trên chỉ số AQI trung bình, thấp hơn = tốt hơn. Các
								thành phố có không khí trong lành sẽ được xếp hạng cao.
							</p>
						</div>

						<div className="bg-gray-50 p-4 rounded-lg">
							<div className="flex items-center mb-3">
								<div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6 text-red-600"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
										/>
									</svg>
								</div>
								<h3 className="font-semibold text-black">
									Thành phố nóng nhất
								</h3>
							</div>
							<p className="text-black text-sm">
								Xếp hạng dựa trên nhiệt độ trung bình cao nhất. Các thành phố có
								nhiệt độ cao sẽ được xếp hạng đầu tiên.
							</p>
						</div>

						<div className="bg-gray-50 p-4 rounded-lg">
							<div className="flex items-center mb-3">
								<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6 text-blue-600"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
										/>
									</svg>
								</div>
								<h3 className="font-semibold text-black">
									Thành phố mát mẻ nhất
								</h3>
							</div>
							<p className="text-black text-sm">
								Xếp hạng dựa trên nhiệt độ trung bình thấp nhất. Các thành phố
								có nhiệt độ thấp sẽ được xếp hạng đầu tiên.
							</p>
						</div>
					</div>

					<div className="mt-6 p-4 bg-blue-50 rounded-lg text-black text-sm">
						<p className="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>
								Bảng xếp hạng được tính toán dựa trên dữ liệu thời tiết 24 giờ
								qua của các thành phố. Dữ liệu được cập nhật mỗi giờ để đảm bảo
								tính chính xác. Bạn có thể nhấn vào từng thành phố để xem chi
								tiết.
							</span>
						</p>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
