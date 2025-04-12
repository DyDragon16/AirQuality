import React from 'react';
import { useWeatherData } from '../../hooks/useWeatherData';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CityForecast {
  id: string;
  name: string;
  forecasts: Array<{
    date: string;
    day: string;
    aqi: number;
    temperature: {
      high: number;
      low: number;
    };
    humidity: number;
    windSpeed: number;
    rainChance: number;
  }>;
}

export const WeatherForecast: React.FC = () => {
  const {
    weatherData,
    isLoading: loading,
    error,
    formattedLastUpdated: lastUpdate
  } = useWeatherData("", { enabled: true });

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error.message}</div>;
  }

  // Chuyển đổi dữ liệu thời tiết thành định dạng cities
  const cities: CityForecast[] = weatherData ? [
    {
      id: weatherData.id || "1",
      name: weatherData.name,
      forecasts: (weatherData.forecasts?.daily || []).map(forecast => ({
        date: new Date(forecast.ts).toISOString(),
        day: format(new Date(forecast.ts), 'EEEE', { locale: vi }),
        aqi: forecast.aqi || 0,
        temperature: {
          high: Math.round(forecast.temperature.max),
          low: Math.round(forecast.temperature.min)
        },
        humidity: forecast.humidity || 0,
        windSpeed: Math.round((forecast.wind?.speed || 0) * 3.6), // Chuyển từ m/s sang km/h
        rainChance: forecast.probabilityOfRain || 0
      }))
    }
  ] : [];

  return (
    <div className="space-y-6">
      {lastUpdate && (
        <div className="text-sm text-gray-500">
          Cập nhật lần cuối: {lastUpdate}
        </div>
      )}
      
      {cities.map(city => (
        <div key={city.id} className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">{city.name}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {city.forecasts.map(forecast => (
              <div 
                key={forecast.date} 
                className="bg-gray-700 rounded-lg p-4 flex flex-col items-center"
              >
                <div className="text-lg font-semibold mb-2">
                  {forecast.day === format(new Date(), 'EEEE', { locale: vi }) ? 'Hôm nay' : forecast.day}
                </div>
                <div className="text-3xl font-bold text-yellow-500 mb-2">
                  {forecast.aqi}
                </div>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>
                    {forecast.temperature.high}° / {forecast.temperature.low}°
                  </div>
                  <div>
                    Độ ẩm: {forecast.humidity}%
                  </div>
                  <div>
                    Gió: {forecast.windSpeed} km/h
                  </div>
                  <div>
                    Mưa: {forecast.rainChance}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}; 