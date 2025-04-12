export interface Coordinates {
  lat: number;
  lng: number;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  coordinates: Coordinates;
  aqi_station_id: string;
}

export interface WeatherForecast {
  day: string;
  date: string;
  aqi: number;
  temperature: {
    high: number;
    low: number;
  };
  humidity: number;
  windSpeed: number;
  weather: string;
  rainChance: number;
}

export interface CityData extends City {
  forecasts: WeatherForecast[];
  lastUpdated: string;
} 