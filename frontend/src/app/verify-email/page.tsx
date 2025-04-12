"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmailRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const email = searchParams?.get("email");

  useEffect(() => {
    let redirectUrl = '/auth/verify-email';
    
    // Thêm các tham số vào URL chuyển hướng nếu có
    const params = new URLSearchParams();
    if (token) params.append('token', token);
    if (email) params.append('email', email);
    
    if (params.toString()) {
      redirectUrl += `?${params.toString()}`;
    }
      
    router.replace(redirectUrl);
  }, [router, token, email]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
} 