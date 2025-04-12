import React, { useState, useMemo } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine,
	Cell,
} from "recharts";
import { WeatherHistoryRecord } from "@/types/weather";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getAQIText } from "@/utils/aqi";

interface AQIHistoryChartProps {
	data: WeatherHistoryRecord[];
	cityName: string;
}

// Chia dữ liệu thành các nhóm theo giờ hoặc ngày
const groupDataByHour = (data: WeatherHistoryRecord[]) => {
	return data.map((record) => {
		const date = new Date(record.timestamp);
		return {
			...record,
			// Đặt định dạng thời gian giống IQAir
			time: format(date, "HH:mm"),
			fullTime: format(date, "dd/MM/yyyy HH:mm"),
			day: format(date, "dd/MM"),
			hour: format(date, "HH:mm"),
			// Format giờ như IQAir
			labelTime: format(date, "HH:mm")
		};
	});
};

const groupDataByDay = (data: WeatherHistoryRecord[]) => {
	const groupedData: Record<string, WeatherHistoryRecord[]> = {};

	data.forEach((record) => {
		const date = new Date(record.timestamp);
		const day = format(date, "dd/MM");

		if (!groupedData[day]) {
			groupedData[day] = [];
		}

		groupedData[day].push(record);
	});

	return Object.entries(groupedData).map(([day, records]) => {
		// Tính giá trị AQI trung bình trong ngày
		const avgAQI = Math.round(
			records.reduce((sum, record) => sum + record.aqi, 0) / records.length
		);

		// Lấy bản ghi đầu tiên trong ngày làm đại diện
		const sampleRecord = records[0];

		return {
			...sampleRecord,
			aqi: avgAQI,
			time: day,
			fullTime: format(new Date(sampleRecord.timestamp), "dd/MM/yyyy"),
			day,
		};
	});
};

// Hàm để lấy màu cho biểu đồ PM2.5
const getPM25Color = (pm25: number): string => {
	if (pm25 <= 12) return "#A8E05F"; // Tốt
	if (pm25 <= 35.4) return "#FDD74B"; // Trung bình
	if (pm25 <= 55.4) return "#FE9B57"; // Không tốt cho nhóm nhạy cảm
	if (pm25 <= 150.4) return "#FE6A69"; // Không tốt cho sức khỏe
	if (pm25 <= 250.4) return "#A97ABC"; // Rất không tốt
	return "#A87383"; // Nguy hiểm
};

// Hàm để lấy màu cho cột biểu đồ dựa trên AQI - màu tương tự như trong IQAir
const getBarColorFromAQI = (aqi: number): string => {
	if (aqi <= 50) return "#A8E05F"; // Xanh lá - Good
	if (aqi <= 100) return "#FDD74B"; // Vàng - Moderate 
	if (aqi <= 150) return "#FE9B57"; // Cam - Unhealthy for Sensitive Groups
	if (aqi <= 200) return "#FE6A69"; // Đỏ - Unhealthy
	if (aqi <= 300) return "#A97ABC"; // Tím - Very Unhealthy
	return "#A87383"; // Đỏ tía - Hazardous
};

// Component hiển thị thông tin AQI hiện tại
const CurrentAQIInfo = ({
	latestRecord,
}: {
	latestRecord: WeatherHistoryRecord | null;
}) => {
	if (!latestRecord) return null;

	const aqiText = getAQIText(latestRecord.aqi);
	const date = new Date(latestRecord.timestamp);

	// Thông tin để hiển thị
	const timeDisplay = format(date, "HH:mm", { locale: vi });
	const dateDisplay = format(date, "dd'/'MM", { locale: vi });

	return (
		<div className="mb-4 pl-1">
			<div className="flex flex-col">
				<div className="flex items-center">
					<span className="text-3xl font-bold" style={{ color: getBarColorFromAQI(latestRecord.aqi) }}>{latestRecord.aqi}</span>
					<span className="ml-2 text-sm font-medium text-gray-700">AQI<sup>*</sup> Mỹ</span>
				</div>
				<div className="text-sm text-gray-700 mt-1 font-medium">
					{aqiText}
				</div>
				<div className="text-xs text-gray-500 mt-1">
					{timeDisplay} {dateDisplay} Giờ địa phương
				</div>
			</div>
		</div>
	);
};

const AQIHistoryChart: React.FC<AQIHistoryChartProps> = ({
	data,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	cityName,
}) => {
	const [viewType, setViewType] = useState<"hour" | "day">("hour");
	const [selectedMetric, setSelectedMetric] = useState<"AQI" | "Temperature" | "PM25">(
		"AQI"
	);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [dataInterval] = useState<"dense" | "normal" | "sparse">("normal");
	
	// Xác định khoảng thời gian cho lọc dữ liệu dựa trên cài đặt
	const getFilterInterval = () => {
		if (viewType === "day") return 24;
		
		switch (dataInterval) {
			case "dense": return 1; // Mật độ cao, lấy tất cả điểm
			case "normal": return 2; // Mật độ trung bình, mỗi 2 giờ
			case "sparse": return 3; // Mật độ thấp, mỗi 3 giờ
			default: return 2;
		}
	};

	// Sắp xếp dữ liệu theo thời gian
	const sortedData = useMemo(() => {
		// Lọc dữ liệu theo khoảng thời gian trước khi sắp xếp 
		const interval = getFilterInterval();
		let filteredData;
		
		// Áp dụng bộ lọc nếu đang xem theo giờ
		if (viewType === "hour" && data.length > 30) {
			// Logic lọc dữ liệu trực tiếp thay vì gọi hàm
			const sortedByTime = [...data].sort((a, b) => 
				new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
			);
			
			filteredData = [];
			
			// Lấy dữ liệu đầu tiên
			if (sortedByTime.length > 0) {
				filteredData.push(sortedByTime[0]);
			}
			
			// Lọc dữ liệu theo khoảng thời gian
			for (let i = 1; i < sortedByTime.length; i++) {
				const currentTime = new Date(sortedByTime[i].timestamp);
				const lastAddedTime = new Date(filteredData[filteredData.length - 1].timestamp);
				
				// Tính khoảng cách thời gian (giờ)
				const hoursDiff = (currentTime.getTime() - lastAddedTime.getTime()) / (1000 * 60 * 60);
				
				// Nếu khoảng cách đủ lớn hoặc là điểm cuối cùng, thêm vào danh sách lọc
				if (hoursDiff >= interval || i === sortedByTime.length - 1) {
					filteredData.push(sortedByTime[i]);
				}
			}
			
			console.log(`Đã lọc dữ liệu (${dataInterval}): ${data.length} → ${filteredData.length}`);
		} else {
			filteredData = data; // Không lọc dữ liệu khi xem theo ngày hoặc ít dữ liệu
		}
		
		return [...filteredData].sort((a, b) => {
			return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
		});
	}, [data, viewType, dataInterval]);

	// Xử lý dữ liệu dựa trên loại hiển thị
	const chartData = useMemo(() => {
		// Xử lý dữ liệu dựa trên loại hiển thị
		const data = viewType === "hour"
			? groupDataByHour(sortedData)
			: groupDataByDay(sortedData);
		
		// Kiểm tra xem dữ liệu có chứa PM2.5 không
		const hasPM25Data = data.some(item => !!item.pm25);
		
		// Nếu không có dữ liệu PM2.5, tạo dữ liệu mẫu
		if (!hasPM25Data && data.length > 0) {
			// Thêm dữ liệu mẫu PM2.5 cho phần hiển thị
			console.log("Không tìm thấy dữ liệu PM2.5 từ API, thêm dữ liệu mẫu để hiển thị");
			return data.map(item => ({
				...item,
				// Tạo giá trị PM2.5 mẫu dựa trên AQI nếu không có sẵn
				pm25: item.pm25 || Math.round(item.aqi * 0.65) // Ước lượng PM2.5 từ AQI
			}));
		}
		
		return data;
	}, [sortedData, viewType]);

	// Lấy bản ghi mới nhất để hiển thị
	const latestRecord = useMemo(() => {
		if (sortedData.length === 0) return null;
		
		// Nếu có active index thì lấy dữ liệu từ active index
		if (activeIndex !== null && activeIndex >= 0 && activeIndex < chartData.length) {
			return chartData[activeIndex];
		}
		
		return sortedData[sortedData.length - 1];
	}, [sortedData, activeIndex, chartData]);

	// Lấy giới hạn trục Y tùy theo loại dữ liệu đang hiển thị
	const getYAxisDomain = () => {
		if (selectedMetric === "AQI") return [0, 210]; // Tăng lên 210 như IQAir
		if (selectedMetric === "Temperature") return [0, 40];
		return [0, 150]; // Cho PM2.5
	};
	
	// Hàm để format hiển thị trục X
	const formatXAxis = (tickItem: string) => {
		// Trả về trực tiếp vì đã được định dạng trong labelTime
		return tickItem;
	};
	
	// Hàm xử lý khi di chuột qua cột
	const handleMouseOver = (_data: unknown, index: number) => {
		setActiveIndex(index);
	};
	
	// Hàm xử lý khi di chuột ra khỏi cột
	const handleMouseLeave = () => {
		setActiveIndex(null);
	};

	return (
		<div className="w-full">
			{/* Hiển thị AQI hiện tại */}
			{selectedMetric === "AQI" && latestRecord && (
				<CurrentAQIInfo latestRecord={latestRecord} />
			)}

			{/* Hiển thị thông tin PM2.5 hiện tại */}
			{selectedMetric === "PM25" && (
				<div className="mb-4 pl-1">
					{latestRecord ? (
						<div className="flex flex-col">
							<div className="flex items-center">
								<span className="text-2xl font-bold" style={{ color: getPM25Color(latestRecord.pm25 || Math.round(latestRecord.aqi * 0.65)) }}>
									{latestRecord.pm25 || Math.round(latestRecord.aqi * 0.65)}
								</span>
								<span className="ml-2 text-sm font-medium text-gray-700">μg/m³</span>
								{!latestRecord.pm25 && (
									<span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1 py-0.5 rounded">dữ liệu ước tính</span>
								)}
							</div>
							<div className="text-sm text-gray-600 mt-1 font-medium">
								PM2.5
							</div>
							<div className="text-xs text-gray-500 mt-1">
								{format(new Date(latestRecord.timestamp), "HH:mm", { locale: vi })}-{format(new Date(new Date(latestRecord.timestamp).setHours(new Date(latestRecord.timestamp).getHours() + 1)), "HH:mm", { locale: vi })} {format(new Date(latestRecord.timestamp), "dd'/'MM", { locale: vi })} Giờ địa phương
							</div>
						</div>
					) : (
						<div className="text-gray-500 italic">
							Không có dữ liệu PM2.5 từ API. Dữ liệu PM2.5 có thể chưa được hỗ trợ cho thành phố này.
						</div>
					)}
				</div>
			)}

			{/* Hiển thị thông tin nhiệt độ hiện tại */}
			{selectedMetric === "Temperature" && latestRecord && (
				<div className="mb-4 pl-1">
					<div className="flex flex-col">
						<div className="flex items-center">
							<span className="text-2xl font-bold text-blue-500">{latestRecord.temperature.toFixed(1)}</span>
							<span className="ml-2 text-sm font-medium text-gray-700">°C</span>
						</div>
						<div className="text-sm text-gray-600 mt-1 font-medium">
							Nhiệt độ
						</div>
						<div className="text-xs text-gray-500 mt-1">
							{format(new Date(latestRecord.timestamp), "HH:mm", { locale: vi })}-{format(new Date(new Date(latestRecord.timestamp).setHours(new Date(latestRecord.timestamp).getHours() + 1)), "HH:mm", { locale: vi })} {format(new Date(latestRecord.timestamp), "dd'/'MM", { locale: vi })} Giờ địa phương
						</div>
					</div>
				</div>
			)}

			<div className="mb-3 flex justify-between items-center">
				<div className="flex space-x-2 text-sm">
					<button
						onClick={() => setViewType("hour")}
						className={`px-3 py-1 text-sm rounded-md ${
							viewType === "hour"
								? "bg-gray-800 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						Theo giờ
					</button>
					<button
						onClick={() => setViewType("day")}
						className={`px-3 py-1 text-sm rounded-md ${
							viewType === "day"
								? "bg-gray-800 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						Theo ngày
					</button>
				</div>
				<div className="flex items-center space-x-2">
					<select
						value={selectedMetric}
						onChange={(e) =>
							setSelectedMetric(e.target.value as "AQI" | "Temperature" | "PM25")
						}
						className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
					>
						<option value="AQI">AQI Việt Nam</option>
						<option value="PM25">PM2.5</option>
						<option value="Temperature">Nhiệt độ (°C)</option>
					</select>
				</div>
			</div>

			<div className="h-[300px] w-full relative">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={chartData}
						margin={{ top: 10, right: 35, left: 0, bottom: 30 }}
						onMouseLeave={handleMouseLeave}
						barCategoryGap={
							viewType === "hour" 
								? (dataInterval === "dense" ? 2 : dataInterval === "normal" ? 6 : 12) 
								: 10
						}
						barGap={0}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={true}
							stroke="#eee"
						/>
						<XAxis
							dataKey={viewType === "hour" ? "time" : "time"}
							tick={{ fontSize: 11, fill: "#666" }}
							interval={
								viewType === "hour"
									? (dataInterval === "dense" ? 3 : dataInterval === "normal" ? 2 : 1)
									: 0
							}
							tickMargin={10}
							tickFormatter={formatXAxis}
							height={40}
							axisLine={{ stroke: '#eee' }}
							tickLine={false}
							textAnchor="middle"
						/>
						<YAxis
							domain={getYAxisDomain()}
							tick={{ fontSize: 11, fill: "#666" }}
							orientation="right"
							axisLine={false}
							tickLine={false}
							width={35}
							tickCount={7}
							hide
						/>
						<Tooltip 
							cursor={false}
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									const data = payload[0].payload;
									let value = '';
									let label = '';
									
									if (selectedMetric === 'AQI') {
										value = `${data.aqi}`;
										label = 'AQI';
									} else if (selectedMetric === 'PM25') {
										value = `${data.pm25 || Math.round(data.aqi * 0.65)}`;
										label = 'μg/m³';
									} else {
										value = `${data.temperature.toFixed(1)}`;
										label = '°C';
									}
									
									return (
										<div className="bg-white p-2 shadow-md rounded-md border border-gray-200 text-xs">
											<p className="font-semibold">{data.fullTime}</p>
											<p>{value} {label}</p>
										</div>
									);
								}
								return null;
							}}
						/>

						{selectedMetric === "AQI" && (
							// Hiển thị biểu đồ AQI với màu sắc khác nhau cho mỗi cột
							<Bar
								dataKey="aqi"
								name="AQI"
								radius={[3, 3, 0, 0]}
								barSize={
									viewType === "hour"
										? (dataInterval === "dense" ? 7 : dataInterval === "normal" ? 10 : 15)
										: 20
								}
								onMouseOver={handleMouseOver}
							>
								{chartData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={getBarColorFromAQI(entry.aqi)}
									/>
								))}
							</Bar>
						)}

						{selectedMetric === "PM25" && (
							// Hiển thị biểu đồ PM2.5
							<Bar
								dataKey="pm25"
								name="PM2.5"
								radius={[3, 3, 0, 0]}
								barSize={
									viewType === "hour"
										? (dataInterval === "dense" ? 7 : dataInterval === "normal" ? 10 : 15)
										: 20
								}
								onMouseOver={handleMouseOver}
							>
								{chartData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={getPM25Color(entry.pm25 || 0)}
									/>
								))}
							</Bar>
						)}

						{selectedMetric === "Temperature" && (
							// Hiển thị biểu đồ nhiệt độ
							<Bar
								dataKey="temperature"
								name="Nhiệt độ"
								fill="#4dabf7"
								radius={[3, 3, 0, 0]}
								barSize={
									viewType === "hour"
										? (dataInterval === "dense" ? 7 : dataInterval === "normal" ? 10 : 15)
										: 20
								}
								onMouseOver={handleMouseOver}
							/>
						)}

						{/* Vạch tham chiếu cho AQI */}
						{selectedMetric === "AQI" && (
							<>
								<ReferenceLine y={50} stroke="#10b981" strokeDasharray="3 3" strokeWidth={0.5} />
								<ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={0.5} />
								<ReferenceLine y={150} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={0.5} />
								<ReferenceLine y={200} stroke="#a47abf" strokeDasharray="3 3" strokeWidth={0.5} />
							</>
						)}

						{/* Vạch tham chiếu cho PM2.5 */}
						{selectedMetric === "PM25" && (
							<>
								<ReferenceLine y={12} stroke="#10b981" strokeDasharray="3 3" strokeWidth={0.5} />
								<ReferenceLine y={35.4} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={0.5} />
								<ReferenceLine y={55.4} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={0.5} />
								<ReferenceLine y={150} stroke="#a47abf" strokeDasharray="3 3" strokeWidth={0.5} />
							</>
						)}
					</BarChart>
				</ResponsiveContainer>

				{/* Thước đo Y phía bên phải */}
				{selectedMetric === "AQI" && (
					<div className="absolute right-0 top-[12px] bottom-[20px] flex flex-col justify-between text-xs text-gray-500 py-1">
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>210</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>180</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>150</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>120</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>90</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>60</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>30</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>0</div>
						</div>
					</div>
				)}
				
				{selectedMetric === "PM25" && (
					<div className="absolute right-0 top-[12px] bottom-[20px] flex flex-col justify-between text-xs text-gray-500 py-1">
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>150</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>125</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>100</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>75</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>50</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>25</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>0</div>
						</div>
					</div>
				)}
				
				{selectedMetric === "Temperature" && (
					<div className="absolute right-0 top-[12px] bottom-[20px] flex flex-col justify-between text-xs text-gray-500 py-1">
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>40°</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>35°</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>30°</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>25°</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>20°</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>15°</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>10°</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>5°</div>
						</div>
						<div className="flex items-center">
							<div className="w-1 h-[1px] bg-gray-300 mr-1"></div>
							<div>0°</div>
						</div>
					</div>
				)}
			</div>

			{/* Thêm chỉ số ở dưới */}
			<div className="text-xs text-gray-500 mt-1 text-right pr-1">
				<span>
					{selectedMetric === "AQI" && "AQI* Việt Nam"}
					{selectedMetric === "PM25" && "μg/m³"}
					{selectedMetric === "Temperature" && "°C"}
				</span>
			</div>
			
			{/* Ghi chú dưới biểu đồ */}
			<div className="text-xs text-gray-400 mt-3">
				*AQI: Chỉ số chất lượng không khí (theo tiêu chuẩn VN).
			</div>
		</div>
	);
};

export default AQIHistoryChart;