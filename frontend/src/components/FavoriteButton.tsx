"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  cityId: string;
  className?: string;
  size?: number;
}

export const FavoriteButton = ({ cityId, className = "", size = 24 }: FavoriteButtonProps) => {
  const { user, isAuthenticated, addFavorite, removeFavorite } = useAuthContext();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Kiểm tra xem thành phố có trong danh sách yêu thích hay không
  useEffect(() => {
    if (user && user.favorites) {
      setIsFavorite(user.favorites.includes(cityId));
    }
  }, [user, cityId]);

  const toggleFavorite = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isFavorite) {
        await removeFavorite(cityId);
        setIsFavorite(false);
      } else {
        await addFavorite(cityId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái yêu thích:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`transition-all duration-300 ${className}`}
      aria-label={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
    >
      <Heart
        size={size}
        className={`transition-colors ${
          isFavorite 
            ? "fill-red-500 text-red-500" 
            : "fill-transparent text-gray-700 hover:text-red-500"
        } ${isLoading ? "opacity-50" : ""}`}
      />
    </button>
  );
};

export default FavoriteButton; 