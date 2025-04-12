import { WeatherData } from '@/types/weather';
import { formatDate } from '@/utils/date';

interface WeatherCardProps {
  weatherData: WeatherData;
}

export const WeatherCard = ({ weatherData }: WeatherCardProps) => {
  const { current } = weatherData;
  const formattedDate = formatDate(current?.ts || "");

  return (
    <div className="bg-[#202020] text-white rounded-lg overflow-hidden shadow-lg w-full min-w-[600px]">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-4xl font-bold mb-2">{weatherData.name}</h2>
            <p className="text-gray-400 text-lg">{weatherData.country}</p>
            <p className="text-sm text-gray-400 mt-4 whitespace-nowrap">
              Cập nhật: {formattedDate}
            </p>
          </div>
          <div className="text-right">
            <div className="text-7xl font-bold">
              {Math.round(current?.temperature || 0)}°C
            </div>
            <div className="text-2xl mt-2">
              {current?.condition || ""}
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#2c2c2c] p-3 rounded-lg">
            <div className="text-gray-300 text-sm mb-1">Độ ẩm</div>
            <div className="text-lg font-semibold">
              {current?.humidity || 0}%
            </div>
          </div>
          <div className="bg-[#2c2c2c] p-3 rounded-lg">
            <div className="text-gray-300 text-sm mb-1">Tốc độ gió</div>
            <div className="text-lg font-semibold">
              {current?.wind?.speed || 0} m/s
            </div>
          </div>
          <div className="bg-[#2c2c2c] p-3 rounded-lg">
            <div className="text-gray-300 text-sm mb-1">Áp suất</div>
            <div className="text-lg font-semibold">
              {current?.pressure || 0} hPa
            </div>
          </div>
          <div className="bg-[#2c2c2c] p-3 rounded-lg">
            <div className="text-gray-300 text-sm mb-1">Chỉ số AQI</div>
            <div className="text-lg font-semibold">
              {current?.aqi || 0} - Trung bình
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="mt-6 text-sm text-gray-400">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              {weatherData.name}, {weatherData.country}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard; 