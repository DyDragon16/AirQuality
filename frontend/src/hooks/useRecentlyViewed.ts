"use client";

import { useState, useEffect } from "react";
import { CITY_DATA } from "@/constants/cities";
import { useAuthContext } from "@/context/AuthContext";

export interface RecentlyViewedCity {
  id: string;
  name: string;
  slug: string;
  viewedAt: number; // Unix timestamp
  formattedTime?: string;
}

const STORAGE_KEY = "recentlyViewedCities";
const MAX_ITEMS = 10; // Số lượng thành phố tối đa được lưu

export const useRecentlyViewed = () => {
  const [recentCities, setRecentCities] = useState<RecentlyViewedCity[]>([]);
  const { isAuthenticated } = useAuthContext();

  // Lấy danh sách thành phố từ localStorage khi component được mount hoặc trạng thái đăng nhập thay đổi
  useEffect(() => {
    try {
      const storedCities = localStorage.getItem(STORAGE_KEY);
      if (storedCities) {
        const parsed = JSON.parse(storedCities) as RecentlyViewedCity[];
        
        // Tính thời gian đã xem tương đối
        const citiesWithFormattedTime = parsed.map(city => ({
          ...city,
          formattedTime: getTimeAgo(city.viewedAt)
        }));
        
        setRecentCities(citiesWithFormattedTime);
      }
    } catch (error) {
      console.error("Lỗi khi đọc thành phố đã xem từ localStorage:", error);
    }
  }, [isAuthenticated]);

  // Tự động làm mới định dạng thời gian mỗi phút
  useEffect(() => {
    // Nếu không có thành phố, không cần làm mới
    if (recentCities.length === 0) return;

    // Thiết lập interval để làm mới mỗi phút
    const intervalId = setInterval(() => {
      refreshTimeFormatting();
    }, 60000); // 60000ms = 1 phút

    // Cleanup interval khi component unmount
    return () => clearInterval(intervalId);
  }, [recentCities.length]);

  // Thêm thành phố vào danh sách đã xem
  const addRecentCity = (cityId: string) => {
    // Chỉ lưu lịch sử khi người dùng đã đăng nhập
    if (!isAuthenticated) return;

    // Tìm thông tin thành phố từ CITY_DATA
    const cityEntry = Object.entries(CITY_DATA).find(
      ([, cityData]) => cityData.id === cityId
    );

    if (!cityEntry) return; // Không tìm thấy thành phố

    const cityName = cityEntry[0];
    const cityData = cityEntry[1];
    const now = Date.now();

    setRecentCities(prev => {
      // Xóa thành phố này nếu đã tồn tại trong danh sách
      const filtered = prev.filter(city => city.id !== cityId);
      
      // Thêm thành phố vào đầu danh sách
      const newCity: RecentlyViewedCity = {
        id: cityId,
        name: cityName,
        slug: cityData.slug,
        viewedAt: now,
        formattedTime: "Vừa xong"
      };

      // Giới hạn số lượng thành phố
      const updatedList = [newCity, ...filtered].slice(0, MAX_ITEMS);
      
      // Lưu vào localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      } catch (error) {
        console.error("Lỗi khi lưu thành phố đã xem vào localStorage:", error);
      }

      return updatedList;
    });
  };

  // Xóa tất cả thành phố đã xem
  const clearRecentCities = () => {
    setRecentCities([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Lỗi khi xóa thành phố đã xem khỏi localStorage:", error);
    }
  };

  // Cập nhật định dạng thời gian
  const refreshTimeFormatting = () => {
    setRecentCities(prev => 
      prev.map(city => ({
        ...city,
        formattedTime: getTimeAgo(city.viewedAt)
      }))
    );
  };

  // Helper function để định dạng thời gian
  const getTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} năm trước`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} tháng trước`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} ngày trước`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} giờ trước`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} phút trước`;
    
    return "Vừa xong";
  };

  return {
    recentCities,
    addRecentCity,
    clearRecentCities,
    refreshTimeFormatting
  };
};

export default useRecentlyViewed; 