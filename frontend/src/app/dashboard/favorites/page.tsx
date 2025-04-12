"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { CITY_DATA } from "@/constants/cities";
import { Navbar } from "@/layout/Navbar";

export default function DashboardFavoritesPage() {
	const router = useRouter();
	const { user, isAuthenticated, isLoading, removeFavorite } = useAuthContext();
	const [favoriteCities, setFavoriteCities] = useState<any[]>([]);

	// Redirect nếu chưa đăng nhập
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/login");
		}
	}, [isLoading, isAuthenticated, router]);

	// Lấy danh sách thành phố yêu thích
	useEffect(() => {
		if (user && user.favorites) {
			// Lọc danh sách thành phố từ CITY_DATA dựa trên ids từ user.favorites
			const cities = Object.values(CITY_DATA).filter((city) =>
				user.favorites.includes(city.id)
			);
			setFavoriteCities(cities);
		}
	}, [user]);

	const handleRemoveFavorite = async (cityId: string) => {
		try {
			await removeFavorite(cityId);
			// Cập nhật lại UI
			setFavoriteCities((prev) => prev.filter((city) => city.id !== cityId));
		} catch (error) {
			console.error("Lỗi khi xóa khỏi danh sách yêu thích:", error);
		}
	};

	if (isLoading) {
		return (
			<>
				<Navbar />
				<div className="min-h-screen bg-gray-100 pt-20 px-4">
					<div className="max-w-4xl mx-auto">
						<div className="animate-pulse bg-white rounded-lg shadow-md p-6">
							<div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
							<div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
							<div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
							<div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
						</div>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-gray-100 pt-20 px-4 pb-10">
				<div className="max-w-4xl mx-auto">
					<div className="bg-white rounded-lg shadow-md p-6">
						<h1 className="text-2xl font-bold text-blue-600 mb-6">
							Thành phố yêu thích
						</h1>

						{favoriteCities.length === 0 ? (
							<div className="text-center py-8">
								<p className="text-gray-500 mb-4">
									Bạn chưa có thành phố yêu thích nào
								</p>
								<Link
									href="/"
									className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
								>
									Khám phá các thành phố
								</Link>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{favoriteCities.map((city) => (
									<div
										key={city.id}
										className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
									>
										<div className="bg-blue-50 p-4 flex justify-between items-center">
											<Link
												href={`/city/${city.slug}`}
												className="font-medium text-blue-600 hover:text-blue-800"
											>
												{city.name}
											</Link>
											<button
												onClick={() => handleRemoveFavorite(city.id)}
												className="p-1 rounded-full text-red-600 hover:bg-red-100"
												aria-label="Xóa khỏi yêu thích"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													strokeWidth={1.5}
													stroke="currentColor"
													className="w-5 h-5"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
													/>
												</svg>
											</button>
										</div>
										<Link
											href={`/city/${city.slug}`}
											className="block p-4 hover:bg-gray-50"
										>
											<div className="text-sm text-gray-600">
												<p>
													<span className="font-medium">Vĩ độ:</span>{" "}
													{city.coordinates.latitude}
												</p>
												<p>
													<span className="font-medium">Kinh độ:</span>{" "}
													{city.coordinates.longitude}
												</p>
												<p className="mt-2 text-blue-600 font-medium">
													Nhấp để xem chi tiết
												</p>
											</div>
										</Link>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
} 