export interface WeatherData {
	id: string;
	name: string;
	country: string;
	zoomLevel?: number;
	timezone?: string;
	state?: string;
	current?: {
		ts: string;
		aqi: number;
		mainPollutant: string;
		concentration: number;
		estimated: boolean;
		WHOExposure?: {
			WHOExposure: number;
			WHOExposureColor: string;
		};
		condition: string;
		icon: string;
		humidity: number;
		pressure: number;
		wind: {
			speed: number;
			direction: number;
		};
		temperature: number;
		pollutants?: Array<{
			unit: string;
			description: string;
			aqi: number;
			concentration: number;
			pollutantName: string;
		}>;
		aqiDescription?: string;
	};
	coordinates?: {
		latitude: number;
		longitude: number;
	};
	forecasts?: {
		hourly: Array<any>;
		daily: Array<any>;
	};
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
