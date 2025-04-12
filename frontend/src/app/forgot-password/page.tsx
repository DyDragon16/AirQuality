"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/forgot-password');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
} 