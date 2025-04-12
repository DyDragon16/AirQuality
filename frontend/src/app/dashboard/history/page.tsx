"use client";

import { Navbar } from "@/layout/Navbar";
import Link from "next/link";
import { Clock, ChevronRight, Trash2, LogIn } from "lucide-react";
import useRecentlyViewed from "@/hooks/useRecentlyViewed";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export default function HistoryPage() {
  const { recentCities, clearRecentCities } = useRecentlyViewed();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { isAuthenticated } = useAuthContext();

  // Xử lý để chỉ render ở phía client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleViewCity = (slug: string) => {
    router.push(`/city/${slug}`);
  };

  const handleClearHistory = () => {
    clearRecentCities();
    setToastMessage("Lịch sử xem của bạn đã được xóa thành công");
    setToastVisible(true);
    
    // Ẩn toast sau 3 giây
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  if (!isClient) {
    return null; // Chờ cho đến khi chạy ở phía client
  }

  // Hiển thị thông báo đăng nhập nếu chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-24 max-w-7xl">
          <div className="rounded-lg bg-white shadow-md p-4">
            <div className="flex flex-col items-center justify-center p-12">
              <LogIn size={64} className="text-blue-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">Cần đăng nhập</h3>
              <p className="text-gray-500 text-center mb-6">
                Vui lòng đăng nhập để xem lịch sử các thành phố bạn đã truy cập
              </p>
              <button 
                onClick={() => router.push("/login")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Lịch sử xem</h1>
          {recentCities.length > 0 && (
            <button 
              className="flex items-center px-4 py-2 text-red-500 border border-red-200 rounded-md hover:bg-red-50 hover:text-red-600"
              onClick={handleClearHistory}
            >
              <Trash2 size={16} className="mr-2" />
              Xóa lịch sử
            </button>
          )}
        </div>

        {recentCities.length === 0 ? (
          <div className="rounded-lg bg-white shadow-md p-4">
            <div className="flex flex-col items-center justify-center p-12">
              <Clock size={64} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">Không có lịch sử xem</h3>
              <p className="text-gray-500 text-center mb-6">
                Các thành phố bạn xem sẽ xuất hiện ở đây để bạn có thể dễ dàng truy cập lại
              </p>
              <button 
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Khám phá thành phố
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-white shadow-md">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-medium text-gray-800">Thành phố đã xem gần đây</h2>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-gray-200">
                {recentCities.map((city) => (
                  <li key={city.id} className="py-4 transition-colors hover:bg-gray-50">
                    <button 
                      className="w-full text-left" 
                      onClick={() => handleViewCity(city.slug)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock size={20} className="text-blue-500 mr-3" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-800">{city.name}</h3>
                            <p className="text-sm text-gray-500">{city.formattedTime}</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-400" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Lịch sử xem chỉ được lưu trữ trên trình duyệt này và sẽ tự động xóa khi bạn đăng xuất
          </p>
        </div>

        {/* Toast Notification */}
        {toastVisible && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300">
            {toastMessage}
          </div>
        )}
      </div>
    </>
  );
} 