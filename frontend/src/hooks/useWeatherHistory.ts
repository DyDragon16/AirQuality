import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { weatherService } from "@/services/weatherService";
import { WeatherHistoryResponse, WeatherHistoryData } from "@/types/weather";

interface UseWeatherHistoryOptions {
	enabled?: boolean;
	days?: number;
}

interface UseWeatherHistoryResult {
	historyData: WeatherHistoryData | undefined;
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
}

/**
 * Hook để lấy lịch sử thời tiết của một thành phố
 * @param cityId ID của thành phố
 * @param options Tùy chọn cho hook
 */
export const useWeatherHistory = (
	cityId: string,
	options: UseWeatherHistoryOptions = {}
): UseWeatherHistoryResult => {
	const { enabled = true, days = 7 } = options;

	const fetchWeatherHistory = async (): Promise<WeatherHistoryData> => {
		const response = await weatherService.getWeatherHistory(cityId, days);
		return response.data;
	};

	const queryOptions: UseQueryOptions<WeatherHistoryData, Error> = {
		queryKey: ["weatherHistory", cityId, days],
		queryFn: fetchWeatherHistory,
		staleTime: 30 * 60 * 1000, // 30 phút
		gcTime: 60 * 60 * 1000, // 1 giờ
		retry: 2, // thử lại 2 lần nếu thất bại
		enabled: enabled && !!cityId,
	};

	const {
		data: historyData,
		isLoading,
		error,
		refetch,
	} = useQuery<WeatherHistoryData, Error>(queryOptions);

	// Hàm refresh thủ công
	const handleRefetch = async () => {
		try {
			await refetch();
		} catch (err) {
			console.error("Lỗi khi làm mới dữ liệu lịch sử:", err);
		}
	};

	return {
		historyData,
		isLoading,
		error: error || null,
		refetch: handleRefetch,
	};
};
