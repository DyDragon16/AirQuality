import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface FireLocation {
  location: [number, number];
  intensity: number;
  type: string;
}

interface APIFireData {
  location?: number[];
  intensity?: number;
  type?: string;
}

// Fix icon paths
interface ExtendedIcon extends L.Icon.Default {
  _getIconUrl?: string;
}

delete (L.Icon.Default.prototype as ExtendedIcon)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

// Custom control type
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

export const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [fires, setFires] = useState<FireLocation[]>([]);
  const [error, setError] = useState<string>('');
  const markersLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Khởi tạo map
      map.current = L.map(mapContainer.current).setView([10.84863, 106.77209], 10);

      // Thêm layer bản đồ chính
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.current);

      // Thêm layer bản đồ vệ tinh
      const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri'
      });

      // Thêm layer bản đồ tối
      const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB'
      });

      // Tạo layer group cho markers
      markersLayer.current = L.layerGroup().addTo(map.current);

      // Thêm control để chuyển đổi layer
      const baseMaps = {
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }),
        "Vệ tinh": satellite,
        "Tối": dark
      };

      L.control.layers(baseMaps).addTo(map.current);

      // Thêm control zoom
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map.current);

      // Thêm nút toàn màn hình
      new FullscreenControl({ position: 'bottomright' }).addTo(map.current);

    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Không thể khởi tạo bản đồ.');
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  // Fetch dữ liệu cháy rừng
  useEffect(() => {
    const fetchFireData = async () => {
      try {
        const params = new URLSearchParams({
          bbox: '80,0,140,40',
          zoomLevel: '5',
          getKeyFires: 'true',
          'units.temperature': 'celsius',
          'units.distance': 'kilometer',
          'units.pressure': 'millibar',
          'units.system': 'metric',
          AQI: 'US',
          language: 'vi'
        });

        const apiUrl = `/api/proxy/fires?${params}`;
        console.log('Fetching from:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        
        if (!Array.isArray(data)) {
          throw new Error('Data is not an array');
        }

        const validFires = data
          .filter((item: APIFireData) => 
            item.location && 
            Array.isArray(item.location) && 
            item.location.length === 2 &&
            typeof item.intensity === 'number'
          )
          .map((item: APIFireData) => ({
            location: item.location as [number, number],
            intensity: item.intensity || 1,
            type: item.type || 'fire'
          }));

        console.log('Processed fires:', validFires);
        setFires(validFires);
        setError('');
      } catch (error) {
        console.error('Error fetching fire data:', error);
        setError('Không thể tải dữ liệu cháy rừng. Vui lòng thử lại sau.');
      }
    };

    fetchFireData();
    const interval = setInterval(fetchFireData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Thêm dữ liệu cháy rừng vào map
  useEffect(() => {
    if (!map.current || !markersLayer.current) return;

    try {
      // Xóa markers cũ
      markersLayer.current.clearLayers();

      // Thêm markers mới
      fires.forEach(fire => {
        const radius = Math.max(4, Math.min(24, fire.intensity / 4));
        const color = fire.type === 'keyWildFire' ? '#ff0000' : 
          fire.intensity > 50 ? '#bd0026' :
          fire.intensity > 25 ? '#fd8d3c' : '#ffffb2';

        const circle = L.circleMarker([fire.location[1], fire.location[0]], {
          radius: radius,
          fillColor: color,
          color: fire.type === 'keyWildFire' ? '#ffffff' : color,
          weight: fire.type === 'keyWildFire' ? 2 : 1,
          opacity: 1,
          fillOpacity: 0.8
        });

        circle.bindPopup(`
          <div class="text-sm">
            <div class="font-bold mb-1">Thông tin điểm cháy</div>
            <div>Cường độ: ${fire.intensity}</div>
            <div>Loại: ${fire.type === 'keyWildFire' ? 'Cháy rừng chính' : 'Điểm cháy thường'}</div>
            <div>Vị trí: ${fire.location[1]}, ${fire.location[0]}</div>
          </div>
        `);

        circle.addTo(markersLayer.current!);
      });
    } catch (error) {
      console.error('Error adding fire markers:', error);
      setError('Không thể hiển thị dữ liệu cháy rừng trên bản đồ.');
    }
  }, [fires]);

  return (
    <div className="p-4">
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg border border-gray-200">
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
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
    </div>
  );
}; 