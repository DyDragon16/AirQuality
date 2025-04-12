import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { WeatherRanking } from "@/types/ranking";
import { rankingService } from "@/services/rankingService";

interface UseRankingDataOptions {
	enabled?: boolean;
	limit?: number;
	sort?: "asc" | "desc";
}

interface UseRankingDataResult {
	rankingData: WeatherRanking[] | undefined;
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
}

/**
 * Hook để lấy dữ liệu ranking AQI
 */
export const useAQIRanking = (
	options: UseRankingDataOptions = {}
): UseRankingDataResult => {
	const { limit = 10, enabled = true } = options;

	const fetchAQIRanking = async (): Promise<WeatherRanking[]> => {
		return await rankingService.getAQIRanking(limit);
	};

	const queryOptions: UseQueryOptions<WeatherRanking[], Error> = {
		queryKey: ["aqiRanking", limit],
		queryFn: fetchAQIRanking,
		staleTime: 5 * 60 * 1000, // 5 phút
		gcTime: 60 * 60 * 1000, // 1 giờ
		retry: 2, // thử lại 2 lần nếu thất bại
		enabled,
	};

	const {
		data: rankingData,
		isLoading,
		error,
		refetch: refetchQuery,
	} = useQuery<WeatherRanking[], Error>(queryOptions);

	// Hàm refresh thủ công
	const refetch = async () => {
		try {
			await refetchQuery();
		} catch (err) {
			console.error("Lỗi khi làm mới dữ liệu ranking AQI:", err);
		}
	};

	return {
		rankingData,
		isLoading,
		error: error || null,
		refetch,
	};
};

/**
 * Hook để lấy dữ liệu ranking nhiệt độ
 */
export const useTemperatureRanking = (
	options: UseRankingDataOptions = {}
): UseRankingDataResult => {
	const { limit = 10, sort = "desc", enabled = true } = options;

	const fetchTemperatureRanking = async (): Promise<WeatherRanking[]> => {
		return await rankingService.getTemperatureRanking(limit, sort);
	};

	const queryOptions: UseQueryOptions<WeatherRanking[], Error> = {
		queryKey: ["temperatureRanking", limit, sort],
		queryFn: fetchTemperatureRanking,
		staleTime: 5 * 60 * 1000, // 5 phút
		gcTime: 60 * 60 * 1000, // 1 giờ
		retry: 2, // thử lại 2 lần nếu thất bại
		enabled,
	};

	const {
		data: rankingData,
		isLoading,
		error,
		refetch: refetchQuery,
	} = useQuery<WeatherRanking[], Error>(queryOptions);

	// Hàm refresh thủ công
	const refetch = async () => {
		try {
			await refetchQuery();
		} catch (err) {
			console.error("Lỗi khi làm mới dữ liệu ranking nhiệt độ:", err);
		}
	};

	return {
		rankingData,
		isLoading,
		error: error || null,
		refetch,
	};
};
