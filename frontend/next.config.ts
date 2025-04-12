import type { NextConfig } from "next";

// Lấy API URL từ biến môi trường hoặc sử dụng giá trị mặc định
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const nextConfig: NextConfig = {
	images: {
		domains: ["www.iqair.com"],
	},
	async rewrites() {
		return [
			{
				source: "/air-quality",
				destination: "/air-quality",
			},
			{
				source: "/login",
				destination: "/login",
			},
			{
				source: "/register",
				destination: "/register",
			},
			{
				source: "/auth/forgot-password",
				destination: "/auth/forgot-password",
			},
			// API proxies sang backend - sử dụng biến môi trường
			{
				source: "/api/:path*",
				destination: `${API_URL.replace("/api", "")}/:path*`,
			},
		];
	},
};

export default nextConfig;
