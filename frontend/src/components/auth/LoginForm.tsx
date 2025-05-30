"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import axios from "axios";

interface ErrorWithMessage {
	message: string;
}

const LoginForm = () => {
	const router = useRouter();
	const { login } = useAuthContext();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [verificationEmail, setVerificationEmail] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			console.log("Đang thử đăng nhập với email:", formData.email);
			
			// Trim input để tránh lỗi do người dùng nhập khoảng trắng
			const cleanedData = {
				email: formData.email.trim(),
				password: formData.password
			};
			
			if (!cleanedData.email) {
				throw new Error("Vui lòng nhập email");
			}
			
			if (!cleanedData.password) {
				throw new Error("Vui lòng nhập mật khẩu");
			}
			
			await login(cleanedData.email, cleanedData.password);
			console.log("Đăng nhập thành công, đang chuyển hướng");
			router.push("/");
			router.refresh();
		} catch (err: unknown) {
			console.error("Lỗi khi đăng nhập:", err);
			const error = err as ErrorWithMessage;

			// Kiểm tra nếu là lỗi về tài khoản chưa kích hoạt
			if (error.message && error.message.includes("chưa được kích hoạt")) {
				// Hiển thị thông báo lỗi với nút gửi lại email xác nhận
				setVerificationEmail(formData.email);
				setError(error.message);
			} 
			// Kiểm tra lỗi mạng
			else if (error.message && (
				error.message.includes("Không thể kết nối") || 
				error.message.includes("Network Error") ||
				error.message.includes("timeout")
			)) {
				setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.");
			}
			// Lỗi đăng nhập thông thường
			else {
				setError(error.message || "Đăng nhập thất bại. Vui lòng thử lại.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleLogin = () => {
		const apiUrl =
			process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
		window.location.href = `${apiUrl}/auth/google`;
	};

	// Hàm gửi lại email xác nhận
	const resendVerificationEmail = async () => {
		const apiUrl =
			process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

		if (!verificationEmail) return;

		try {
			setIsLoading(true);
			const response = await axios.post(`${apiUrl}/auth/resend-verification`, {
				email: verificationEmail,
			});

			if (response.data.success) {
				setError(
					"Email xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn."
				);
			}
		} catch (err: unknown) {
			const error = err as ErrorWithMessage;
			setError(
				error.message ||
					"Không thể gửi lại email xác nhận. Vui lòng thử lại sau."
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
			<h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
				Đăng nhập
			</h2>

			{error && (
				<div
					className={`mb-4 p-3 rounded-md ${
						verificationEmail
							? "bg-yellow-100 text-yellow-700"
							: "bg-red-100 text-red-700"
					}`}
				>
					<p>{error}</p>
					{verificationEmail && (
						<button
							onClick={resendVerificationEmail}
							className="mt-2 text-blue-600 underline font-medium"
							disabled={isLoading}
						>
							{isLoading ? "Đang gửi..." : "Gửi lại email xác nhận"}
						</button>
					)}
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<div className="mb-4">
					<label
						htmlFor="email"
						className="block text-gray-700 font-medium mb-2"
					>
						Email
					</label>
					<input
						type="email"
						id="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						required
						className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
						placeholder="Email của bạn"
					/>
				</div>

				<div className="mb-6">
					<label
						htmlFor="password"
						className="block text-gray-700 font-medium mb-2"
					>
						Mật khẩu
					</label>
					<input
						type="password"
						id="password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						required
						className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
						placeholder="Mật khẩu của bạn"
					/>
					<div className="mt-2 text-right">
						<Link
							href="/forgot-password"
							className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
						>
							Quên mật khẩu?
						</Link>
					</div>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
				>
					{isLoading ? "Đang xử lý..." : "Đăng nhập"}
				</button>
			</form>

			<div className="relative my-6">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-gray-300"></div>
				</div>
				<div className="relative flex justify-center text-sm">
					<span className="px-2 bg-white text-gray-500">Hoặc</span>
				</div>
			</div>

			<button
				onClick={handleGoogleLogin}
				className="w-full flex items-center justify-center gap-4 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
			>
				<svg className="w-5 h-5" viewBox="0 0 24 24">
					<path
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						fill="#4285F4"
					/>
					<path
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						fill="#34A853"
					/>
					<path
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						fill="#FBBC05"
					/>
					<path
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						fill="#EA4335"
					/>
				</svg>
				Đăng nhập bằng Google
			</button>

			<div className="mt-4 text-center">
				<p className="text-gray-600">
					Chưa có tài khoản?{" "}
					<Link
						href="/register"
						className="text-blue-600 hover:text-blue-800 hover:underline"
					>
						Đăng ký ngay
					</Link>
				</p>
			</div>
		</div>
	);
};

export default LoginForm;
