require("dotenv").config(); // Đọc biến môi trường từ file .env
const axios = require("axios");

// Sử dụng biến môi trường cho URL API
const baseUrl =
	process.env.AIRVISUAL_API_URL || "https://website-api.airvisual.com/v1";
console.log("URL API đang sử dụng:", baseUrl);

async function testAPI(cityId) {
	console.log(`Đang gọi API: ${baseUrl}/cities/${cityId}`);
	try {
		const response = await axios.get(`${baseUrl}/cities/${cityId}`, {
			headers: {
				"accept-language": "vi",
			},
		});

		// Kiểm tra cấu trúc response
		console.log("Status code:", response.status);
		console.log("Các trường dữ liệu chính:", Object.keys(response.data.data));
		console.log("Thời tiết hiện tại:", response.data.data.current);

		// Kiểm tra dữ liệu hourly nếu có
		if (response.data.data.hourly) {
			console.log(
				"Có trường hourly với",
				response.data.data.hourly.length,
				"bản ghi"
			);
			console.log(
				"Cấu trúc mục đầu tiên trong hourly:",
				Object.keys(response.data.data.hourly[0])
			);
		} else {
			console.log("Không có dữ liệu hourly");
		}
	} catch (error) {
		console.error("Lỗi khi gọi API:", error.message);
		if (error.response) {
			console.error("Chi tiết lỗi:", error.response.data);
		}
	}
}

// Thành phố Hà Nội
testAPI("fVz2Gw2NfZHXMvbgz");
