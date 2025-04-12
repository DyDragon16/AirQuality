"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		// Kiểm tra xác nhận mật khẩu
		if (formData.password !== formData.confirmPassword) {
			setError("Mật khẩu xác nhận không khớp");
			setLoading(false);
			return;
		}

		try {
			// Xử lý họ tên - tách thành firstName và lastName
			let firstName = formData.name;
			let lastName = "";

			if (formData.name) {
				const parts = formData.name.trim().split(" ");
				if (parts.length > 1) {
					lastName = parts.slice(0, parts.length - 1).join(" ");
					firstName = parts[parts.length - 1];
				} else {
					lastName = firstName; // Nếu chỉ có 1 từ, sử dụng cùng giá trị cho cả 2 trường
				}
			}

			console.log("Đang gửi request đăng ký với:", {
				firstName,
				lastName,
				email: formData.email,
				password: formData.password,
			});

			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					firstName,
					lastName,
					email: formData.email,
					password: formData.password,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Đăng ký thất bại");
			}

			// Đăng ký thành công
			setSuccess(true);
		} catch (err) {
			console.error("Lỗi đăng ký:", err);
			setError(
				err instanceof Error ? err.message : "Có lỗi xảy ra khi đăng ký"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
				<div className="sm:mx-auto sm:w-full sm:max-w-md">
					<h1 className="text-center text-4xl font-bold text-blue-600">
						Ứng dụng thời tiết
					</h1>
					<p className="mt-2 text-center text-md text-gray-600 mb-6">
						Đăng nhập để lưu các thành phố yêu thích và nhận thông báo
					</p>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Đăng ký tài khoản mới
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Hoặc{" "}
						<Link
							href="/login"
							className="font-medium text-blue-600 hover:text-blue-500"
						>
							đăng nhập nếu đã có tài khoản
						</Link>
					</p>
				</div>

				<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
					<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
						{error && (
							<div
								className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative"
								role="alert"
							>
								<span className="block sm:inline">{error}</span>
							</div>
						)}

						{success ? (
							<div className="text-center">
								<div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
									<p>
										Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài
										khoản.
									</p>
								</div>
								<Link
									href="/login"
									className="font-medium text-blue-600 hover:text-blue-500"
								>
									Quay lại trang đăng nhập
								</Link>
							</div>
						) : (
							<form className="space-y-6" onSubmit={handleSubmit}>
								<div>
									<label
										htmlFor="name"
										className="block text-sm font-medium text-gray-700"
									>
										Họ tên
									</label>
									<div className="mt-1">
										<input
											id="name"
											name="name"
											type="text"
											required
											className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
											value={formData.name}
											onChange={(e) =>
												setFormData({ ...formData, name: e.target.value })
											}
											placeholder="Nhập họ tên đầy đủ của bạn"
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor="email"
										className="block text-sm font-medium text-gray-700"
									>
										Email
									</label>
									<div className="mt-1">
										<input
											id="email"
											name="email"
											type="email"
											autoComplete="email"
											required
											className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
											value={formData.email}
											onChange={(e) =>
												setFormData({ ...formData, email: e.target.value })
											}
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor="password"
										className="block text-sm font-medium text-gray-700"
									>
										Mật khẩu
									</label>
									<div className="mt-1">
										<input
											id="password"
											name="password"
											type="password"
											required
											className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
											value={formData.password}
											onChange={(e) =>
												setFormData({ ...formData, password: e.target.value })
											}
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor="confirmPassword"
										className="block text-sm font-medium text-gray-700"
									>
										Xác nhận mật khẩu
									</label>
									<div className="mt-1">
										<input
											id="confirmPassword"
											name="confirmPassword"
											type="password"
											required
											className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
											value={formData.confirmPassword}
											onChange={(e) =>
												setFormData({
													...formData,
													confirmPassword: e.target.value,
												})
											}
										/>
									</div>
								</div>

								<div>
									<button
										type="submit"
										disabled={loading}
										className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
											loading
												? "bg-blue-400 cursor-not-allowed"
												: "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
										}`}
									>
										{loading ? "Đang xử lý..." : "Đăng ký"}
									</button>
								</div>
							</form>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
