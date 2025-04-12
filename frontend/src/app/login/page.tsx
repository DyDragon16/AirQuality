"use client";

import LoginForm from "@/components/auth/LoginForm";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
	const searchParams = useSearchParams();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Kiểm tra lỗi từ callback
		const errorParam = searchParams.get("error");
		
		// Kiểm tra xem quá trình xác thực đã hoàn tất hay chưa
		const authComplete = searchParams.get("auth_complete");
		
		if (errorParam && authComplete === "true") {
			switch (errorParam) {
				case "auth_failed":
					setError("Đăng nhập thất bại. Vui lòng thử lại.");
					break;
				case "account_suspended":
					setError("Tài khoản của bạn đã bị tạm ngưng. Vui lòng liên hệ quản trị viên để được hỗ trợ.");
					break;
				default:
					setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
			}
		} else {
			// Xóa thông báo lỗi nếu không có lỗi hoặc quá trình chưa hoàn tất
			setError(null);
		}
	}, [searchParams]);

	return (
		<div className="flex min-h-screen relative">
			{/* Background image */}
			<div 
				className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
				style={{
					backgroundImage: "url('/images/weather-bg.jpg')",
					backgroundSize: "cover",
				}}
			>
				<div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-indigo-600/50"></div>
			</div>

			{/* Content */}
			<div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="w-full max-w-md">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-extrabold text-white">
							Ứng dụng thời tiết
						</h1>
						<p className="mt-2 text-white/80">
							Đăng nhập để lưu các thành phố yêu thích và nhận thông báo
						</p>
					</div>

					{error && (
						<div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
							{error}
						</div>
					)}

					<LoginForm />
				</div>
			</div>
		</div>
	);
}
