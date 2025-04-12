"use client";

import { Navbar } from "@/layout/Navbar";
import { WeatherCard } from "@/weather/WeatherCard";
import Link from "next/link";
import { CITY_DATA } from "@/constants/cities";
import { useWeatherData } from "@/hooks/useWeatherData";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { useCarousel } from "@/hooks/useCarousel";
import Footer from "@/layout/Footer";
import { getAQIGradient } from "@/utils/aqi";
import AQIDisplay from "@/air-quality/AQIDisplay";
import PollutantCard from "@/air-quality/PollutantCard";

export default function Home() {
	// Danh sách các thành phố cần hiển thị trên trang chủ (không bao gồm các thành phố ẩn)
	const cities = [
		"Hà Nội",
		"Hồ Chí Minh",
		"Đà Nẵng",
		"Hải Phòng",
		"Cần Thơ",
		"Huế",
		"Nha Trang",
		"Đà Lạt",
		"Sapa",
	];

	// Lấy dữ liệu thời tiết cho các thành phố
	const {
		weatherData: hanoiData,
		isLoading: hanoiLoading,
		error: hanoiError,
		refetch: hanoiRefetch,
	} = useWeatherData(CITY_DATA["Hà Nội"].endpoint);

	const {
		weatherData: hcmData,
		isLoading: hcmLoading,
		error: hcmError,
		refetch: hcmRefetch,
	} = useWeatherData(CITY_DATA["Hồ Chí Minh"].endpoint);

	const {
		weatherData: danangData,
		isLoading: danangLoading,
		error: danangError,
		refetch: danangRefetch,
	} = useWeatherData(CITY_DATA["Đà Nẵng"].endpoint);

	const {
		weatherData: haiphongData,
		isLoading: haiphongLoading,
		error: haiphongError,
		refetch: haiphongRefetch,
	} = useWeatherData(CITY_DATA["Hải Phòng"].endpoint);

	const {
		weatherData: canthoData,
		isLoading: canthoLoading,
		error: canthoError,
		refetch: canthoRefetch,
	} = useWeatherData(CITY_DATA["Cần Thơ"].endpoint);

	const {
		weatherData: hueData,
		isLoading: hueLoading,
		error: hueError,
		refetch: hueRefetch,
	} = useWeatherData(CITY_DATA["Huế"].endpoint);

	const {
		weatherData: nhatrangData,
		isLoading: nhatrangLoading,
		error: nhatrangError,
		refetch: nhatrangRefetch,
	} = useWeatherData(CITY_DATA["Nha Trang"].endpoint);

	const {
		weatherData: dalatData,
		isLoading: dalatLoading,
		error: dalatError,
		refetch: dalatRefetch,
	} = useWeatherData(CITY_DATA["Đà Lạt"].endpoint);

	const {
		weatherData: sapaData,
		isLoading: sapaLoading,
		error: sapaError,
		refetch: sapaRefetch,
	} = useWeatherData(CITY_DATA["Sapa"].endpoint);

	// Lưu trữ dữ liệu các thành phố vào một mảng
	const cityData = [
		{
			data: hanoiData,
			isLoading: hanoiLoading,
			error: hanoiError,
			name: "Hà Nội",
			refetch: hanoiRefetch,
		},
		{
			data: hcmData,
			isLoading: hcmLoading,
			error: hcmError,
			name: "Hồ Chí Minh",
			refetch: hcmRefetch,
		},
		{
			data: danangData,
			isLoading: danangLoading,
			error: danangError,
			name: "Đà Nẵng",
			refetch: danangRefetch,
		},
		{
			data: haiphongData,
			isLoading: haiphongLoading,
			error: haiphongError,
			name: "Hải Phòng",
			refetch: haiphongRefetch,
		},
		{
			data: canthoData,
			isLoading: canthoLoading,
			error: canthoError,
			name: "Cần Thơ",
			refetch: canthoRefetch,
		},
		{
			data: hueData,
			isLoading: hueLoading,
			error: hueError,
			name: "Huế",
			refetch: hueRefetch,
		},
		{
			data: nhatrangData,
			isLoading: nhatrangLoading,
			error: nhatrangError,
			name: "Nha Trang",
			refetch: nhatrangRefetch,
		},
		{
			data: dalatData,
			isLoading: dalatLoading,
			error: dalatError,
			name: "Đà Lạt",
			refetch: dalatRefetch,
		},
		{
			data: sapaData,
			isLoading: sapaLoading,
			error: sapaError,
			name: "Sapa",
			refetch: sapaRefetch,
		},
	];

	// Sử dụng hook useCarousel để quản lý carousel
	const { activeIndex, swipeDirection, setIsPaused, goToNext, goToPrev } =
		useCarousel({
			totalItems: cities.length,
			autoplayInterval: 5000,
			isItemLoading: (index) => cityData[index].isLoading,
		});

	// Carousel cho danh sách thành phố nổi bật
	const {
		activeIndex: cityPageIndex,
		swipeDirection: citySwipeDirection,
		setIsPaused: setCityCarouselPaused,
		goToNext: goToNextCityPage,
		goToPrev: goToPrevCityPage,
		goToIndex: goToCityPageIndex,
	} = useCarousel({
		totalItems: Math.ceil(Object.entries(CITY_DATA).length / 6),
		autoplayInterval: 8000,
	});

	return (
		<div className="min-h-screen bg-[#f6f6f7]">
			<Navbar />

			{/* Hero Section */}
			<div
				className={`relative ${
					cityData[activeIndex].data?.current?.aqi
						? getAQIGradient(cityData[activeIndex].data.current.aqi)
						: "bg-gray-50"
				} text-white pt-16 pb-12`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Weather Cards Carousel và AQI Display */}
					<div className="container mx-auto mt-8 relative px-4 sm:px-10 pb-12">
						<div className="flex flex-col md:flex-row gap-8 justify-center">
							{/* Weather Card - Carousel */}
							<div className="md:w-[1000px] w-full">
								<div className="overflow-hidden relative rounded-xl w-full shadow-xl">
									<AnimatePresence
										initial={false}
										custom={swipeDirection}
										mode="wait"
									>
										<motion.div
											key={activeIndex}
											custom={swipeDirection}
											initial={{
												x: swipeDirection === "left" ? 120 : -120,
												opacity: 0,
												scale: 1,
											}}
											animate={{
												x: 0,
												opacity: 1,
												scale: 1,
											}}
											exit={{
												x: swipeDirection === "left" ? -120 : 120,
												opacity: 0,
												scale: 1,
											}}
											transition={{
												type: "spring",
												stiffness: 350,
												damping: 25,
												duration: 0.2,
											}}
											className="w-full"
											onMouseEnter={() => setIsPaused(true)}
											onMouseLeave={() => setIsPaused(false)}
										>
											<div className="relative z-10 bg-[#222222] rounded-xl overflow-hidden border border-black/10 hover:shadow-xl transition-all duration-300">
												{cityData[activeIndex].isLoading ? (
													<div className="flex items-center justify-center p-8 h-[350px]">
														<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
													</div>
												) : cityData[activeIndex].error ? (
													<div className="p-8 text-center h-[350px] flex flex-col items-center justify-center">
														<XCircle className="w-12 h-12 text-red-500 mb-2" />
														<p className="text-white">
															Không thể tải dữ liệu thời tiết
														</p>
														<button
															onClick={() => cityData[activeIndex].refetch()}
															className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
														>
															Thử lại
														</button>
													</div>
												) : cityData[activeIndex].data ? (
													<WeatherCard
														weatherData={cityData[activeIndex].data}
													/>
												) : null}
											</div>
										</motion.div>
									</AnimatePresence>

									{/* Navigation buttons - đặt bên ngoài vùng hover */}
									<button
										onClick={goToPrev}
										className="absolute left-[-3px] top-1/2 transform -translate-y-1/2 z-13"
										aria-label="Thành phố trước"
									>
										<ChevronLeft className="w-6 h-6 text-white hover:text-gray-200 transition-colors" />
									</button>
									<button
										onClick={goToNext}
										className="absolute right-[-3px] top-1/2 transform -translate-y-1/2 z-13"
										aria-label="Thành phố tiếp theo"
									>
										<ChevronRight className="w-6 h-6 text-white hover:text-gray-200 transition-colors" />
									</button>
								</div>
							</div>

							{/* AQI Display bên phải */}
							{cityData[activeIndex].data?.current?.aqi &&
								!cityData[activeIndex].isLoading && (
									<div className="md:w-1/3 w-full">
										<div className="rounded-xl overflow-hidden shadow-lg">
											<AQIDisplay
												compact={true}
												aqi={cityData[activeIndex].data.current.aqi}
												pollutant={
													cityData[activeIndex].data.current.mainPollutant
												}
												temperature={
													cityData[activeIndex].data.current.temperature
												}
												humidity={cityData[activeIndex].data.current.humidity}
												windSpeed={
													cityData[activeIndex].data.current.wind?.speed
														? Math.round(
																cityData[activeIndex].data.current.wind.speed *
																	3.6
														  )
														: undefined
												}
												useThemeColor={true}
											/>
										</div>

										{/* Hiển thị thông tin chất ô nhiễm PM2.5 */}
										{cityData[activeIndex].data?.current?.pollutants && (
											<div className="mt-3">
												{(() => {
													const pollutants =
														cityData[activeIndex].data?.current?.pollutants ||
														[];
													const pm25 = pollutants.find(
														(p) =>
															p.pollutantName === "pm25" ||
															p.pollutantName === "PM2.5"
													);

													if (pm25) {
														return (
															<PollutantCard
																pollutantName={pm25.pollutantName}
																concentration={pm25.concentration}
																unit={pm25.unit || "µg/m³"}
																background={true}
															/>
														);
													}

													// Nếu không tìm thấy PM2.5, hiển thị chất ô nhiễm chính (nếu có)
													const mainPollutantName =
														cityData[activeIndex].data?.current?.mainPollutant;
													if (mainPollutantName && pollutants.length > 0) {
														const mainPollutant = pollutants.find(
															(p) =>
																p.pollutantName.toLowerCase() ===
																mainPollutantName.toLowerCase()
														);

														if (mainPollutant) {
															return (
																<PollutantCard
																	pollutantName={mainPollutant.pollutantName}
																	concentration={mainPollutant.concentration}
																	unit={mainPollutant.unit || "µg/m³"}
																	background={true}
																/>
															);
														}
													}

													return null;
												})()}
											</div>
										)}
									</div>
								)}
						</div>
					</div>
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

			{/* City List Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<div className="mb-10">
					<h2 className="text-3xl font-bold text-gray-900 mb-3">
						Thành phố nổi bật
					</h2>
					<p className="text-gray-600 max-w-2xl">
						Khám phá dữ liệu chất lượng không khí tại các thành phố lớn của Việt
						Nam
					</p>
				</div>

				{/* Phân trang với 6 card mỗi trang */}
				<div className="relative">
					{/* Hiển thị thành phố */}
					<div className="overflow-hidden relative w-full">
						<AnimatePresence
							initial={false}
							custom={citySwipeDirection}
							mode="wait"
						>
							<motion.div
								key={cityPageIndex}
								custom={citySwipeDirection}
								initial={{
									x: citySwipeDirection === "left" ? 120 : -120,
									opacity: 0,
									scale: 1,
								}}
								animate={{
									x: 0,
									opacity: 1,
									scale: 1,
								}}
								exit={{
									x: citySwipeDirection === "left" ? -120 : 120,
									opacity: 0,
									scale: 1,
								}}
								transition={{
									type: "spring",
									stiffness: 350,
									damping: 25,
									duration: 0.2,
								}}
								className="w-full"
								onMouseEnter={() => setCityCarouselPaused(true)}
								onMouseLeave={() => setCityCarouselPaused(false)}
							>
								{(() => {
									// Lấy các thành phố hiển thị (không ẩn)
									const visibleCities = Object.entries(CITY_DATA);

									// Số thành phố hiển thị trên một trang
									const itemsPerPage = 6;

									// Tính tổng số trang
									const totalPages = Math.ceil(
										visibleCities.length / itemsPerPage
									);

									// Đảm bảo cityPageIndex không vượt quá giới hạn
									const safePageIndex = Math.min(cityPageIndex, totalPages - 1);

									// Tính các thành phố hiển thị ở trang hiện tại
									const citiesForCurrentPage = visibleCities.slice(
										safePageIndex * itemsPerPage,
										(safePageIndex + 1) * itemsPerPage
									);

									return (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{citiesForCurrentPage.map(([cityName, data]) => {
												// Xác định màu sắc cho từng thành phố
												const getCityColor = () => {
													const cityColors = {
														"ha-noi": {
															accent: "bg-blue-500",
															light: "bg-blue-50",
															hover: "group-hover:bg-blue-100",
															text: "text-blue-600",
															icon: "text-blue-500",
														},
														"ho-chi-minh": {
															accent: "bg-amber-500",
															light: "bg-amber-50",
															hover: "group-hover:bg-amber-100",
															text: "text-amber-600",
															icon: "text-amber-500",
														},
														"da-nang": {
															accent: "bg-emerald-500",
															light: "bg-emerald-50",
															hover: "group-hover:bg-emerald-100",
															text: "text-emerald-600",
															icon: "text-emerald-500",
														},
														"hai-phong": {
															accent: "bg-cyan-500",
															light: "bg-cyan-50",
															hover: "group-hover:bg-cyan-100",
															text: "text-cyan-600",
															icon: "text-cyan-500",
														},
														"can-tho": {
															accent: "bg-yellow-500",
															light: "bg-yellow-50",
															hover: "group-hover:bg-yellow-100",
															text: "text-yellow-600",
															icon: "text-yellow-500",
														},
														hue: {
															accent: "bg-purple-500",
															light: "bg-purple-50",
															hover: "group-hover:bg-purple-100",
															text: "text-purple-600",
															icon: "text-purple-500",
														},
														"nha-trang": {
															accent: "bg-pink-500",
															light: "bg-pink-50",
															hover: "group-hover:bg-pink-100",
															text: "text-pink-600",
															icon: "text-pink-500",
														},
														"da-lat": {
															accent: "bg-rose-500",
															light: "bg-rose-50",
															hover: "group-hover:bg-rose-100",
															text: "text-rose-600",
															icon: "text-rose-500",
														},
														"sa-pa": {
															accent: "bg-teal-500",
															light: "bg-teal-50",
															hover: "group-hover:bg-teal-100",
															text: "text-teal-600",
															icon: "text-teal-500",
														},
														"phan-thiet": {
															accent: "bg-orange-500",
															light: "bg-orange-50",
															hover: "group-hover:bg-orange-100",
															text: "text-orange-600",
															icon: "text-orange-500",
														},
														vinh: {
															accent: "bg-lime-500",
															light: "bg-lime-50",
															hover: "group-hover:bg-lime-100",
															text: "text-lime-600",
															icon: "text-lime-500",
														},
														"vung-tau": {
															accent: "bg-sky-500",
															light: "bg-sky-50",
															hover: "group-hover:bg-sky-100",
															text: "text-sky-600",
															icon: "text-sky-500",
														},
														"ha-long": {
															accent: "bg-indigo-500",
															light: "bg-indigo-50",
															hover: "group-hover:bg-indigo-100",
															text: "text-indigo-600",
															icon: "text-indigo-500",
														},
														"thanh-hoa": {
															accent: "bg-red-500",
															light: "bg-red-50",
															hover: "group-hover:bg-red-100",
															text: "text-red-600",
															icon: "text-red-500",
														},
														"quang-ngai": {
															accent: "bg-fuchsia-500",
															light: "bg-fuchsia-50",
															hover: "group-hover:bg-fuchsia-100",
															text: "text-fuchsia-600",
															icon: "text-fuchsia-500",
														},
														"bien-hoa": {
															accent: "bg-violet-500",
															light: "bg-violet-50",
															hover: "group-hover:bg-violet-100",
															text: "text-violet-600",
															icon: "text-violet-500",
														},
														"rach-gia": {
															accent: "bg-green-500",
															light: "bg-green-50",
															hover: "group-hover:bg-green-100",
															text: "text-green-600",
															icon: "text-green-500",
														},
														"quy-nhon": {
															accent: "bg-blue-400",
															light: "bg-blue-50",
															hover: "group-hover:bg-blue-100",
															text: "text-blue-500",
															icon: "text-blue-400",
														},
														"ba-ria": {
															accent: "bg-amber-400",
															light: "bg-amber-50",
															hover: "group-hover:bg-amber-100",
															text: "text-amber-500",
															icon: "text-amber-400",
														},
														"bac-lieu": {
															accent: "bg-teal-400",
															light: "bg-teal-50",
															hover: "group-hover:bg-teal-100",
															text: "text-teal-500",
															icon: "text-teal-400",
														},
														"buon-ma-thuot": {
															accent: "bg-cyan-400",
															light: "bg-cyan-50",
															hover: "group-hover:bg-cyan-100",
															text: "text-cyan-500",
															icon: "text-cyan-400",
														},
														"cam-ranh": {
															accent: "bg-rose-400",
															light: "bg-rose-50",
															hover: "group-hover:bg-rose-100",
															text: "text-rose-500",
															icon: "text-rose-400",
														},
														"cao-bang": {
															accent: "bg-emerald-400",
															light: "bg-emerald-50",
															hover: "group-hover:bg-emerald-100",
															text: "text-emerald-500",
															icon: "text-emerald-400",
														},
														"cam-pha": {
															accent: "bg-purple-400",
															light: "bg-purple-50",
															hover: "group-hover:bg-purple-100",
															text: "text-purple-500",
															icon: "text-purple-400",
														},
														"dien-bien-phu": {
															accent: "bg-orange-400",
															light: "bg-orange-50",
															hover: "group-hover:bg-orange-100",
															text: "text-orange-500",
															icon: "text-orange-400",
														},
														"ha-dong": {
															accent: "bg-lime-400",
															light: "bg-lime-50",
															hover: "group-hover:bg-lime-100",
															text: "text-lime-500",
															icon: "text-lime-400",
														},
														"dong-hoi": {
															accent: "bg-sky-400",
															light: "bg-sky-50",
															hover: "group-hover:bg-sky-100",
															text: "text-sky-500",
															icon: "text-sky-400",
														},
														"ha-tinh": {
															accent: "bg-yellow-400",
															light: "bg-yellow-50",
															hover: "group-hover:bg-yellow-100",
															text: "text-yellow-500",
															icon: "text-yellow-400",
														},
														"hai-duong": {
															accent: "bg-pink-400",
															light: "bg-pink-50",
															hover: "group-hover:bg-pink-100",
															text: "text-pink-500",
															icon: "text-pink-400",
														},
														"dong-xoai": {
															accent: "bg-green-400",
															light: "bg-green-50",
															hover: "group-hover:bg-green-100",
															text: "text-green-500",
															icon: "text-green-400",
														},
														"hoa-binh": {
															accent: "bg-indigo-400",
															light: "bg-indigo-50",
															hover: "group-hover:bg-indigo-100",
															text: "text-indigo-500",
															icon: "text-indigo-400",
														},
														"hoi-an": {
															accent: "bg-red-400",
															light: "bg-red-50",
															hover: "group-hover:bg-red-100",
															text: "text-red-500",
															icon: "text-red-400",
														},
														"lai-chau": {
															accent: "bg-fuchsia-400",
															light: "bg-fuchsia-50",
															hover: "group-hover:bg-fuchsia-100",
															text: "text-fuchsia-500",
															icon: "text-fuchsia-400",
														},
														"lang-son": {
															accent: "bg-violet-400",
															light: "bg-violet-50",
															hover: "group-hover:bg-violet-100",
															text: "text-violet-500",
															icon: "text-violet-400",
														},
														"lao-cai": {
															accent: "bg-blue-600",
															light: "bg-blue-50",
															hover: "group-hover:bg-blue-100",
															text: "text-blue-600",
															icon: "text-blue-600",
														},
														"long-xuyen": {
															accent: "bg-amber-600",
															light: "bg-amber-50",
															hover: "group-hover:bg-amber-100",
															text: "text-amber-600",
															icon: "text-amber-600",
														},
														"my-tho": {
															accent: "bg-emerald-600",
															light: "bg-emerald-50",
															hover: "group-hover:bg-emerald-100",
															text: "text-emerald-600",
															icon: "text-emerald-600",
														},
														"ninh-binh": {
															accent: "bg-cyan-600",
															light: "bg-cyan-50",
															hover: "group-hover:bg-cyan-100",
															text: "text-cyan-600",
															icon: "text-cyan-600",
														},
														"phan-rang-thap-cham": {
															accent: "bg-yellow-600",
															light: "bg-yellow-50",
															hover: "group-hover:bg-yellow-100",
															text: "text-yellow-600",
															icon: "text-yellow-600",
														},
														pleiku: {
															accent: "bg-purple-600",
															light: "bg-purple-50",
															hover: "group-hover:bg-purple-100",
															text: "text-purple-600",
															icon: "text-purple-600",
														},
														"sa-dec": {
															accent: "bg-pink-600",
															light: "bg-pink-50",
															hover: "group-hover:bg-pink-100",
															text: "text-pink-600",
															icon: "text-pink-600",
														},
														"soc-trang": {
															accent: "bg-rose-600",
															light: "bg-rose-50",
															hover: "group-hover:bg-rose-100",
															text: "text-rose-600",
															icon: "text-rose-600",
														},
														"tam-diep": {
															accent: "bg-teal-600",
															light: "bg-teal-50",
															hover: "group-hover:bg-teal-100",
															text: "text-teal-600",
															icon: "text-teal-600",
														},
														"tan-an": {
															accent: "bg-orange-600",
															light: "bg-orange-50",
															hover: "group-hover:bg-orange-100",
															text: "text-orange-600",
															icon: "text-orange-600",
														},
														"thai-binh": {
															accent: "bg-lime-600",
															light: "bg-lime-50",
															hover: "group-hover:bg-lime-100",
															text: "text-lime-600",
															icon: "text-lime-600",
														},
														"thai-nguyen": {
															accent: "bg-sky-600",
															light: "bg-sky-50",
															hover: "group-hover:bg-sky-100",
															text: "text-sky-600",
															icon: "text-sky-600",
														},
														"thu-dau-mot": {
															accent: "bg-indigo-600",
															light: "bg-indigo-50",
															hover: "group-hover:bg-indigo-100",
															text: "text-indigo-600",
															icon: "text-indigo-600",
														},
														"tuy-hoa": {
															accent: "bg-red-600",
															light: "bg-red-50",
															hover: "group-hover:bg-red-100",
															text: "text-red-600",
															icon: "text-red-600",
														},
														"tuyen-quang": {
															accent: "bg-fuchsia-600",
															light: "bg-fuchsia-50",
															hover: "group-hover:bg-fuchsia-100",
															text: "text-fuchsia-600",
															icon: "text-fuchsia-600",
														},
														"uong-bi": {
															accent: "bg-violet-600",
															light: "bg-violet-50",
															hover: "group-hover:bg-violet-100",
															text: "text-violet-600",
															icon: "text-violet-600",
														},
													};

													// Nếu có màu sắc xác định cho thành phố này, trả về màu đó
													if (data.slug in cityColors) {
														return cityColors[
															data.slug as keyof typeof cityColors
														];
													}

													// Sử dụng thuật toán hash cải tiến để tạo màu cho các thành phố chưa được định nghĩa
													// Danh sách các tùy chọn màu sắc còn lại để đảm bảo độ đa dạng
													const additionalColors = [
														{
															accent: "bg-slate-500",
															light: "bg-slate-50",
															hover: "group-hover:bg-slate-100",
															text: "text-slate-600",
															icon: "text-slate-500",
														},
														{
															accent: "bg-gray-500",
															light: "bg-gray-50",
															hover: "group-hover:bg-gray-100",
															text: "text-gray-600",
															icon: "text-gray-500",
														},
														{
															accent: "bg-neutral-500",
															light: "bg-neutral-50",
															hover: "group-hover:bg-neutral-100",
															text: "text-neutral-600",
															icon: "text-neutral-500",
														},
														{
															accent: "bg-stone-500",
															light: "bg-stone-50",
															hover: "group-hover:bg-stone-100",
															text: "text-stone-600",
															icon: "text-stone-500",
														},
														{
															accent: "bg-zinc-500",
															light: "bg-zinc-50",
															hover: "group-hover:bg-zinc-100",
															text: "text-zinc-600",
															icon: "text-zinc-500",
														},
														{
															accent: "bg-red-300",
															light: "bg-red-50",
															hover: "group-hover:bg-red-100",
															text: "text-red-400",
															icon: "text-red-300",
														},
														{
															accent: "bg-blue-300",
															light: "bg-blue-50",
															hover: "group-hover:bg-blue-100",
															text: "text-blue-400",
															icon: "text-blue-300",
														},
														{
															accent: "bg-green-300",
															light: "bg-green-50",
															hover: "group-hover:bg-green-100",
															text: "text-green-400",
															icon: "text-green-300",
														},
														{
															accent: "bg-amber-300",
															light: "bg-amber-50",
															hover: "group-hover:bg-amber-100",
															text: "text-amber-400",
															icon: "text-amber-300",
														},
														{
															accent: "bg-indigo-300",
															light: "bg-indigo-50",
															hover: "group-hover:bg-indigo-100",
															text: "text-indigo-400",
															icon: "text-indigo-300",
														},
														// Thêm các màu mới cho nhiều lựa chọn hơn
														{
															accent: "bg-purple-300",
															light: "bg-purple-50",
															hover: "group-hover:bg-purple-100",
															text: "text-purple-400",
															icon: "text-purple-300",
														},
														{
															accent: "bg-pink-300",
															light: "bg-pink-50",
															hover: "group-hover:bg-pink-100",
															text: "text-pink-400",
															icon: "text-pink-300",
														},
														{
															accent: "bg-rose-300",
															light: "bg-rose-50",
															hover: "group-hover:bg-rose-100",
															text: "text-rose-400",
															icon: "text-rose-300",
														},
														{
															accent: "bg-teal-300",
															light: "bg-teal-50",
															hover: "group-hover:bg-teal-100",
															text: "text-teal-400",
															icon: "text-teal-300",
														},
														{
															accent: "bg-lime-300",
															light: "bg-lime-50",
															hover: "group-hover:bg-lime-100",
															text: "text-lime-400",
															icon: "text-lime-300",
														},
														{
															accent: "bg-cyan-300",
															light: "bg-cyan-50",
															hover: "group-hover:bg-cyan-100",
															text: "text-cyan-400",
															icon: "text-cyan-300",
														},
														{
															accent: "bg-emerald-300",
															light: "bg-emerald-50",
															hover: "group-hover:bg-emerald-100",
															text: "text-emerald-400",
															icon: "text-emerald-300",
														},
														{
															accent: "bg-sky-300",
															light: "bg-sky-50",
															hover: "group-hover:bg-sky-100",
															text: "text-sky-400",
															icon: "text-sky-300",
														},
														{
															accent: "bg-orange-300",
															light: "bg-orange-50",
															hover: "group-hover:bg-orange-100",
															text: "text-orange-400",
															icon: "text-orange-300",
														},
														{
															accent: "bg-yellow-300",
															light: "bg-yellow-50",
															hover: "group-hover:bg-yellow-100",
															text: "text-yellow-400",
															icon: "text-yellow-300",
														},
													];

													// Tạo hash đơn giản từ chuỗi nhưng đảm bảo tính ổn định
													let hash = 0;
													for (let i = 0; i < data.slug.length; i++) {
														hash = (hash << 5) - hash + data.slug.charCodeAt(i);
														hash = hash & hash; // Convert to 32bit integer
													}

													// Chọn màu từ mảng additionalColors dựa trên hash
													return additionalColors[
														Math.abs(hash) % additionalColors.length
													];
												};

												const colors = getCityColor();

												return (
													<Link
														key={data.slug}
														href={`/city/${data.slug}`}
														className="group"
													>
														<div
															className={`relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${colors.light} ${colors.hover} transform group-hover:translate-y-[-2px]`}
														>
															{/* Accent line */}
															<div
																className={`absolute top-0 left-0 w-full h-1 ${colors.accent}`}
															></div>

															<div className="px-6 py-6">
																{/* City Icon and Name */}
																<div className="flex flex-col sm:flex-row items-center mb-4 sm:mb-2">
																	<div
																		className={`w-12 h-12 rounded-full flex items-center justify-center ${colors.light} border-2 border-white group-hover:scale-110 transition-transform ${colors.icon} mb-2 sm:mb-0`}
																	>
																		{/* City Icon */}
																		{(() => {
																			switch (data.slug) {
																				case "ha-noi":
																					return (
																						<svg
																							className="w-5 h-5"
																							viewBox="0 0 24 24"
																							fill="none"
																							stroke="currentColor"
																							strokeWidth="2"
																						>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
																							/>
																						</svg>
																					);
																				case "ho-chi-minh":
																					return (
																						<svg
																							className="w-5 h-5"
																							viewBox="0 0 24 24"
																							fill="none"
																							stroke="currentColor"
																							strokeWidth="2"
																						>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
																							/>
																						</svg>
																					);
																				case "da-nang":
																					return (
																						<svg
																							className="w-5 h-5"
																							viewBox="0 0 24 24"
																							fill="none"
																							stroke="currentColor"
																							strokeWidth="2"
																						>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
																							/>
																						</svg>
																					);
																				case "hai-phong":
																					return (
																						<svg
																							className="w-5 h-5"
																							viewBox="0 0 24 24"
																							fill="none"
																							stroke="currentColor"
																							strokeWidth="2"
																						>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								d="M21 12h-3V7a1 1 0 00-1-1H7a1 1 0 00-1 1v5H3a1 1 0 01-1-1V6a3 3 0 013-3h14a3 3 0 013 3v5a1 1 0 01-1 1z"
																							/>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								d="M12 12v9"
																							/>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								d="M7.8 18h8.4"
																							/>
																						</svg>
																					);
																				case "can-tho":
																					return (
																						<svg
																							className="w-5 h-5"
																							viewBox="0 0 24 24"
																							fill="none"
																							stroke="currentColor"
																							strokeWidth="2"
																						>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
																							/>
																						</svg>
																					);
																				case "hue":
																					return (
																						<svg
																							className="w-5 h-5"
																							viewBox="0 0 24 24"
																							fill="none"
																							stroke="currentColor"
																							strokeWidth="2"
																						>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								d="M3 21h18M3 10h18M3 18h18M3 14h18"
																							/>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								d="M5 6V3h14v3"
																							/>
																						</svg>
																					);
																				case "nha-trang":
																					return (
																						<svg
																							className="w-5 h-5"
																							viewBox="0 0 24 24"
																							fill="none"
																							stroke="currentColor"
																							strokeWidth="2"
																						>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
																							/>
																						</svg>
																					);
																				case "da-lat":
																					return (
																						<svg
																							className="w-5 h-5"
																							viewBox="0 0 24 24"
																							fill="none"
																							stroke="currentColor"
																							strokeWidth="2"
																						>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
																							/>
																						</svg>
																					);
																				case "sa-pa":
																					return (
																						<svg
																							className="w-5 h-5"
																							viewBox="0 0 24 24"
																							fill="none"
																							stroke="currentColor"
																							strokeWidth="2"
																						>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
																							/>
																						</svg>
																					);
																				default:
																					return (
																						<svg
																							className="w-5 h-5"
																							viewBox="0 0 24 24"
																							fill="none"
																							stroke="currentColor"
																							strokeWidth="2"
																						>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
																							/>
																							<path
																								strokeLinecap="round"
																								strokeLinejoin="round"
																								d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
																							/>
																						</svg>
																					);
																			}
																		})()}
																	</div>
																	<h3
																		className={`sm:ml-3 text-xl font-bold text-gray-900 group-hover:${colors.text} transition-colors text-center sm:text-left`}
																	>
																		{cityName}
																	</h3>
																</div>

																{/* Region */}
																<div className="flex items-center justify-center sm:justify-start text-gray-500 mb-4">
																	<svg
																		className="w-4 h-4 mr-1"
																		viewBox="0 0 24 24"
																		fill="none"
																		stroke="currentColor"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth="2"
																			d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
																		/>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth="2"
																			d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
																		/>
																	</svg>
																	<span className="text-sm">{data.region}</span>
																</div>

																{/* Divider */}
																<div className="border-t border-gray-200 my-3"></div>

																{/* View Details Button */}
																<div className="flex items-center justify-center sm:justify-start">
																	<span
																		className={`text-sm font-medium ${colors.text}`}
																	>
																		Xem chi tiết
																	</span>
																	<svg
																		className={`w-4 h-4 ml-1 ${colors.text} transform transition-all group-hover:translate-x-1`}
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={2}
																			d="M13 7l5 5m0 0l-5 5m5-5H6"
																		/>
																	</svg>
																</div>
															</div>
														</div>
													</Link>
												);
											})}
										</div>
									);
								})()}
							</motion.div>
						</AnimatePresence>

						{/* Navigation buttons - giống với WeatherCard */}
						<button
							onClick={goToPrevCityPage}
							className="absolute left-[-10px] top-1/2 transform -translate-y-1/2 p-2 z-20"
							aria-label="Trang trước"
						>
							<ChevronLeft className="w-5 h-5 text-gray-700" />
						</button>

						<button
							onClick={goToNextCityPage}
							className="absolute right-[-10px] top-1/2 transform -translate-y-1/2 p-2 z-20"
							aria-label="Trang tiếp theo"
						>
							<ChevronRight className="w-5 h-5 text-gray-700" />
						</button>
					</div>

					{/* Hiển thị chỉ số trang */}
					<div className="flex justify-center items-center mt-6">
						{Array.from({
							length: Math.ceil(Object.entries(CITY_DATA).length / 6),
						}).map((_, i) => (
							<button
								key={i}
								onClick={() => goToCityPageIndex(i)}
								className={`w-2 h-2 rounded-full mx-1 transition-all ${
									i === cityPageIndex ? "bg-gray-800 w-4" : "bg-gray-300"
								}`}
								aria-label={`Chuyển đến trang ${i + 1}`}
							/>
						))}
					</div>
				</div>
			</div>

			{/* Replace the footer section with the Footer component */}
			<Footer />
		</div>
	);
}
