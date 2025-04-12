"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

interface ErrorWithMessage {
  message: string;
}

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { handleGoogleCallback } = useAuthContext();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const token = searchParams.get("token");
        
        if (!token) {
          setError("Không nhận được token xác thực");
          return;
        }

        // Xử lý token thông qua context
        await handleGoogleCallback(token);

        // Chuyển hướng về trang chủ
        router.push("/");
      } catch (err: unknown) {
        const error = err as ErrorWithMessage;
        if (error.message && error.message.includes("tạm ngưng")) {
          // Xử lý lỗi tài khoản bị tạm ngưng
          router.push("/login?error=account_suspended&auth_complete=true");
          return;
        }
        setError(error.message || "Đã xảy ra lỗi khi xử lý đăng nhập Google");
      }
    };

    processCallback();
  }, [router, searchParams, handleGoogleCallback]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-red-600">
            Lỗi Đăng nhập
          </h2>
          <p className="text-center text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Quay lại trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Đang xử lý đăng nhập...
        </h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
} 