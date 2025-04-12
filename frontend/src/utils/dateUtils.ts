/**
 * Chuyển đổi ngày sang múi giờ Việt Nam (UTC+7)
 */
export const getVietnamTime = (date: Date): Date => {
	// Sử dụng timezone của Việt Nam (UTC+7)
	const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
	return new Date(utcTime + 7 * 3600000); // UTC+7
};

/**
 * Format thời gian cập nhật theo định dạng Việt Nam
 */
export const formatLastUpdated = (dateString: string): string => {
	try {
		const date = new Date(dateString);
		// Kiểm tra date có hợp lệ không
		if (isNaN(date.getTime())) {
			return "Không xác định";
		}

		// Chuyển đổi sang múi giờ Việt Nam
		const vnTime = getVietnamTime(date);

		// Format thời gian theo định dạng Việt Nam
		return vnTime.toLocaleString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	} catch (e) {
		console.error("Lỗi khi format thời gian:", e);
		return "Không xác định";
	}
};

/**
 * Tính thời gian trôi qua (ví dụ: "2 phút trước")
 */
export const getTimeAgo = (dateString: string | Date): string => {
	try {
		const date =
			typeof dateString === "string" ? new Date(dateString) : dateString;
		// Kiểm tra date có hợp lệ không
		if (isNaN(date.getTime())) {
			return "";
		}

		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 1) return "vừa xong";
		if (diffMins < 60) return `${diffMins} phút trước`;

		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours} giờ trước`;

		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays} ngày trước`;
	} catch (e) {
		console.error("Lỗi khi tính thời gian:", e);
		return "";
	}
};

/**
 * Lấy tên ngày trong tuần (tiếng Việt)
 */
export const getDayName = (date: Date): string => {
	const inputDate = new Date(date);
	const today = getVietnamTime(new Date());

	// Set cả 2 về đầu ngày để so sánh chính xác
	const todayStart = new Date(today);
	todayStart.setHours(0, 0, 0, 0);

	const compareDate = getVietnamTime(inputDate);
	compareDate.setHours(0, 0, 0, 0);

	// Tạo một bản sao của today để tính toán ngày mai
	const tomorrow = new Date(todayStart);
	tomorrow.setDate(tomorrow.getDate() + 1);

	// So sánh ngày
	if (compareDate.getTime() === todayStart.getTime()) {
		return "Hôm nay";
	} else if (compareDate.getTime() === tomorrow.getTime()) {
		return "Ngày mai";
	}

	// Lấy thứ trong tuần
	const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
	return days[compareDate.getDay()];
};
