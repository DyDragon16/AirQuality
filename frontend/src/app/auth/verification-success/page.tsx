"use client";

import Link from "next/link";

export default function VerificationSuccessPage() {
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
						<div className="rounded-full h-16 w-16 bg-green-100 mx-auto flex items-center justify-center">
							<svg
								className="h-8 w-8 text-green-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>

						<h1 className="mt-4 text-2xl font-bold text-gray-900">
							Xác minh Email thành công!
						</h1>

						<p className="mt-4 text-gray-600">
							Email của bạn đã được xác nhận thành công. Tài khoản của bạn đã
							được kích hoạt và bạn có thể đăng nhập ngay bây giờ.
						</p>

						<div className="mt-8">
							<Link
								href="/login"
								className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
