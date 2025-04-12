"use client";

import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
	return (
		<div className="min-h-screen relative">
			{/* Background image */}
			<div 
				className="fixed inset-0 w-full h-full bg-cover bg-center"
				style={{
					backgroundImage: "url('/images/weather-bg.jpg')",
					backgroundSize: "cover",
				}}
			>
				<div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-green-500/50"></div>
			</div>

			{/* Content - thêm padding-top để không bị navbar che */}
			<div className="relative min-h-screen pt-20 z-10">
				<div className="container mx-auto px-4 py-8">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-extrabold text-white">
							Ứng dụng thời tiết
						</h1>
						<p className="mt-2 text-white/80">
							Đăng nhập để lưu các thành phố yêu thích và nhận thông báo
						</p>
					</div>
					<div className="max-w-md mx-auto">
						<RegisterForm />
					</div>
				</div>
			</div>
		</div>
	);
}
