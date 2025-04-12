"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerificationFailedPage() {
	const searchParams = useSearchParams();
	const error =
		searchParams.get("error") ||
		"Xác minh email thất bại. Vui lòng thử lại sau.";
	const email = searchParams.get("email") || "";

	const handleResendEmail = async () => {
		if (!email) return;

		try {
			const apiUrl =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
			const response = await fetch(`${apiUrl}/auth/resend-verification`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (data.success) {
				alert(
					"Email xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn."
				);
			} else {
				alert(
					data.message ||
						"Không thể gửi lại email xác nhận. Vui lòng thử lại sau."
				);
			}
		} catch (error) {
			alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
		}
	};

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
				<div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8">
					<div className="text-center">
						<div className="rounded-full h-16 w-16 bg-red-100 mx-auto flex items-center justify-center">
							<svg
								className="h-8 w-8 text-red-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</div>

						<h1 className="mt-4 text-2xl font-bold text-gray-900">
							Xác minh Email thất bại
						</h1>

						<p className="mt-4 text-gray-600">{error}</p>

						<div className="mt-8 space-y-3">
							{email && (
								<button
									onClick={handleResendEmail}
									className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									Gửi lại email xác nhận
								</button>
							)}

							<Link
								href="/login"
								className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								Đi đến trang đăng nhập
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
