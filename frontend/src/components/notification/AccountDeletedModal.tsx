"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AccountDeletedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountDeletedModal = ({ isOpen, onClose }: AccountDeletedModalProps) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    if (!isOpen) return;
    
    // Bắt đầu đếm ngược khi modal hiển thị
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          redirectToLogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen]);
  
  const redirectToLogin = () => {
    router.push("/login");
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">Tài khoản đã bị xóa</h3>
          <p className="text-gray-600 text-center mb-6">
            Tài khoản của bạn không còn tồn tại hoặc đã bị xóa bởi quản trị viên. Bạn sẽ bị chuyển hướng đến trang đăng nhập trong {countdown} giây.
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={redirectToLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Đến trang đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 