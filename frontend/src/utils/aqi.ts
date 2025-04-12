// Hàm lấy màu dựa trên chỉ số AQI
export const getAQIColor = (aqi: number): string => {
	if (aqi <= 50) return "#4ade80"; // Màu xanh lá nhạt hơn
	if (aqi <= 100) return "#facc15"; // Màu vàng nhạt hơn
	if (aqi <= 150) return "#fb923c"; // Màu cam nhạt hơn
	if (aqi <= 200) return "#f87171"; // Màu đỏ nhạt hơn
	if (aqi <= 300) return "#c084fc"; // Màu tím nhạt hơn
	return "#ef4444"; // Màu đỏ
};

// Hàm lấy text mô tả dựa trên chỉ số AQI
export const getAQIText = (aqi: number): string => {
	if (aqi <= 50) return "Tốt";
	if (aqi <= 100) return "Trung bình";
	if (aqi <= 150) return "Không tốt cho người nhạy cảm";
	if (aqi <= 200) return "Không lành mạnh";
	if (aqi <= 300) return "Rất không lành mạnh";
	return "Nguy hiểm";
};

// Hàm lấy gradient màu nền dựa trên chỉ số AQI
export const getAQIGradient = (aqi: number): string => {
	if (aqi <= 50) return "bg-gradient-to-br from-green-200 to-green-400"; // Tốt - xanh lá nhạt
	if (aqi <= 100) return "bg-gradient-to-br from-yellow-100 to-yellow-300"; // Trung bình - vàng nhạt
	if (aqi <= 150) return "bg-gradient-to-br from-orange-100 to-orange-300"; // Không tốt cho người nhạy cảm - cam nhạt
	if (aqi <= 200) return "bg-gradient-to-br from-red-200 to-red-400"; // Không lành mạnh - đỏ nhạt
	if (aqi <= 300) return "bg-gradient-to-br from-purple-200 to-purple-400"; // Rất không lành mạnh - tím nhạt
	return "bg-gradient-to-br from-red-300 to-red-500"; // Nguy hiểm - đỏ nhạt
};
