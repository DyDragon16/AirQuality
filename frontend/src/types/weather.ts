export interface WeatherData {
	id?: string;
	name: string;
	country: string;
	zoomLevel?: number;
	timezone?: string;
	state?: string;
	current?: {
		ts: string;
		temperature: number;
		condition: string;
		humidity: number;
		wind?: {
			speed: number;
			direction: number;
		};
		pressure: number;
		aqi: number;
		mainPollutant?: string;
		aqiDescription?: string;
		pollutants?: Array<{
			pollutantName: string;
			concentration: number;
			unit: string;
		}>;
	};
	coordinates?: {
		latitude: number;
		longitude: number;
	};
	forecasts?: {
		hourly: Array<{
			ts: string;
			aqi: number;
			pressure: number;
			humidity: number;
			wind: {
				speed: number;
				direction: number;
			};
			icon: string;
			condition: string;
			temperature: number;
			probabilityOfRain?: number;
		}>;
		daily: Array<{
			ts: string;
			aqi: number;
			pressure: number;
			humidity: number;
			probabilityOfRain?: number;
			wind: {
				speed: number;
				direction: number;
			};
			icon: string;
			condition: string;
			temperature: {
				max: number;
				min: number;
			};
		}>;
	};
	temperature: number;
	humidity: number;
	windSpeed: number;
	pressure: number;
	aqi: number;
	mainPollutant: string;
	location: {
		latitude: number;
		longitude: number;
	};
	mapUrl?: string;
}

export interface WeatherResponse {
	status?: string;
	data?: WeatherData;
}

export interface ErrorResponse {
	status: string;
	data: {
		message: string;
	};
}

// Interface cho dữ liệu lịch sử thời tiết
export interface WeatherHistoryRecord {
	timestamp: Date;
	aqi: number;
	temperature: number;
	humidity: number;
	windSpeed: number;
	condition: string;
	pm25?: number;
}

export interface WeatherHistoryData {
	cityId: string;
	cityName: string;
	records: WeatherHistoryRecord[];
	days: number;
	timestamp: Date;
}

export interface WeatherHistoryResponse {
	status: string;
	data: WeatherHistoryData;
}
