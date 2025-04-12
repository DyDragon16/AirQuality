"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

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
        // Chuyển hướng đến trang đăng nhập sau 3 giây
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error: unknown) {
      console.error("Lỗi thiết lập mật khẩu:", error);
      const axiosError = error as {
        response?: {
          data?: {
            message?: string
          }
        }
      };
      if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message);
      } else {
        setError("Đã xảy ra lỗi khi thiết lập mật khẩu");
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
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Liên kết không hợp lệ</h2>
            <p className="mt-2 text-sm text-gray-600">
              Liên kết đã hết hạn hoặc không hợp lệ. Vui lòng liên hệ quản trị viên để được hỗ trợ.
            </p>
            <div className="mt-6">
              <Link href="/login" className="text-blue-600 hover:text-blue-500">
                Quay lại trang đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {success ? "Mật khẩu đã được thiết lập!" : "Thiết lập mật khẩu mới"}
          </h2>
          {!success && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Vui lòng nhập mật khẩu mới cho tài khoản của bạn
            </p>
          )}
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Mật khẩu đã được thiết lập thành công! Tài khoản của bạn giờ đã sẵn sàng để sử dụng. Bạn sẽ được chuyển hướng đến trang đăng nhập trong vài giây.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
                  "Thiết lập mật khẩu"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 