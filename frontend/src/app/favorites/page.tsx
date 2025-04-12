"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FavoritesRedirectPage() {
	const router = useRouter();

	useEffect(() => {
		router.replace("/dashboard/favorites");
	}, [router]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-2xl font-bold text-gray-800 mb-4">Đang chuyển hướng...</h1>
				<p className="text-gray-600">Vui lòng đợi trong giây lát hoặc <a href="/dashboard/favorites" className="text-blue-600 hover:underline">nhấp vào đây</a></p>
			</div>
		</div>
	);
}
