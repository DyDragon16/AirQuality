import React from 'react';

interface Pollutant {
  pollutantName: string;
  concentration: number;
  unit: string;
}

interface PollutantTableProps {
  pollutants: Pollutant[];
  cityName: string;
}

const PollutantTable = ({ pollutants, cityName }: PollutantTableProps) => {
  // Ánh xạ tên chất ô nhiễm từ API sang tiếng Việt
  const getPollutantInfo = (name: string) => {
    switch (name) {
      case 'pm25':
        return {
          name: 'PM2.5',
          description: 'Hạt mịn (≤ 2.5 µm)',
        };
      case 'pm10':
        return {
          name: 'PM10',
          description: 'Hạt lớn (≤ 10 µm)',
        };
      case 'o3':
        return {
          name: 'O₃',
          description: 'Ozone',
        };
      case 'no2':
        return {
          name: 'NO₂',
          description: 'Nitơ dioxit',
        };
      case 'so2':
        return {
          name: 'SO₂',
          description: 'Lưu huỳnh dioxit',
        };
      case 'co':
        return {
          name: 'CO',
          description: 'Cacbon monoxit',
        };
      default:
        return {
          name: name,
          description: 'Chất ô nhiễm',
        };
    }
  };

  // Lấy biểu tượng màu tương ứng với mức độ ô nhiễm
  const getColorDot = (name: string, value: number) => {
    if (name === 'pm25') {
      if (value <= 12) return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>;
      else if (value <= 35.4) return <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>;
      else if (value <= 55.4) return <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-2"></span>;
      else return <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>;
    } else if (name === 'pm10') {
      if (value <= 54) return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>;
      else if (value <= 154) return <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>;
      else if (value <= 254) return <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-2"></span>;
      else return <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>;
    } else if (name === 'no2') {
      if (value <= 40) return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>;
      else return <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>;
    } else if (name === 'so2') {
      if (value <= 40) return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>;
      else return <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>;
    } else if (name === 'co') {
      if (value <= 10) return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>;
      else return <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>;
    } else {
      return <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>;
    }
  };

  // Lấy màu cho giá trị nồng độ
  const getConcentrationColor = (name: string, value: number) => {
    if (name === 'pm25') {
      if (value <= 12) return "text-green-500";
      else if (value <= 35.4) return "text-yellow-500";
      else if (value <= 55.4) return "text-orange-500";
      else return "text-red-500";
    } else if (name === 'pm10') {
      if (value <= 54) return "text-green-500";
      else if (value <= 154) return "text-yellow-500";
      else if (value <= 254) return "text-orange-500";
      else return "text-red-500";
    } else if (name === 'no2') {
      if (value <= 40) return "text-green-500";
      else return "text-red-500";
    } else if (name === 'so2') {
      if (value <= 40) return "text-green-500";
      else return "text-red-500";
    } else if (name === 'co') {
      if (value <= 10) return "text-green-500";
      else return "text-red-500";
    } else {
      return "text-gray-500";
    }
  };

  // Lọc và sắp xếp các pollutant theo thứ tự hiển thị
  const getOrderedPollutants = () => {
    // Thứ tự hiển thị mong muốn
    const displayOrder = ['pm25', 'pm10', 'no2', 'co', 'so2', 'o3'];
    
    // Tạo một đối tượng để lưu trữ pollutant
    const pollutantMap: {[key: string]: Pollutant} = {};
    
    // Lưu pollutants vào map
    pollutants.forEach(p => {
      pollutantMap[p.pollutantName] = p;
    });
    
    // Lọc và sắp xếp theo thứ tự hiển thị
    const result: Pollutant[] = [];
    displayOrder.forEach(name => {
      if (pollutantMap[name]) {
        result.push(pollutantMap[name]);
      }
    });
    
    // Thêm bất kỳ pollutant nào khác không có trong danh sách thứ tự
    pollutants.forEach(p => {
      if (!displayOrder.includes(p.pollutantName)) {
        result.push(p);
      }
    });
    
    return result;
  };

  const orderedPollutants = getOrderedPollutants();

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Chất gây ô nhiễm không khí
        </h2>
        <p className="text-gray-600 mb-4 text-sm">
          Chất lượng không khí hiện tại ở {cityName} ra sao?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orderedPollutants.filter(p => p.pollutantName === 'pm25' || p.pollutantName === 'pm10').map((pollutant) => {
            const pollutantInfo = getPollutantInfo(pollutant.pollutantName);
            const colorDot = getColorDot(pollutant.pollutantName, pollutant.concentration);
            const concentrationColor = getConcentrationColor(pollutant.pollutantName, pollutant.concentration);
            
            return (
              <div key={pollutant.pollutantName} className="bg-gray-50 p-4 rounded-lg">
                <div>
                  <div className="font-bold text-lg mb-1 text-black">
                    {pollutantInfo.name}
                  </div>
                  <div className="text-gray-500 text-sm mb-4">
                    {pollutantInfo.description}
                  </div>
                  
                  <div className="flex items-center">
                    {colorDot}
                    <span className={`${concentrationColor} text-xl font-medium`}>
                      {pollutant.concentration.toFixed(1)}
                    </span>
                    <span className="ml-1 text-gray-500">µg/m³</span>
                  </div>
                </div>
              </div>
            );
          })}

          {orderedPollutants.filter(p => p.pollutantName === 'no2' || p.pollutantName === 'so2').map((pollutant) => {
            const pollutantInfo = getPollutantInfo(pollutant.pollutantName);
            const colorDot = getColorDot(pollutant.pollutantName, pollutant.concentration);
            const concentrationColor = getConcentrationColor(pollutant.pollutantName, pollutant.concentration);
            
            return (
              <div key={pollutant.pollutantName} className="bg-gray-50 p-4 rounded-lg">
                <div>
                  <div className="font-bold text-lg mb-1 text-black">
                    {pollutantInfo.name}
                  </div>
                  <div className="text-gray-500 text-sm mb-4">
                    {pollutantInfo.description}
                  </div>
                  
                  <div className="flex items-center">
                    {colorDot}
                    <span className={`${concentrationColor} text-xl font-medium`}>
                      {pollutant.concentration.toFixed(1)}
                    </span>
                    <span className="ml-1 text-gray-500">µg/m³</span>
                  </div>
                </div>
              </div>
            );
          })}

          {orderedPollutants.filter(p => p.pollutantName === 'co').map((pollutant) => {
            const pollutantInfo = getPollutantInfo(pollutant.pollutantName);
            const colorDot = getColorDot(pollutant.pollutantName, pollutant.concentration);
            const concentrationColor = getConcentrationColor(pollutant.pollutantName, pollutant.concentration);
            
            return (
              <div key={pollutant.pollutantName} className="bg-gray-50 p-4 rounded-lg">
                <div>
                  <div className="font-bold text-lg mb-1 text-black">
                    {pollutantInfo.name}
                  </div>
                  <div className="text-gray-500 text-sm mb-4">
                    {pollutantInfo.description}
                  </div>
                  
                  <div className="flex items-center">
                    {colorDot}
                    <span className={`${concentrationColor} text-xl font-medium`}>
                      {pollutant.concentration.toFixed(1)}
                    </span>
                    <span className="ml-1 text-gray-500">µg/m³</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PollutantTable; 