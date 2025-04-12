import React from 'react';
import { getAQIText } from '@/utils/aqi';

interface AQIDisplayProps {
  aqi: number;
  compact?: boolean;
  pollutant?: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  useThemeColor?: boolean;
}

export const AQIDisplay = ({ 
  aqi, 
  compact = false,
  pollutant,
  temperature,
  humidity,
  windSpeed,
  useThemeColor = true
}: AQIDisplayProps) => {
  const aqiText = getAQIText(aqi);
  
  // Từ class gradient, lấy màu chính cho background
  const getBgColor = () => {
    if (aqi <= 50) return "bg-green-400";
    if (aqi <= 100) return "bg-yellow-400";
    if (aqi <= 150) return "bg-orange-400";
    if (aqi <= 200) return "bg-red-400";
    if (aqi <= 300) return "bg-purple-400";
    return "bg-red-500";
  };
  
  // Nếu compact mode được kích hoạt, hiển thị layout card nhỏ gọn
  if (compact) {
    const bgClass = useThemeColor ? getBgColor() : "bg-red-500";
    
    return (
      <div className="w-full">
        {/* Card top section with AQI */}
        <div className={`${bgClass} text-white rounded-t-lg p-4 flex justify-between items-center`}>
          <div className="flex items-center space-x-4 flex-grow">
            <div className="bg-white/20 px-4 py-2 rounded-lg text-center">
              <div className="text-2xl font-bold">
                {aqi}
              </div>
              <div className="text-xs">
                AQI* VN
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-semibold">{aqiText}</h3>
              <div className="mt-1 text-sm text-white/80">
                <p>Ô nhiễm chính: {pollutant || "PM2.5"}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card bottom section with weather data */}
        <div className="bg-white rounded-b-lg p-3 flex justify-between shadow-sm">
          <div className="flex items-center flex-1 justify-center">
            <div className="text-yellow-500 mr-2">☀️</div>
            <div>
              <div className="text-base font-medium text-gray-900">{temperature || 26}°</div>
            </div>
          </div>
          
          <div className="flex items-center flex-1 justify-center border-l border-r border-gray-200">
            <div className="text-gray-700 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-base font-medium text-gray-900">{windSpeed || 10.5} km/h</div>
            </div>
          </div>
          
          <div className="flex items-center flex-1 justify-center">
            <div className="text-blue-500 mr-2">💧</div>
            <div>
              <div className="text-base font-medium text-gray-900">{humidity || 27}%</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg w-full min-w-[600px] ${getBgColor()}`}>
        <div className="p-6">
            {/* AQI Content */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-3xl font-bold mb-2">Chất lượng không khí</h3>
                    <p className="text-xl">{aqiText}</p>
                </div>
                <div className="text-right">
                    <div className="text-7xl font-bold">{aqi}</div>
                    <div className="text-2xl mt-2">AQI* VN</div>
                </div>
            </div>

            {/* Weather Parameters */}
            <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                    <div className="text-yellow-500 text-2xl mb-2">☀️</div>
                    <div className="text-lg font-medium">{temperature || 26}°</div>
                </div>
                <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                    <div className="text-gray-300 text-2xl mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="text-lg font-medium">{windSpeed || 10.5} km/h</div>
                </div>
                <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                    <div className="text-blue-500 text-2xl mb-2">💧</div>
                    <div className="text-lg font-medium">{humidity || 27}%</div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AQIDisplay; 