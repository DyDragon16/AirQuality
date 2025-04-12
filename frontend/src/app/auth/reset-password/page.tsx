"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  // Hiển thị toast khi thành công và tự động ẩn sau 5 giây
  useEffect(() => {
    if (success) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        router.push("/login");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  // Kiểm tra token hợp lệ
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenValid(false);
        setTokenChecked(true);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/auth/check-reset-token?token=${token}`);
        setTokenValid(response.data.valid);
      } catch (error) {
        console.error("Lỗi kiểm tra token:", error);
        setTokenValid(false);
      } finally {
        setTokenChecked(true);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra mật khẩu
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!token) {
      setError("Token không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Gọi API thiết lập mật khẩu
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        password
      });
      
      if (response.data.success) {
        setSuccess(true);
      }
    } catch (error: unknown) {
      console.error("Lỗi đặt lại mật khẩu:", error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Đã xảy ra lỗi khi đặt lại mật khẩu");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenChecked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Đang kiểm tra...</h2>
            <div className="mt-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg className="h-16 w-16 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Liên kết không hợp lệ</h2>
            <p className="text-lg text-gray-600 mb-4">
              Liên kết đã hết hạn hoặc không hợp lệ.
            </p>
            <p className="text-gray-600 mb-6">
              Vui lòng yêu cầu liên kết đặt lại mật khẩu mới để tiếp tục.
            </p>
            <div className="mt-6 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
              <Link 
                href="/forgot-password" 
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Yêu cầu liên kết mới
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <p className="text-sm font-medium text-gray-900">Đặt lại mật khẩu thành công!</p>
              <p className="mt-1 text-sm text-gray-500">Bạn sẽ được chuyển hướng đến trang đăng nhập...</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Đặt lại mật khẩu
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Vui lòng nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mật khẩu mới
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? (
                  <>
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    </span>
                    Đang xử lý...
                  </>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <Link href="/login" className="text-blue-600 hover:text-blue-500">
                Quay lại trang đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 