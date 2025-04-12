import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { WeatherData } from "@/types/weather";
import { formatLastUpdated, getTimeAgo } from "@/utils/dateUtils";

interface UseWeatherDataOptions {
	enabled?: boolean;
}

interface UseWeatherDataResult {
	weatherData: WeatherData | undefined;
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
	formattedLastUpdated: string | null;
	lastUpdatedTimeAgo: string | null;
	cachedAt: string | null;
}

export const useWeatherData = (
	endpoint: string,
	options: UseWeatherDataOptions = {}
): UseWeatherDataResult => {
	const fetchWeatherData = async (): Promise<WeatherData> => {
		const response = await fetch(endpoint);

		if (!response.ok) {
			throw new Error(`Lỗi API: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		return data as WeatherData;
	};

	const queryOptions: UseQueryOptions<WeatherData, Error> = {
		queryKey: ["weather", endpoint],
		queryFn: fetchWeatherData,
		staleTime: 5 * 60 * 1000, // 5 phút
		gcTime: 60 * 60 * 1000, // 1 giờ
		retry: 2, // thử lại 2 lần nếu thất bại
		enabled: options.enabled !== false,
	};

	const {
		data: weatherData,
		isLoading,
		error,
		refetch,
		isRefetching,
		dataUpdatedAt,
	} = useQuery<WeatherData, Error>(queryOptions);

	// Hàm refresh thủ công
	const handleRefresh = async () => {
		try {
			await refetch();
		} catch (err) {
			console.error("Lỗi khi làm mới dữ liệu:", err);
		}
	};

	// Lấy thời gian từ current.ts nếu có
	const currentTimestamp = weatherData?.current?.ts;

	// Format thời gian cập nhật cuối
	const formattedLastUpdated = currentTimestamp
		? formatLastUpdated(currentTimestamp)
		: null;

	// Thời gian trôi qua từ lần cập nhật cuối
	const lastUpdatedTimeAgo = currentTimestamp
		? getTimeAgo(currentTimestamp)
		: null;

	// Thời gian cập nhật từ cache React Query
	const cachedAt = dataUpdatedAt ? getTimeAgo(new Date(dataUpdatedAt)) : null;

	return {
		weatherData,
		isLoading: isLoading || isRefetching,
		error: error || null,
		refetch: handleRefresh,
		formattedLastUpdated,
		lastUpdatedTimeAgo,
		cachedAt,
	};
};
