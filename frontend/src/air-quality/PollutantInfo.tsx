import React from "react";
import { WeatherData } from "@/types/weather";

interface PollutantInfoProps {
	weatherData: WeatherData;
}

const PollutantInfo: React.FC<PollutantInfoProps> = ({ weatherData }) => {
	// Kiểm tra xem có dữ liệu pollutants không
	if (
		!weatherData.current ||
		!weatherData.current.pollutants ||
		weatherData.current.pollutants.length === 0
	) {
		return null;
	}

	// Tìm thông tin PM2.5 từ danh sách pollutants
	const pm25 = weatherData.current.pollutants.find(
		(p) => p.pollutantName === "pm2.5" || p.pollutantName === "PM2.5"
	);

	if (!pm25) {
		return null;
	}

	const mainPollutant = weatherData.current.mainPollutant || "PM2.5";
	const aqiDesc = weatherData.current.aqiDescription || "Không có dữ liệu";

	// Tính tỉ lệ so với chuẩn WHO cho PM2.5 (5 µg/m³)
	const whoRatio = pm25.concentration / 5;

	// Hàm lấy màu chữ dựa trên tỉ lệ WHO
	const getWHOColor = (ratio: number) => {
		if (ratio <= 1) return "text-green-500";
		if (ratio <= 2) return "text-yellow-500";
		if (ratio <= 3) return "text-orange-500";
		if (ratio <= 5) return "text-red-500";
		if (ratio <= 10) return "text-purple-500";
		return "text-red-800";
	};

	// Hàm xác định mức độ theo WHO
	const getWHOLevel = (ratio: number) => {
		if (ratio <= 1) return "Đạt chuẩn WHO";
		if (ratio <= 2) return "Gấp 2 lần chuẩn WHO";
		if (ratio <= 3) return "Gấp 3 lần chuẩn WHO";
		if (ratio <= 5) return "Gấp 5 lần chuẩn WHO";
		if (ratio <= 10) return "Gấp 10 lần chuẩn WHO";
		return "Vượt 10 lần chuẩn WHO";
	};

	return (
		<div className="rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 p-4">
			<div className="text-xl font-bold text-gray-800 dark:text-white mb-3">
				Thông tin ô nhiễm không khí
			</div>

			<div className="space-y-3">
				<div className="flex justify-between items-center">
					<span className="text-gray-700 dark:text-gray-300">
						Chất ô nhiễm chính:
					</span>
					<span className="font-semibold text-gray-800 dark:text-white">
						{mainPollutant}
					</span>
				</div>

				<div className="flex justify-between items-center">
					<span className="text-gray-700 dark:text-gray-300">
						Chỉ số chất lượng không khí:
					</span>
					<span className="font-semibold text-gray-800 dark:text-white">
						{aqiDesc}
					</span>
				</div>

				<div className="flex justify-between items-center">
					<span className="text-gray-700 dark:text-gray-300">
						Nồng độ PM2.5:
					</span>
					<span className="font-semibold text-gray-800 dark:text-white">
						{pm25.concentration} {pm25.unit}
					</span>
				</div>

				<div className="flex justify-between items-center">
					<span className="text-gray-700 dark:text-gray-300">
						So với chuẩn WHO:
					</span>
					<span className={`font-semibold ${getWHOColor(whoRatio)}`}>
						{getWHOLevel(whoRatio)}
					</span>
				</div>

				<div className="mt-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
					<p className="text-sm text-gray-700 dark:text-gray-300">
						PM2.5 là hạt bụi mịn có đường kính 2.5 micromet hoặc nhỏ hơn. Các
						hạt này có thể đi sâu vào phổi và thậm chí vào máu, gây ra các vấn
						đề sức khỏe nghiêm trọng như bệnh tim mạch và hô hấp.
					</p>
				</div>
			</div>
		</div>
	);
};

export default PollutantInfo;
