import React from 'react';

interface WHORatioDisplayProps {
  pm25Value: number;
}

const WHORatioDisplay: React.FC<WHORatioDisplayProps> = ({ pm25Value }) => {
  // Tính tỉ lệ so với chuẩn WHO cho PM2.5 (5 µg/m³)
  const whoRatio = pm25Value / 5;
  
  // Hàm lấy màu chữ dựa trên tỉ lệ WHO
  const getWHOColor = (ratio: number) => {
    if (ratio <= 1) return "text-green-500";
    if (ratio <= 2) return "text-yellow-500";
    if (ratio <= 3) return "text-orange-500";
    if (ratio <= 5) return "text-red-500";
    if (ratio <= 10) return "text-red-500";
    return "text-red-800";
  };
  
  // Hàm lấy màu nền dựa trên tỉ lệ WHO
  const getWHOBgColor = (ratio: number) => {
    if (ratio <= 1) return "bg-green-100";
    if (ratio <= 2) return "bg-yellow-100";
    if (ratio <= 3) return "bg-orange-100";
    if (ratio <= 5) return "bg-red-100";
    if (ratio <= 10) return "bg-red-100";
    return "bg-red-200";
  };
  
  // Hàm lấy icon cảnh báo dựa trên tỉ lệ WHO
  const getWHOIcon = (ratio: number) => {
    if (ratio <= 1) return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
    
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${getWHOColor(ratio)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
      <div className="p-4">
        <div className={`p-4 rounded-lg ${getWHOBgColor(whoRatio)} mb-4 flex items-center space-x-3`}>
          {getWHOIcon(whoRatio)}
          <div>
            <p className="font-normal text-gray-900">
              {whoRatio <= 1 
                ? 'Nồng độ PM2.5 đạt chuẩn WHO' 
                : <><span className="font-bold">Nồng độ PM2.5</span> hiện tại là <span className={`font-bold ${getWHOColor(whoRatio)}`}>{Math.round(whoRatio * 10) / 10}</span> lần giá trị hướng dẫn hàng năm về PM2.5 của WHO.</>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WHORatioDisplay; 