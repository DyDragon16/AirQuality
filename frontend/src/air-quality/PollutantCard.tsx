import React from 'react';

interface PollutantCardProps {
  pollutantName: string;
  concentration: number;
  unit: string;
  background?: boolean;
}

const PollutantCard: React.FC<PollutantCardProps> = ({
  pollutantName,
  concentration,
  unit,
  background = true
}) => {
  // Format tên pollutant để hiển thị
  const getFormattedName = (name: string) => {
    switch (name.toLowerCase()) {
      case 'pm25':
      case 'pm2.5':
        return 'PM2.5';
      case 'pm10':
        return 'PM10';
      case 'o3':
        return 'O₃';
      case 'no2':
        return 'NO₂';
      case 'so2':
        return 'SO₂';
      case 'co':
        return 'CO';
      default:
        return name;
    }
  };

  // Lấy mô tả cho pollutant
  const getDescription = (name: string) => {
    switch (name.toLowerCase()) {
      case 'pm25':
      case 'pm2.5':
        return 'Hạt mịn (≤ 2.5 µm)';
      case 'pm10':
        return 'Hạt lớn (≤ 10 µm)';
      case 'o3':
        return 'Ozone';
      case 'no2':
        return 'Nitơ dioxit';
      case 'so2':
        return 'Lưu huỳnh dioxit';
      case 'co':
        return 'Cacbon monoxit';
      default:
        return 'Chất ô nhiễm';
    }
  };

  // Lấy màu dựa trên giá trị nồng độ và loại chất ô nhiễm
  const getColor = (name: string, value: number) => {
    if (name.toLowerCase() === 'pm25' || name.toLowerCase() === 'pm2.5') {
      if (value <= 12) return 'bg-green-500';
      if (value <= 35.4) return 'bg-yellow-500';
      if (value <= 55.4) return 'bg-orange-500';
      if (value <= 150.4) return 'bg-red-500';
      if (value <= 200.4) return 'bg-purple-500';
      return 'bg-red-800';
    } else if (name.toLowerCase() === 'pm10') {
      if (value <= 54) return 'bg-green-500';
      if (value <= 154) return 'bg-yellow-500';
      if (value <= 254) return 'bg-orange-500';
      if (value <= 354) return 'bg-red-500';
      if (value <= 424) return 'bg-purple-500';
      return 'bg-red-800';
    } else if (name.toLowerCase() === 'no2') {
      if (value <= 40) return 'bg-green-500';
      if (value <= 150) return 'bg-red-500';
      if (value <= 200) return 'bg-purple-500';
      return 'bg-red-800';
    } else if (name.toLowerCase() === 'so2') {
      if (value <= 40) return 'bg-green-500';
      if (value <= 150) return 'bg-red-500';
      if (value <= 200) return 'bg-purple-500';
      return 'bg-red-800';
    } else if (name.toLowerCase() === 'co') {
      if (value <= 10) return 'bg-green-500';
      if (value <= 30) return 'bg-red-500';
      if (value <= 50) return 'bg-purple-500';
      return 'bg-red-800';
    }
    return 'bg-gray-500';
  };

  // Lấy màu cho văn bản
  const getTextColor = (name: string, value: number) => {
    if (name.toLowerCase() === 'pm25' || name.toLowerCase() === 'pm2.5') {
      if (value <= 12) return 'text-green-500';
      if (value <= 35.4) return 'text-yellow-500';
      if (value <= 55.4) return 'text-orange-500';
      if (value <= 150.4) return 'text-red-500';
      if (value <= 200.4) return 'text-purple-500';
      return 'text-red-800';
    } else if (name.toLowerCase() === 'pm10') {
      if (value <= 54) return 'text-green-500';
      if (value <= 154) return 'text-yellow-500';
      if (value <= 254) return 'text-orange-500';
      if (value <= 354) return 'text-red-500';
      if (value <= 424) return 'text-purple-500';
      return 'text-red-800';
    } else if (name.toLowerCase() === 'no2') {
      if (value <= 40) return 'text-green-500';
      if (value <= 150) return 'text-red-500';
      if (value <= 200) return 'text-purple-500';
      return 'text-red-800';
    } else if (name.toLowerCase() === 'so2') {
      if (value <= 40) return 'text-green-500';
      if (value <= 150) return 'text-red-500';
      if (value <= 200) return 'text-purple-500';
      return 'text-red-800';
    } else if (name.toLowerCase() === 'co') {
      if (value <= 10) return 'text-green-500';
      if (value <= 30) return 'text-red-500';
      if (value <= 50) return 'text-purple-500';
      return 'text-red-800';
    }
    return 'text-gray-500';
  };

  const formattedName = getFormattedName(pollutantName);
  const description = getDescription(pollutantName);
  const colorClass = getColor(pollutantName, concentration);
  const textColorClass = getTextColor(pollutantName, concentration);

  return (
    <div className={`rounded-lg overflow-hidden shadow-sm ${background ? 'bg-white' : ''} w-full`}>
      <div className={`${colorClass} h-1 w-full`}></div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{formattedName}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${textColorClass}`}>
              {concentration.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500 ml-1">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollutantCard; 