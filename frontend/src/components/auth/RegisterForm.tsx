"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";

interface ErrorWithMessage {
	message: string;
}

const RegisterForm = () => {
	const router = useRouter();
	const { register } = useAuthContext();
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isRegistered, setIsRegistered] = useState(false);
	const [registeredEmail, setRegisteredEmail] = useState("");

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

		// Kiểm tra mật khẩu nhập lại
		if (formData.password !== formData.confirmPassword) {
			setError("Mật khẩu nhập lại không khớp");
			return;
		}

		// Xử lý họ tên trước khi kiểm tra dữ liệu
		const processedData = { ...formData };

		// Parse the full name from the form if it's in the format "NGUYEN QUOC BAO"
		if (processedData.firstName && !processedData.lastName) {
			const parts = processedData.firstName.trim().split(" ");
			if (parts.length > 1) {
				processedData.lastName = parts.slice(0, parts.length - 1).join(" ");
				processedData.firstName = parts[parts.length - 1];
			} else {
				// Nếu chỉ có một từ, đặt nó làm firstName và để lastName trống
				processedData.firstName = parts[0];
				processedData.lastName = "";
			}
		}

		// Kiểm tra trường bắt buộc
		if (
			!processedData.firstName ||
			!processedData.email ||
			!processedData.password
		) {
			setError("Vui lòng điền đầy đủ thông tin");
			return;
		}

		setIsLoading(true);

		try {
			// Tạo object mới không bao gồm confirmPassword
			const registrationData = {
				email: processedData.email,
				firstName: processedData.firstName,
				lastName: processedData.lastName,
				password: processedData.password,
			};

			console.log("Gửi dữ liệu đăng ký:", registrationData);
			await register(registrationData);

			// Hiển thị thông báo xác nhận email
			setIsRegistered(true);
			setRegisteredEmail(processedData.email);
		} catch (err: unknown) {
			const error = err as ErrorWithMessage;
			console.error("Lỗi đăng ký:", error);
			setError(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
			<h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
				{isRegistered ? "Đăng ký thành công!" : "Đăng ký tài khoản"}
			</h2>

			{isRegistered ? (
				<div className="text-center">
					<div className="mb-6 p-4 bg-green-50 rounded-md">
						<div className="flex items-center justify-center mb-3">
							<svg
								className="w-10 h-10 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-green-700 mb-2">
							Đăng ký thành công!
						</h3>
						<p className="text-gray-600 mb-2">
							Chúng tôi đã gửi một email xác nhận đến{" "}
							<span className="font-semibold">{registeredEmail}</span>.
						</p>
						<p className="text-gray-600">
							Vui lòng kiểm tra hộp thư của bạn và nhấp vào liên kết xác nhận để
							kích hoạt tài khoản.
						</p>
					</div>

					<div className="mt-4">
						<button
							onClick={() => router.push("/login")}
							className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
						>
							Đến trang đăng nhập
						</button>
					</div>
				</div>
			) : (
				<>
					{error && (
						<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit}>
						<div className="grid grid-cols-1 gap-4 mb-4">
							<div>
								<label
									htmlFor="firstName"
									className="block text-gray-700 font-medium mb-2"
								>
									Họ tên
								</label>
								<input
									type="text"
									id="firstName"
									name="firstName"
									value={formData.firstName}
									onChange={handleChange}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
									placeholder="Nhập họ tên đầy đủ của bạn"
								/>
							</div>
							<div className="hidden">
								<label
									htmlFor="lastName"
									className="block text-gray-700 font-medium mb-2"
								>
									Họ
								</label>
								<input
									type="text"
									id="lastName"
									name="lastName"
									value={formData.lastName}
									onChange={handleChange}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
									placeholder="Họ của bạn"
								/>
							</div>
						</div>

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

						<div className="mb-4">
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
								minLength={6}
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
								placeholder="Tối thiểu 6 ký tự"
							/>
						</div>

						<div className="mb-6">
							<label
								htmlFor="confirmPassword"
								className="block text-gray-700 font-medium mb-2"
							>
								Nhập lại mật khẩu
							</label>
							<input
								type="password"
								id="confirmPassword"
								name="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
								placeholder="Nhập lại mật khẩu"
							/>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
						>
							{isLoading ? "Đang xử lý..." : "Đăng ký"}
						</button>
					</form>

					<div className="mt-4 text-center">
						<p className="text-gray-600">
							Đã có tài khoản?{" "}
							<Link
								href="/login"
								className="text-blue-600 hover:text-blue-800 hover:underline"
							>
								Đăng nhập
							</Link>
						</p>
					</div>
				</>
			)}
		</div>
	);
};

export default RegisterForm;
