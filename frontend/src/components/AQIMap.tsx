'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/navigation';

// Fix icon paths
interface IconWithGetIconUrl extends L.Icon.Default {
  _getIconUrl?: string;
}

interface CityAQIData {
  name: string;
  aqi: number;
  slug: string;
  region?: string;
}

interface AQIMapProps {
  cities: CityAQIData[];
  isLoading: boolean;
}

// Map coordinates for each city
const CITY_COORDINATES: Record<string, [number, number]> = {
  "Hà Nội": [21.0278, 105.8342],
  "Hồ Chí Minh": [10.8231, 106.6297],
  "Sapa": [22.3364, 103.8438],
  "Hải Phòng": [20.8449, 106.6881],
  "Cần Thơ": [10.0452, 105.7469],
  "Huế": [16.4637, 107.5909],
  "Đà Nẵng": [16.0544, 108.2022],
  "Nha Trang": [12.2388, 109.1969],
  "Đà Lạt": [11.9404, 108.4583],
  // Thêm các thành phố mới
  "Phan Thiết": [10.9804, 108.2558],
  "Vinh": [18.6790, 105.6819],
  "Vũng Tàu": [10.3460, 107.0843],
  "Hạ Long": [20.9734, 107.0299],
  "Thanh Hóa": [19.8066, 105.7852],
  "Quảng Ngãi": [15.1213, 108.8061],
  "Biên Hòa": [10.9574, 106.8426],
  "Rạch Giá": [10.0123, 105.0921],
  "Quy Nhơn": [13.7695, 109.2105],
  "Bà Rịa": [10.5014, 107.1686],
  "Bạc Liêu": [9.2853, 105.7234],
  "Buôn Ma Thuột": [12.6797, 108.0514],
  "Cam Ranh": [11.9214, 109.1591],
  "Cao Bằng": [22.6659, 106.2518],
  "Cẩm Phả": [21.0167, 107.2667],
  "Điện Biên Phủ": [21.3856, 103.0320],
  "Hà Đông": [20.9709, 105.7791],
  "Đồng Xoài": [11.5344, 106.8937],
  "Đồng Hới": [17.4825, 106.6005],
  "Hà Tĩnh": [18.3560, 105.8877],
  "Hải Dương": [20.9399, 106.3309],
  "Hòa Bình": [20.8132, 105.3382],
  "Hội An": [15.8800, 108.3380],
  "Lai Châu": [22.3964, 103.4591],
  "Lạng Sơn": [21.8534, 106.7614],
  "Lào Cai": [22.4856, 103.9754],
  "Long Xuyên": [10.3860, 105.4380],
  "Mỹ Tho": [10.3602, 106.3557],
  "Ninh Bình": [20.2579, 105.9744],
  "Phan Rang - Tháp Chàm": [11.5639, 108.9880],
  "Pleiku": [13.9833, 108.0000],
  "Sa Đéc": [10.2931, 105.7548],
  "Sóc Trăng": [9.6037, 105.9699],
  "Tam Điệp": [20.1567, 105.9500],
  "Tân An": [10.5347, 106.4042],
  "Thái Bình": [20.4500, 106.3333],
  "Thái Nguyên": [21.5944, 105.8472],
  "Thủ Dầu Một": [10.9804, 106.6519],
  "Tuy Hòa": [13.0967, 109.3000],
  "Tuyên Quang": [21.8236, 105.2181],
  "Uông Bí": [21.0350, 106.7700]
};

delete (L.Icon.Default.prototype as IconWithGetIconUrl)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

// Custom control type cho nút toàn màn hình
class FullscreenControl extends L.Control {
  onAdd(map: L.Map) {
    const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    button.innerHTML = '⛶';
    button.style.fontSize = '22px';
    button.style.padding = '5px 8px';
    button.style.cursor = 'pointer';
    button.style.backgroundColor = 'white';
    button.onclick = () => {
      if (!document.fullscreenElement) {
        map.getContainer().requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };
    return button;
  }
}

// Lấy màu dựa trên AQI (Theo tiêu chuẩn của IQAir với màu sắc đúng chuẩn)
const getAQIColor = (aqi: number) => {
  if (aqi >= 300) return '#A917E8'; // Tím đậm
  if (aqi >= 200) return '#984EA3'; // Tím
  if (aqi >= 150) return '#FF0000'; // Đỏ
  if (aqi >= 100) return '#FF7E00'; // Cam
  if (aqi >= 50) return '#FFFF00'; // Vàng
  return '#00E400'; // Xanh lá
};

// Lấy mô tả chất lượng không khí theo AQI
const getAQIDescription = (aqi: number) => {
  if (aqi >= 300) return 'Nguy hiểm';
  if (aqi >= 200) return 'Rất không lành mạnh';
  if (aqi >= 150) return 'Không lành mạnh';
  if (aqi >= 100) return 'Không lành mạnh cho nhóm nhạy cảm';
  if (aqi >= 50) return 'Trung bình';
  return 'Tốt';
};

// Component cho thanh chỉ số chất lượng không khí
export const AQILegend = () => {
  const levels = [
    { color: '#00E400', text: 'Tốt' },
    { color: '#FFFF00', text: 'Trung bình' },
    { color: '#FF7E00', text: 'Không lành mạnh cho nhóm nhạy cảm' },
    { color: '#FF0000', text: 'Không lành mạnh' },
    { color: '#984EA3', text: 'Rất không lành mạnh' },
    { color: '#A917E8', text: 'Nguy hiểm' },
  ];

  return (
    <div className="flex items-center justify-center mt-2 flex-wrap bg-white border-t border-gray-200 py-3 px-4 text-sm font-medium rounded-b-lg shadow-sm">
      {levels.map((level, index) => (
        <div key={index} className="flex items-center mx-3 my-1">
          <span 
            className="inline-block w-4 h-4 rounded-full mr-1" 
            style={{ backgroundColor: level.color }}
          ></span>
          <span className="text-black">{level.text}</span>
        </div>
      ))}
    </div>
  );
};

export const AQIMap = ({ cities }: AQIMapProps) => {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const [error, setError] = useState<string>('');
  const [activeCityIndex, setActiveCityIndex] = useState<number | null>(null);

  // Khởi tạo bản đồ
  useEffect(() => {
    if (!mapContainer.current) return;

    // Kiểm tra nếu map đã được khởi tạo thì return để tránh tạo nhiều lần
    if (map.current) return;

    try {
      // Khởi tạo map với các tùy chọn tối ưu
      map.current = L.map(mapContainer.current, {
        scrollWheelZoom: true,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        keyboard: true,
        doubleClickZoom: true,
        boxZoom: true,
        minZoom: 5,
        maxZoom: 18,
        preferCanvas: true
      }).setView([16.0, 106.0], 6);

      // Dùng basemap style giống hệt IQAir
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://www.arcgis.com/">Esri</a>'
      }).addTo(map.current);

      // Thêm attribution vào góc dưới bên phải
      L.control.attribution({
        position: 'bottomright',
        prefix: '© AQI Vietnam'
      }).addTo(map.current);

      // Thêm layer bản đồ vệ tinh
      const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri'
      });

      // Thêm layer bản đồ tối
      const dark = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri'
      });

      // Tạo layer group cho markers
      markersLayer.current = L.layerGroup().addTo(map.current);

      // Thêm control để chuyển đổi layer
      const baseMaps = {
        "Mặc định": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri'
        }),
        "Vệ tinh": satellite,
        "Tối": dark
      };

      L.control.layers(baseMaps, {}, {
        position: 'topright'
      }).addTo(map.current);

      // Thêm control zoom ở góc dưới bên phải
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map.current);

      // Thêm nút toàn màn hình
      new FullscreenControl({ position: 'bottomright' }).addTo(map.current);

      // Xử lý lỗi khi chuột nằm ngoài map mà vẫn cố gắng drag
      const handleMouseOut = () => {
        if (map.current) {
          map.current.dragging.enable();
        }
      };

      // Thêm sự kiện xử lý khi chuột rời khỏi map
      mapContainer.current.addEventListener('mouseout', handleMouseOut);

      // Ngăn chuột phải mở context menu mặc định
      const handleContextMenu = (e: Event) => {
        e.preventDefault();
      };
      mapContainer.current.addEventListener('contextmenu', handleContextMenu);

      // Ngăn scroll trang khi đang tương tác với bản đồ
      const handleWheel = (e: WheelEvent) => {
        if (mapContainer.current?.contains(e.target as Node)) {
          e.stopPropagation();
        }
      };
      mapContainer.current.addEventListener('wheel', handleWheel);

      // Cleanup function để xóa map và các sự kiện khi component unmount
      return () => {
        if (mapContainer.current) {
          mapContainer.current.removeEventListener('mouseout', handleMouseOut);
          mapContainer.current.removeEventListener('contextmenu', handleContextMenu);
          mapContainer.current.removeEventListener('wheel', handleWheel);
        }
        
        if (map.current) {
          // Xóa các marker để tránh bị memory leak
          if (markersLayer.current) {
            markersLayer.current.clearLayers();
          }
          
          // Xóa map
          map.current.remove();
          map.current = null;
        }
      };
    } catch (err) {
      console.error("Lỗi khởi tạo bản đồ:", err);
      setError("Không thể tải bản đồ. Vui lòng làm mới trang.");
    }
  }, []);

  // Cập nhật markers khi cities thay đổi
  useEffect(() => {
    if (!map.current || !markersLayer.current) return;

    // Xóa tất cả markers hiện tại
    markersLayer.current.clearLayers();

    // Thêm markers cho các thành phố với màu sắc mới
    cities.forEach((city, index) => {
      const coordinates = CITY_COORDINATES[city.name];
      if (!coordinates) return;

      const color = getAQIColor(city.aqi);
      
      // Tạo vòng tròn theo kiểu IQAir - size nhỏ hơn và độ trong suốt cao hơn
      const circleSize = Math.max(10, Math.min(25, city.aqi / 7));
      const circle = L.circle([coordinates[0], coordinates[1]], {
        radius: circleSize * 1000,
        fillColor: color,
        fillOpacity: 0.2, // Độ trong suốt cao hơn
        stroke: true,
        color: color,
        weight: 0.8, // Viền mỏng hơn
        opacity: 0.6 // Độ đậm viền thấp hơn
      });
      
      // Tạo marker với văn bản để hiển thị AQI
      const iconHtml = `<div style="
        background-color: ${color}; 
        color: ${city.aqi >= 150 ? 'white' : (city.aqi >= 50 ? 'black' : 'white')}; 
        border-radius: 50%; 
        width: 44px; 
        height: 44px; 
        display: flex; 
        justify-content: center; 
        align-items: center;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        border: 2px solid white;
        transition: transform 0.2s ease;
        transform: scale(1);
      ">${city.aqi}</div>`;
      
      const customIcon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });
      
      const marker = L.marker([coordinates[0], coordinates[1]], {
        icon: customIcon,
        zIndexOffset: 1000
      });
      
      // Tạo popup với thông tin chi tiết
      const popupContent = `
        <div style="min-width: 220px; max-width: 260px; padding: 12px; font-family: Arial, sans-serif; background: white; border-radius: 6px;" class="city-popup" data-city-index="${index}">
          <div style="font-size: 15px; font-weight: bold; margin-bottom: 8px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 6px;">${city.name}</div>
          <div style="
            background-color: ${color};
            color: ${city.aqi >= 150 ? 'white' : (city.aqi >= 50 ? 'black' : 'white')};
            border-radius: 6px;
            padding: 6px 10px;
            margin-bottom: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          ">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="font-weight: 700; font-size: 11px; flex-shrink: 0; max-width: 80%;">CHẤT LƯỢNG KHÔNG KHÍ</div>
              <div style="font-size: 16px; font-weight: bold; margin-left: 4px; text-align: right;">${city.aqi}</div>
            </div>
          </div>
          <div style="color: #333; font-size: 12px; line-height: 1.5;">
            <div style="margin-bottom: 5px; display: flex; justify-content: space-between; padding: 2px 0;">
              <span>Chỉ số:</span>
              <span style="font-weight: 600;">AQI Việt Nam</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 2px 0;">
              <span>Tình trạng:</span>
              <span style="font-weight: 600; color: ${color};">${getAQIDescription(city.aqi)}</span>
            </div>
          </div>
        </div>
      `;
      
      const popup = L.popup({
        offset: [0, -20],
        closeButton: true,
        autoClose: false,
        className: 'custom-popup'
      }).setContent(popupContent);
      
      marker.bindPopup(popup);
      
      // Thêm sự kiện click cho marker
      marker.on('click', () => {
        setActiveCityIndex(index);
      });
      
      // Thêm vòng tròn và marker vào markersLayer
      circle.addTo(markersLayer.current!);
      marker.addTo(markersLayer.current!);
    });
    
    // Xử lý click vào popup để chuyển trang
    const popupClickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cityPopup = target.closest('.city-popup');
      
      if (cityPopup) {
        const cityIndex = cityPopup.getAttribute('data-city-index');
        if (cityIndex && !isNaN(Number(cityIndex))) {
          const city = cities[Number(cityIndex)];
          if (city) {
            router.push(`/city/${city.slug}`);
          }
        }
      }
    };
    
    // Thêm sự kiện click cho document để bắt sự kiện từ popup
    document.addEventListener('click', popupClickHandler);
    
    return () => {
      document.removeEventListener('click', popupClickHandler);
    };
  }, [cities, router]);

  // Hiển thị thông tin chi tiết khi chọn một thành phố
  useEffect(() => {
    if (activeCityIndex !== null && map.current && markersLayer.current) {
      const city = cities[activeCityIndex];
      map.current.setView([CITY_COORDINATES[city.name][0], CITY_COORDINATES[city.name][1]], 10, {
        animate: true
      });
    }
  }, [activeCityIndex]);

  return (
    <div 
      className="p-0 relative" 
      style={{ touchAction: 'none' }}
    >
      <div 
        className="relative w-full h-[450px] rounded-t-lg overflow-hidden shadow border border-gray-100"
        style={{ isolation: 'isolate', backgroundColor: '#e4e7ed' }}
      >
        {error && (
          <div className="absolute top-4 left-4 right-4 z-[1000] bg-red-500 text-white px-4 py-2 rounded shadow-lg">
            {error}
            <button 
              className="ml-2 text-white hover:text-gray-200"
              onClick={() => setError('')}
            >
              ✕
            </button>
          </div>
        )}
        <div 
          ref={mapContainer} 
          className="absolute inset-0 !z-0 cursor-grab active:cursor-grabbing" 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ isolation: 'isolate' }}
        />
      </div>
      <AQILegend />
    </div>
  );
}; 
