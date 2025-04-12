"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function VerifyEmailPage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [showToast, setShowToast] = useState(false);
	
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams?.get("token");
	const email = searchParams?.get("email");

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

	// Xác thực email tự động khi trang được tải
	useEffect(() => {
		const verifyEmail = async () => {
			if (!token || !email) {
				setError("Link xác thực không hợp lệ. Vui lòng kiểm tra lại email của bạn.");
				setLoading(false);
				return;
			}

			try {
				console.log(`Đang xác thực email: ${email} với token: ${token.substring(0, 10)}...`);
				
				// Thêm timeout dài hơn để tránh lỗi mạng
				const response = await axios.post(`${API_URL}/auth/verify-email`, { 
					token, 
					email 
				}, {
					timeout: 10000 // 10 giây timeout
				});
				
				console.log("Kết quả xác thực:", response.data);
				
				if (response.data.success) {
					setSuccess(true);
				} else {
					setError(response.data.message || "Đã xảy ra lỗi khi xác thực email.");
				}
			} catch (err: unknown) {
				console.error("Lỗi xác thực email:", err);
				
				// Hiển thị thông tin lỗi chi tiết cho người dùng
				if (axios.isAxiosError(err)) {
					// Lỗi từ API
					if (err.response?.data?.message) {
						setError(err.response.data.message);
						console.error("Chi tiết lỗi từ API:", err.response.data);
					} 
					// Lỗi timeout hoặc mạng
					else if (err.code === 'ECONNABORTED') {
						setError("Kết nối đến máy chủ quá chậm. Vui lòng thử lại sau.");
					} 
					// Lỗi mạng khác
					else if (!err.response) {
						setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.");
					} 
					// Các lỗi khác
					else {
						setError(`Đã xảy ra lỗi: ${err.message || "Không xác định"}`);
					}
				} else if (err instanceof Error) {
					setError(err.message);
				} else {
					setError("Đã xảy ra lỗi không xác định khi xác thực email.");
				}
			} finally {
				setLoading(false);
			}
		};

		verifyEmail();
	}, [token, email]);

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
							<p className="text-sm font-medium text-gray-900">Xác thực email thành công!</p>
							<p className="mt-1 text-sm text-gray-500">Bạn sẽ được chuyển hướng đến trang đăng nhập...</p>
						</div>
					</div>
				</div>
			)}

			<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
				<div className="w-full max-w-md space-y-8">
					<div className="text-center">
						{loading && (
							<>
								<h2 className="text-3xl font-bold tracking-tight text-gray-900">Đang xác thực email...</h2>
								<div className="mt-4 flex justify-center">
									<div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
								</div>
							</>
						)}

						{!loading && error && (
							<>
								<div className="flex justify-center mb-4">
									<svg className="h-16 w-16 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
									</svg>
								</div>
								<h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Xác thực không thành công</h2>
								<p className="text-lg text-gray-600 mb-4">{error}</p>
								<p className="text-gray-600 mb-6">
									Liên kết có thể đã hết hạn hoặc không hợp lệ.
								</p>
								<div className="mt-6 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
									<Link 
										href="/login" 
										className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
									>
										Đăng nhập
									</Link>
									<Link 
										href="/register" 
										className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
									>
										Đăng ký tài khoản
									</Link>
								</div>
							</>
						)}

						{!loading && success && (
							<>
								<div className="flex justify-center mb-4">
									<svg className="h-16 w-16 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
								</div>
								<h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Email đã được xác thực!</h2>
								<p className="text-lg text-gray-600 mb-4">
									Cảm ơn bạn đã xác thực email. Tài khoản của bạn đã được kích hoạt.
								</p>
								<p className="text-gray-600 mb-6">
									Bạn sẽ được chuyển hướng đến trang đăng nhập trong vài giây.
								</p>
								<div className="mt-6">
									<Link 
										href="/login" 
										className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
									>
										Đăng nhập ngay
									</Link>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
