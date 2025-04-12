// Hàm định dạng ngày tháng
export const formatDate = (timestamp: string): string => {
	if (!timestamp) return "";

	try {
		const date = new Date(timestamp);
		return date.toLocaleString('vi-VN', {
			hour: '2-digit',
			minute: '2-digit',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	} catch (error) {
		console.error('Error formatting date:', error);
		return timestamp;
	}
};
