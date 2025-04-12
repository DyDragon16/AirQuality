/**
 * Type cho dữ liệu ranking thời tiết
 */
export interface WeatherRanking {
	cityId: string;
	cityName: string;
	averageAQI: number;
	averageTemperature: number;
	lastUpdated: Date;
}

/**
 * Response từ API ranking
 */
export interface RankingResponse {
	status: string;
	data: {
		title: string;
		description: string;
		timestamp: Date;
		ranking: WeatherRanking[];
	};
}
