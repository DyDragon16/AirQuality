import React, { useState } from "react";
import { useWeatherHistory } from "@/hooks/useWeatherHistory";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import AQIHistoryChart from "./AQIHistoryChart";

interface WeatherHistoryProps {
	cityId: string;
	cityName?: string;
}

const WeatherHistory: React.FC<WeatherHistoryProps> = ({
	cityId,
	cityName,
}) => {
	const [isRefetching, setIsRefetching] = useState<boolean>(false);

	const { historyData, isLoading, error, refetch } = useWeatherHistory(cityId, {
		days: 7, // Mặc định hiển thị dữ liệu 7 ngày
		enabled: !!cityId,
	});

	// Hàm format ngày giờ
	const formatDateTime = (dateString: string | Date) => {
		const date = new Date(dateString);
		return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
	};
	
	// Hàm xử lý khi nhấn nút cập nhật
	const handleRefetch = async () => {
		setIsRefetching(true);
		try {
			await refetch();
		} finally {
			setTimeout(() => setIsRefetching(false), 500); // Thêm timeout để tránh nút nhấp nháy quá nhanh
		}
	};

	// Nếu đang loading
	if (isLoading) {
		return (
			<div className="mt-6">
				<h2 className="text-xl font-semibold text-black mb-4 border-b pb-2">
					Lịch sử chất lượng không khí
				</h2>
				<div className="bg-gray-100 rounded-lg p-4">
					<div className="animate-pulse flex flex-col space-y-4">
						<div className="h-4 bg-gray-200 rounded w-3/4"></div>
						<div className="h-4 bg-gray-200 rounded w-1/2"></div>
						<div className="h-4 bg-gray-200 rounded w-5/6"></div>
					</div>
				</div>
			</div>
		);
	}

	// Nếu có lỗi
	if (error) {
		return (
			<div className="mt-6">
				<h2 className="text-xl font-semibold text-black mb-4 border-b pb-2">
					Lịch sử chất lượng không khí
				</h2>
				<div className="bg-red-50 text-red-600 rounded-lg p-4">
					<p>Không thể tải dữ liệu lịch sử: {error.message}</p>
					<button
						onClick={handleRefetch}
						className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
						disabled={isRefetching}
					>
						{isRefetching ? (
							<>
								<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Đang tải...
							</>
						) : "Thử lại"}
					</button>
				</div>
			</div>
		);
	}

	// Nếu không có dữ liệu
	if (!historyData || historyData.records.length === 0) {
		return (
			<div className="mt-6">
				<h2 className="text-xl font-semibold text-black mb-4 border-b pb-2">
					Lịch sử chất lượng không khí
				</h2>
				<div className="bg-gray-100 rounded-lg p-6 text-center">
					<p className="text-gray-600">
						Không có dữ liệu lịch sử cho thành phố này trong 7 ngày qua
					</p>
					<div className="flex justify-center mt-4">
						<button
							onClick={handleRefetch}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							disabled={isRefetching}
						>
							{isRefetching ? (
								<>
									<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Đang tải...
								</>
							) : "Cập nhật"}
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Lấy dữ liệu timestamp mới nhất và cũ nhất để hiển thị khoảng thời gian
	const newestRecord = historyData.records.length > 0 
		? new Date(historyData.records[historyData.records.length - 1].timestamp)
		: new Date();
	const oldestRecord = historyData.records.length > 0
		? new Date(historyData.records[0].timestamp)
		: new Date();

	return (
		<div className="mt-6">
			<div className="flex justify-between items-center mb-4 border-b pb-2">
				<h2 className="text-xl font-semibold text-gray-800">
					Lịch sử chất lượng không khí - {historyData.cityName || cityName}
				</h2>
				<button
					onClick={handleRefetch}
					className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
					disabled={isRefetching}
				>
					{isRefetching ? (
						<>
							<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Đang tải...
						</>
					) : "Cập nhật"}
				</button>
			</div>

			{/* Hiển thị khoảng thời gian */}
			<div className="mb-3 text-gray-600">
				<p className="text-sm font-medium">
					Dữ liệu từ: {format(oldestRecord, "dd/MM/yyyy", { locale: vi })} đến {format(newestRecord, "dd/MM/yyyy", { locale: vi })}
				</p>
			</div>

			{/* Biểu đồ lịch sử AQI */}
			<div className="bg-white shadow-sm rounded-lg p-4 border border-gray-100">
				<AQIHistoryChart
					data={historyData.records}
					cityName={historyData.cityName || cityName || ""}
				/>
			</div>

			<div className="mt-4 flex justify-between items-center">
				<div className="text-sm text-gray-500">
					<p>Dữ liệu được cập nhật mỗi giờ</p> 
					<p>Lần cập nhật cuối: <span className="font-medium">{formatDateTime(historyData.timestamp)}</span></p>
				</div>
				<div className="text-xs text-gray-400 italic">
					*AQI: Chỉ số chất lượng không khí (theo tiêu chuẩn VN).
				</div>
			</div>
		</div>
	);
};

export default WeatherHistory;
