"use client";

import { Navbar } from "@/layout/Navbar";
import Footer from "@/layout/Footer";
import { useWeatherData } from "@/hooks/useWeatherData";
import { CITY_DATA } from "@/constants/cities";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getAQIColor } from "@/utils/aqi"; 

// Import Map động để tránh lỗi window is not defined
const DynamicMap = dynamic(() => import("@/components/AQIMap").then(mod => mod.AQIMap), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[450px] bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Đang tải bản đồ...</p>
      </div>
    </div>
  ),
});

interface CityAQIData {
  name: string;
  aqi: number;
  slug: string;
  flag?: string;
  region?: string;
}

export default function AirQualityPage() {
  const [cities, setCities] = useState<CityAQIData[]>([]);
  const [loading, setLoading] = useState(true);

  // Create hooks for each city - các thành phố hiển thị trên trang chủ
  const hanoiWeather = useWeatherData(CITY_DATA["Hà Nội"].endpoint);
  const hcmWeather = useWeatherData(CITY_DATA["Hồ Chí Minh"].endpoint);
  const danangWeather = useWeatherData(CITY_DATA["Đà Nẵng"].endpoint);
  const haiphongWeather = useWeatherData(CITY_DATA["Hải Phòng"].endpoint);
  const canthoWeather = useWeatherData(CITY_DATA["Cần Thơ"].endpoint);
  const hueWeather = useWeatherData(CITY_DATA["Huế"].endpoint);
  const nhatrangWeather = useWeatherData(CITY_DATA["Nha Trang"].endpoint);
  const dalatWeather = useWeatherData(CITY_DATA["Đà Lạt"].endpoint);
  const sapaWeather = useWeatherData(CITY_DATA["Sapa"].endpoint);
  
  // Hooks cho các thành phố mới
  const phanthietWeather = useWeatherData(CITY_DATA["Phan Thiết"].endpoint);
  const vinhWeather = useWeatherData(CITY_DATA["Vinh"].endpoint);
  const vungtauWeather = useWeatherData(CITY_DATA["Vũng Tàu"].endpoint);
  const halongWeather = useWeatherData(CITY_DATA["Hạ Long"].endpoint);
  const thanhhoaWeather = useWeatherData(CITY_DATA["Thanh Hóa"].endpoint);
  const quangngaiWeather = useWeatherData(CITY_DATA["Quảng Ngãi"].endpoint);
  const bienhoaWeather = useWeatherData(CITY_DATA["Biên Hòa"].endpoint);
  const rachgiaWeather = useWeatherData(CITY_DATA["Rạch Giá"].endpoint);
  const quynhonWeather = useWeatherData(CITY_DATA["Quy Nhơn"].endpoint);
  const bariaWeather = useWeatherData(CITY_DATA["Bà Rịa"].endpoint);
  const baclieuWeather = useWeatherData(CITY_DATA["Bạc Liêu"].endpoint);
  const buonmathuotWeather = useWeatherData(CITY_DATA["Buôn Ma Thuột"].endpoint);
  const camranhWeather = useWeatherData(CITY_DATA["Cam Ranh"].endpoint);
  const caobangWeather = useWeatherData(CITY_DATA["Cao Bằng"].endpoint);
  const camphaWeather = useWeatherData(CITY_DATA["Cẩm Phả"].endpoint);
  const dienbienphuWeather = useWeatherData(CITY_DATA["Điện Biên Phủ"].endpoint);
  const hadongWeather = useWeatherData(CITY_DATA["Hà Đông"].endpoint);
  const dongxoaiWeather = useWeatherData(CITY_DATA["Đồng Xoài"].endpoint);
  const donghoiWeather = useWeatherData(CITY_DATA["Đồng Hới"].endpoint);
  const hatinhWeather = useWeatherData(CITY_DATA["Hà Tĩnh"].endpoint);
  const haiduongWeather = useWeatherData(CITY_DATA["Hải Dương"].endpoint);
  const hoabinhWeather = useWeatherData(CITY_DATA["Hòa Bình"].endpoint);
  const hoianWeather = useWeatherData(CITY_DATA["Hội An"].endpoint);
  const laichauWeather = useWeatherData(CITY_DATA["Lai Châu"].endpoint);
  const langsonWeather = useWeatherData(CITY_DATA["Lạng Sơn"].endpoint);
  const laocaiWeather = useWeatherData(CITY_DATA["Lào Cai"].endpoint);
  const longxuyenWeather = useWeatherData(CITY_DATA["Long Xuyên"].endpoint);
  const mythoWeather = useWeatherData(CITY_DATA["Mỹ Tho"].endpoint);
  const ninhbinhWeather = useWeatherData(CITY_DATA["Ninh Bình"].endpoint);
  const phanrangWeather = useWeatherData(CITY_DATA["Phan Rang - Tháp Chàm"].endpoint);
  const pleikuWeather = useWeatherData(CITY_DATA["Pleiku"].endpoint);
  const sadecWeather = useWeatherData(CITY_DATA["Sa Đéc"].endpoint);
  const soctrangWeather = useWeatherData(CITY_DATA["Sóc Trăng"].endpoint);
  const tamdiepWeather = useWeatherData(CITY_DATA["Tam Điệp"].endpoint);
  const tananWeather = useWeatherData(CITY_DATA["Tân An"].endpoint);
  const thaibinhWeather = useWeatherData(CITY_DATA["Thái Bình"].endpoint);
  const thainguyenWeather = useWeatherData(CITY_DATA["Thái Nguyên"].endpoint);
  const thudaumotWeather = useWeatherData(CITY_DATA["Thủ Dầu Một"].endpoint);
  const tuyhoaWeather = useWeatherData(CITY_DATA["Tuy Hòa"].endpoint);
  const tuyenquangWeather = useWeatherData(CITY_DATA["Tuyên Quang"].endpoint);
  const uongbiWeather = useWeatherData(CITY_DATA["Uông Bí"].endpoint);

  useEffect(() => {
    // Kiểm tra khi tất cả các thành phố trên trang chủ đã có dữ liệu
    const mainCitiesLoaded = 
      !hanoiWeather.isLoading && hanoiWeather.weatherData?.current &&
      !hcmWeather.isLoading && hcmWeather.weatherData?.current &&
      !danangWeather.isLoading && danangWeather.weatherData?.current &&
      !haiphongWeather.isLoading && haiphongWeather.weatherData?.current &&
      !canthoWeather.isLoading && canthoWeather.weatherData?.current &&
      !hueWeather.isLoading && hueWeather.weatherData?.current &&
      !nhatrangWeather.isLoading && nhatrangWeather.weatherData?.current &&
      !dalatWeather.isLoading && dalatWeather.weatherData?.current &&
      !sapaWeather.isLoading && sapaWeather.weatherData?.current;

    if (mainCitiesLoaded) {
      // Mảng dữ liệu tất cả các thành phố, bắt đầu với các thành phố chính
      const allCitiesData = [
        { 
          name: "Hà Nội", 
          aqi: hanoiWeather.weatherData?.current?.aqi || 0, 
          slug: CITY_DATA["Hà Nội"].slug, 
          region: CITY_DATA["Hà Nội"].region 
        },
        { 
          name: "Sapa", 
          aqi: sapaWeather.weatherData?.current?.aqi || 0, 
          slug: CITY_DATA["Sapa"].slug, 
          region: CITY_DATA["Sapa"].region 
        },
        { 
          name: "Hồ Chí Minh", 
          aqi: hcmWeather.weatherData?.current?.aqi || 0, 
          slug: CITY_DATA["Hồ Chí Minh"].slug, 
          region: CITY_DATA["Hồ Chí Minh"].region 
        },
        { 
          name: "Hải Phòng", 
          aqi: haiphongWeather.weatherData?.current?.aqi || 0, 
          slug: CITY_DATA["Hải Phòng"].slug, 
          region: CITY_DATA["Hải Phòng"].region 
        },
        { 
          name: "Cần Thơ", 
          aqi: canthoWeather.weatherData?.current?.aqi || 0, 
          slug: CITY_DATA["Cần Thơ"].slug, 
          region: CITY_DATA["Cần Thơ"].region 
        },
        { 
          name: "Huế", 
          aqi: hueWeather.weatherData?.current?.aqi || 0, 
          slug: CITY_DATA["Huế"].slug, 
          region: CITY_DATA["Huế"].region 
        },
        { 
          name: "Đà Nẵng", 
          aqi: danangWeather.weatherData?.current?.aqi || 0, 
          slug: CITY_DATA["Đà Nẵng"].slug, 
          region: CITY_DATA["Đà Nẵng"].region 
        },
        { 
          name: "Nha Trang", 
          aqi: nhatrangWeather.weatherData?.current?.aqi || 0, 
          slug: CITY_DATA["Nha Trang"].slug, 
          region: CITY_DATA["Nha Trang"].region 
        },
        { 
          name: "Đà Lạt", 
          aqi: dalatWeather.weatherData?.current?.aqi || 0, 
          slug: CITY_DATA["Đà Lạt"].slug, 
          region: CITY_DATA["Đà Lạt"].region 
        }
      ];

      // Kiểm tra và thêm từng thành phố mới nếu có dữ liệu
      // Phan Thiết
      if (!phanthietWeather.isLoading && phanthietWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Phan Thiết", 
          aqi: phanthietWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Phan Thiết"].slug, 
          region: CITY_DATA["Phan Thiết"].region 
        });
      }
      
      // Vinh
      if (!vinhWeather.isLoading && vinhWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Vinh", 
          aqi: vinhWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Vinh"].slug, 
          region: CITY_DATA["Vinh"].region 
        });
      }
      
      // Vũng Tàu
      if (!vungtauWeather.isLoading && vungtauWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Vũng Tàu", 
          aqi: vungtauWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Vũng Tàu"].slug, 
          region: CITY_DATA["Vũng Tàu"].region 
        });
      }
      
      // Hạ Long
      if (!halongWeather.isLoading && halongWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Hạ Long", 
          aqi: halongWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Hạ Long"].slug, 
          region: CITY_DATA["Hạ Long"].region 
        });
      }
      
      // Thanh Hóa
      if (!thanhhoaWeather.isLoading && thanhhoaWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Thanh Hóa", 
          aqi: thanhhoaWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Thanh Hóa"].slug, 
          region: CITY_DATA["Thanh Hóa"].region 
        });
      }
      
      // Quảng Ngãi
      if (!quangngaiWeather.isLoading && quangngaiWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Quảng Ngãi", 
          aqi: quangngaiWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Quảng Ngãi"].slug, 
          region: CITY_DATA["Quảng Ngãi"].region 
        });
      }
      
      // Biên Hòa
      if (!bienhoaWeather.isLoading && bienhoaWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Biên Hòa", 
          aqi: bienhoaWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Biên Hòa"].slug, 
          region: CITY_DATA["Biên Hòa"].region 
        });
      }
      
      // Rạch Giá
      if (!rachgiaWeather.isLoading && rachgiaWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Rạch Giá", 
          aqi: rachgiaWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Rạch Giá"].slug, 
          region: CITY_DATA["Rạch Giá"].region 
        });
      }
      
      // Quy Nhơn
      if (!quynhonWeather.isLoading && quynhonWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Quy Nhơn", 
          aqi: quynhonWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Quy Nhơn"].slug, 
          region: CITY_DATA["Quy Nhơn"].region 
        });
      }
      
      // Bà Rịa
      if (!bariaWeather.isLoading && bariaWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Bà Rịa", 
          aqi: bariaWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Bà Rịa"].slug, 
          region: CITY_DATA["Bà Rịa"].region 
        });
      }
      
      // Bạc Liêu
      if (!baclieuWeather.isLoading && baclieuWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Bạc Liêu", 
          aqi: baclieuWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Bạc Liêu"].slug, 
          region: CITY_DATA["Bạc Liêu"].region 
        });
      }
      
      // Buôn Ma Thuột
      if (!buonmathuotWeather.isLoading && buonmathuotWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Buôn Ma Thuột", 
          aqi: buonmathuotWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Buôn Ma Thuột"].slug, 
          region: CITY_DATA["Buôn Ma Thuột"].region 
        });
      }
      
      // Cam Ranh
      if (!camranhWeather.isLoading && camranhWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Cam Ranh", 
          aqi: camranhWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Cam Ranh"].slug, 
          region: CITY_DATA["Cam Ranh"].region 
        });
      }
      
      // Cao Bằng
      if (!caobangWeather.isLoading && caobangWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Cao Bằng", 
          aqi: caobangWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Cao Bằng"].slug, 
          region: CITY_DATA["Cao Bằng"].region 
        });
      }
      
      // Cẩm Phả
      if (!camphaWeather.isLoading && camphaWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Cẩm Phả", 
          aqi: camphaWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Cẩm Phả"].slug, 
          region: CITY_DATA["Cẩm Phả"].region 
        });
      }
      
      // Điện Biên Phủ
      if (!dienbienphuWeather.isLoading && dienbienphuWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Điện Biên Phủ", 
          aqi: dienbienphuWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Điện Biên Phủ"].slug, 
          region: CITY_DATA["Điện Biên Phủ"].region 
        });
      }
      
      // Hà Đông
      if (!hadongWeather.isLoading && hadongWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Hà Đông", 
          aqi: hadongWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Hà Đông"].slug, 
          region: CITY_DATA["Hà Đông"].region 
        });
      }
      
      // Đồng Xoài
      if (!dongxoaiWeather.isLoading && dongxoaiWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Đồng Xoài", 
          aqi: dongxoaiWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Đồng Xoài"].slug, 
          region: CITY_DATA["Đồng Xoài"].region 
        });
      }
      
      // Đồng Hới
      if (!donghoiWeather.isLoading && donghoiWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Đồng Hới", 
          aqi: donghoiWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Đồng Hới"].slug, 
          region: CITY_DATA["Đồng Hới"].region 
        });
      }
      
      // Hà Tĩnh
      if (!hatinhWeather.isLoading && hatinhWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Hà Tĩnh", 
          aqi: hatinhWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Hà Tĩnh"].slug, 
          region: CITY_DATA["Hà Tĩnh"].region 
        });
      }
      
      // Hải Dương
      if (!haiduongWeather.isLoading && haiduongWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Hải Dương", 
          aqi: haiduongWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Hải Dương"].slug, 
          region: CITY_DATA["Hải Dương"].region 
        });
      }
      
      // Hòa Bình
      if (!hoabinhWeather.isLoading && hoabinhWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Hòa Bình", 
          aqi: hoabinhWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Hòa Bình"].slug, 
          region: CITY_DATA["Hòa Bình"].region 
        });
      }
      
      // Hội An
      if (!hoianWeather.isLoading && hoianWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Hội An", 
          aqi: hoianWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Hội An"].slug, 
          region: CITY_DATA["Hội An"].region 
        });
      }
      
      // Lai Châu
      if (!laichauWeather.isLoading && laichauWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Lai Châu", 
          aqi: laichauWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Lai Châu"].slug, 
          region: CITY_DATA["Lai Châu"].region 
        });
      }
      
      // Lạng Sơn
      if (!langsonWeather.isLoading && langsonWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Lạng Sơn", 
          aqi: langsonWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Lạng Sơn"].slug, 
          region: CITY_DATA["Lạng Sơn"].region 
        });
      }
      
      // Lào Cai
      if (!laocaiWeather.isLoading && laocaiWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Lào Cai", 
          aqi: laocaiWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Lào Cai"].slug, 
          region: CITY_DATA["Lào Cai"].region 
        });
      }
      
      // Long Xuyên
      if (!longxuyenWeather.isLoading && longxuyenWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Long Xuyên", 
          aqi: longxuyenWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Long Xuyên"].slug, 
          region: CITY_DATA["Long Xuyên"].region 
        });
      }
      
      // Mỹ Tho
      if (!mythoWeather.isLoading && mythoWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Mỹ Tho", 
          aqi: mythoWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Mỹ Tho"].slug, 
          region: CITY_DATA["Mỹ Tho"].region 
        });
      }
      
      // Ninh Bình
      if (!ninhbinhWeather.isLoading && ninhbinhWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Ninh Bình", 
          aqi: ninhbinhWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Ninh Bình"].slug, 
          region: CITY_DATA["Ninh Bình"].region 
        });
      }
      
      // Phan Rang - Tháp Chàm
      if (!phanrangWeather.isLoading && phanrangWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Phan Rang - Tháp Chàm", 
          aqi: phanrangWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Phan Rang - Tháp Chàm"].slug, 
          region: CITY_DATA["Phan Rang - Tháp Chàm"].region 
        });
      }
      
      // Pleiku
      if (!pleikuWeather.isLoading && pleikuWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Pleiku", 
          aqi: pleikuWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Pleiku"].slug, 
          region: CITY_DATA["Pleiku"].region 
        });
      }
      
      // Sa Đéc
      if (!sadecWeather.isLoading && sadecWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Sa Đéc", 
          aqi: sadecWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Sa Đéc"].slug, 
          region: CITY_DATA["Sa Đéc"].region 
        });
      }
      
      // Sóc Trăng
      if (!soctrangWeather.isLoading && soctrangWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Sóc Trăng", 
          aqi: soctrangWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Sóc Trăng"].slug, 
          region: CITY_DATA["Sóc Trăng"].region 
        });
      }
      
      // Tam Điệp
      if (!tamdiepWeather.isLoading && tamdiepWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Tam Điệp", 
          aqi: tamdiepWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Tam Điệp"].slug, 
          region: CITY_DATA["Tam Điệp"].region 
        });
      }
      
      // Tân An
      if (!tananWeather.isLoading && tananWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Tân An", 
          aqi: tananWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Tân An"].slug, 
          region: CITY_DATA["Tân An"].region 
        });
      }
      
      // Thái Bình
      if (!thaibinhWeather.isLoading && thaibinhWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Thái Bình", 
          aqi: thaibinhWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Thái Bình"].slug, 
          region: CITY_DATA["Thái Bình"].region 
        });
      }
      
      // Thái Nguyên
      if (!thainguyenWeather.isLoading && thainguyenWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Thái Nguyên", 
          aqi: thainguyenWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Thái Nguyên"].slug, 
          region: CITY_DATA["Thái Nguyên"].region 
        });
      }
      
      // Thủ Dầu Một
      if (!thudaumotWeather.isLoading && thudaumotWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Thủ Dầu Một", 
          aqi: thudaumotWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Thủ Dầu Một"].slug, 
          region: CITY_DATA["Thủ Dầu Một"].region 
        });
      }
      
      // Tuy Hòa
      if (!tuyhoaWeather.isLoading && tuyhoaWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Tuy Hòa", 
          aqi: tuyhoaWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Tuy Hòa"].slug, 
          region: CITY_DATA["Tuy Hòa"].region 
        });
      }
      
      // Tuyên Quang
      if (!tuyenquangWeather.isLoading && tuyenquangWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Tuyên Quang", 
          aqi: tuyenquangWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Tuyên Quang"].slug, 
          region: CITY_DATA["Tuyên Quang"].region 
        });
      }
      
      // Uông Bí
      if (!uongbiWeather.isLoading && uongbiWeather.weatherData?.current) {
        allCitiesData.push({ 
          name: "Uông Bí", 
          aqi: uongbiWeather.weatherData.current.aqi || 0, 
          slug: CITY_DATA["Uông Bí"].slug, 
          region: CITY_DATA["Uông Bí"].region 
        });
      }

      // Sắp xếp các thành phố theo giá trị AQI từ cao đến thấp
      const sortedCities = allCitiesData.sort((a, b) => b.aqi - a.aqi);
      
      setCities(sortedCities);
      setLoading(false);
    }
  }, [
    // Dependencies cho các thành phố chính
    hanoiWeather.isLoading, hanoiWeather.weatherData,
    hcmWeather.isLoading, hcmWeather.weatherData,
    danangWeather.isLoading, danangWeather.weatherData,
    haiphongWeather.isLoading, haiphongWeather.weatherData,
    canthoWeather.isLoading, canthoWeather.weatherData,
    hueWeather.isLoading, hueWeather.weatherData,
    nhatrangWeather.isLoading, nhatrangWeather.weatherData,
    dalatWeather.isLoading, dalatWeather.weatherData,
    sapaWeather.isLoading, sapaWeather.weatherData,
    
    // Dependencies cho các thành phố mới
    phanthietWeather.isLoading, phanthietWeather.weatherData,
    vinhWeather.isLoading, vinhWeather.weatherData,
    vungtauWeather.isLoading, vungtauWeather.weatherData,
    halongWeather.isLoading, halongWeather.weatherData,
    thanhhoaWeather.isLoading, thanhhoaWeather.weatherData,
    quangngaiWeather.isLoading, quangngaiWeather.weatherData,
    bienhoaWeather.isLoading, bienhoaWeather.weatherData,
    rachgiaWeather.isLoading, rachgiaWeather.weatherData,
    quynhonWeather.isLoading, quynhonWeather.weatherData,
    bariaWeather.isLoading, bariaWeather.weatherData,
    baclieuWeather.isLoading, baclieuWeather.weatherData,
    buonmathuotWeather.isLoading, buonmathuotWeather.weatherData,
    camranhWeather.isLoading, camranhWeather.weatherData,
    caobangWeather.isLoading, caobangWeather.weatherData,
    camphaWeather.isLoading, camphaWeather.weatherData,
    dienbienphuWeather.isLoading, dienbienphuWeather.weatherData,
    hadongWeather.isLoading, hadongWeather.weatherData,
    dongxoaiWeather.isLoading, dongxoaiWeather.weatherData,
    donghoiWeather.isLoading, donghoiWeather.weatherData,
    hatinhWeather.isLoading, hatinhWeather.weatherData,
    haiduongWeather.isLoading, haiduongWeather.weatherData,
    hoabinhWeather.isLoading, hoabinhWeather.weatherData,
    hoianWeather.isLoading, hoianWeather.weatherData,
    laichauWeather.isLoading, laichauWeather.weatherData,
    langsonWeather.isLoading, langsonWeather.weatherData,
    laocaiWeather.isLoading, laocaiWeather.weatherData,
    longxuyenWeather.isLoading, longxuyenWeather.weatherData,
    mythoWeather.isLoading, mythoWeather.weatherData,
    ninhbinhWeather.isLoading, ninhbinhWeather.weatherData,
    phanrangWeather.isLoading, phanrangWeather.weatherData,
    pleikuWeather.isLoading, pleikuWeather.weatherData,
    sadecWeather.isLoading, sadecWeather.weatherData,
    soctrangWeather.isLoading, soctrangWeather.weatherData,
    tamdiepWeather.isLoading, tamdiepWeather.weatherData,
    tananWeather.isLoading, tananWeather.weatherData,
    thaibinhWeather.isLoading, thaibinhWeather.weatherData,
    thainguyenWeather.isLoading, thainguyenWeather.weatherData,
    thudaumotWeather.isLoading, thudaumotWeather.weatherData,
    tuyhoaWeather.isLoading, tuyhoaWeather.weatherData,
    tuyenquangWeather.isLoading, tuyenquangWeather.weatherData,
    uongbiWeather.isLoading, uongbiWeather.weatherData
  ]);

  return (
    <div className="min-h-screen bg-[#f6f6f7] pt-14">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {/* Air Quality Map Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Bản đồ chất lượng không khí
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Theo dõi mức độ ô nhiễm không khí theo thời gian thực trên toàn Việt Nam
          </p>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <DynamicMap cities={cities} isLoading={loading} />
          </div>
        </div>

        {/* Ranking Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Most Polluted Cities */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 pb-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Xếp hạng trực tiếp thành phố ô nhiễm nhất
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Xếp hạng thành phố ô nhiễm nhất tại Việt Nam theo thời gian thực
              </p>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b-[0.5px] border-gray-100">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">#</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Thành phố</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">AQI* Mỹ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cities.slice(0, 6).map((city, index) => (
                        <tr key={`polluted-${city.slug}`} className="border-b-[0.5px] border-gray-100 last:border-b-0 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                          <td className="py-3 px-4">
                            <Link href={`/city/${city.slug}`} className="flex items-center group">
                              <span className="mr-2 w-5 h-3.5 flex items-center justify-center">
                                <img src="https://cdn.jsdelivr.net/npm/flag-icon-css@3.5.0/flags/4x3/vn.svg" alt="Vietnam" className="w-full h-full object-cover rounded-sm" />
                              </span>
                              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{city.name}</span>
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{
                                backgroundColor: getAQIColor(city.aqi),
                                color: city.aqi >= 150 || city.aqi < 50 ? 'white' : 'black'
                              }}>
                                {city.aqi}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="bg-red-50 p-4 border-t border-red-100 transition duration-200 hover:bg-red-100">
              <Link href={cities.length > 0 ? `/city/${cities[0]?.slug}` : '#'} className="block">
                <div className="flex items-center">
                  <div className="w-full">
                    <h3 className="text-base font-semibold text-gray-800">2025 thành phố ô nhiễm nhất tại Việt Nam</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">
                        {cities.length > 0 ? `${cities[0]?.name}, ${cities[0]?.region || 'Việt Nam'}` : "Đang tải..."}
                      </span>
                      {cities.length > 0 ? (
                        <span className="px-3 py-1 rounded-lg text-sm font-medium" style={{
                          backgroundColor: getAQIColor(cities[0]?.aqi),
                          color: cities[0]?.aqi >= 150 || cities[0]?.aqi < 50 ? 'white' : 'black'
                        }}>
                          {cities[0]?.aqi}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-500 text-white">
                          -
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Cleanest Cities */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 pb-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Xếp hạng trực tiếp thành phố sạch nhất
                </h2>
              <p className="text-sm text-gray-600 mb-3">
                Xếp hạng thành phố sạch nhất tại Việt Nam theo thời gian thực
                </p>
                {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b-[0.5px] border-gray-100">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">#</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Thành phố</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">AQI* Mỹ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...cities].sort((a, b) => a.aqi - b.aqi).slice(0, 6).map((city, index) => (
                        <tr key={`clean-${city.slug}`} className="border-b-[0.5px] border-gray-100 last:border-b-0 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                          <td className="py-3 px-4">
                            <Link href={`/city/${city.slug}`} className="flex items-center group">
                              <span className="mr-2 w-5 h-3.5 flex items-center justify-center">
                                <img src="https://cdn.jsdelivr.net/npm/flag-icon-css@3.5.0/flags/4x3/vn.svg" alt="Vietnam" className="w-full h-full object-cover rounded-sm" />
                              </span>
                              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{city.name}</span>
                          </Link>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{
                                backgroundColor: getAQIColor(city.aqi),
                                color: city.aqi >= 150 || city.aqi < 50 ? 'white' : 'black'
                              }}>
                                {city.aqi}
                        </span>
                      </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    </div>
                )}
            </div>

            <div className="bg-green-50 p-4 border-t border-green-100 transition duration-200 hover:bg-green-100">
              <Link href={cities.length > 0 ? `/city/${[...cities].sort((a, b) => a.aqi - b.aqi)[0]?.slug}` : '#'} className="block">
                <div className="flex items-center">
                  <div className="w-full">
                    <h3 className="text-base font-semibold text-gray-800">2025 thành phố sạch nhất tại Việt Nam</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">
                        {cities.length > 0 ? `${[...cities].sort((a, b) => a.aqi - b.aqi)[0]?.name}, ${[...cities].sort((a, b) => a.aqi - b.aqi)[0]?.region || 'Việt Nam'}` : "Đang tải..."}
                      </span>
                      {cities.length > 0 ? (
                        <span className="px-3 py-1 rounded-lg text-sm font-medium" style={{
                          backgroundColor: getAQIColor([...cities].sort((a, b) => a.aqi - b.aqi)[0]?.aqi),
                          color: [...cities].sort((a, b) => a.aqi - b.aqi)[0]?.aqi >= 150 || [...cities].sort((a, b) => a.aqi - b.aqi)[0]?.aqi < 50 ? 'white' : 'black'
                        }}>
                          {[...cities].sort((a, b) => a.aqi - b.aqi)[0]?.aqi}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-500 text-white">
                          -
                        </span>
                      )}
                    </div>
                  </div>
              </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}