"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Hiển thị toast khi thành công và tự động ẩn sau 5 giây
  useEffect(() => {
    if (success) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });

      if (response.data.success) {
        // Yêu cầu thành công
        setSuccess(true);
        // Xóa email sau khi gửi thành công
        setEmail("");
      } else {
        throw new Error(response.data.message || "Không thể gửi yêu cầu đặt lại mật khẩu");
      }
      
    } catch (err: unknown) {
      console.error("Lỗi khi gửi yêu cầu quên mật khẩu:", err);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Có lỗi xảy ra khi xử lý yêu cầu");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast thông báo thành công */}
      {showToast && (
        <div className="fixed top-5 right-5 bg-white shadow-lg rounded-lg p-4 max-w-md z-50 transform transition-transform duration-300 ease-in-out">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-2">
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Gửi email thành công!</p>
              <p className="mt-1 text-sm text-gray-500">Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-auto bg-white rounded-md p-1 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Đóng</span>
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen relative">
        {/* Background image */}
        <div 
          className="fixed inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/weather-bg.jpg')",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-indigo-600/50"></div>
        </div>

        {/* Content */}
        <div className="relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 z-10 min-h-screen">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Quên mật khẩu
            </h2>
            <p className="mt-2 text-center text-sm text-white/80">
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      loading 
                        ? "bg-blue-400 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    }`}
                  >
                    {loading ? "Đang xử lý..." : "Gửi yêu cầu"}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Quay lại trang đăng nhập
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 