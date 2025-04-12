"use client";

import { useState, useEffect } from "react";
import {
	Heart,
	Clock,
	User,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import Link from "next/link";
import { Navbar } from "@/layout/Navbar";
import { CITY_DATA } from "@/constants/cities";
import useRecentlyViewed from "@/hooks/useRecentlyViewed";

// Giả lập dữ liệu cho trang tổng quan của người dùng
const DEMO_DATA = {
	favorites: 5,
	recentViews: 12,
	notifications: 0,
	favoritesCities: [
		{ id: 1, name: "Hà Nội", aqi: 156, status: "unhealthy" },
		{ id: 2, name: "Đà Nẵng", aqi: 72, status: "moderate" },
		{ id: 3, name: "Hồ Chí Minh", aqi: 124, status: "unhealthy-sensitive" },
		{ id: 4, name: "Đà Lạt", aqi: 42, status: "good" },
		{ id: 5, name: "Huế", aqi: 85, status: "moderate" },
	],
	recentlyViewed: [
		{ id: 1, name: "Nha Trang", time: "2 giờ trước" },
		{ id: 2, name: "Cần Thơ", time: "1 ngày trước" },
		{ id: 3, name: "Hải Phòng", time: "3 ngày trước" },
	],
};

// Component cho các thẻ thống kê
interface StatCardProps {
	title: string;
	value: number;
	icon: React.ElementType;
	colorClass: string;
	href: string;
}

const StatCard = ({ title, value, icon, colorClass, href }: StatCardProps) => {
	const Icon = icon;

	return (
		<Link href={href}>
			<div className="rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg hover:bg-gray-50">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-gray-500">{title}</p>
						<h3 className="mt-2 text-2xl font-bold text-gray-800">
							{value.toLocaleString()}
						</h3>
					</div>
					<div
						className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClass}`}
					>
						<Icon size={24} className="text-white" />
					</div>
				</div>
			</div>
		</Link>
	);
};

// Component hiển thị thành phố yêu thích
interface City {
	id: number;
	name: string;
	aqi: number;
	status: string;
	cityId?: string; // Thêm trường cityId vào interface
}

interface FavoriteCitiesProps {
	cities: City[];
}

const FavoriteCities = ({ cities }: FavoriteCitiesProps) => {
	// Hàm để lấy màu và nhãn dựa trên AQI
	const getAQIStatus = (aqi: number, type: "color" | "text" = "color") => {
		if (aqi <= 50) return type === "color" ? "bg-green-100 text-green-800" : "Tốt";
		if (aqi <= 100) return type === "color" ? "bg-yellow-100 text-yellow-800" : "Trung bình";
		if (aqi <= 150) return type === "color" ? "bg-orange-100 text-orange-800" : "Không tốt cho nhóm nhạy cảm";
		if (aqi <= 200) return type === "color" ? "bg-red-100 text-red-800" : "Không tốt";
		if (aqi <= 300) return type === "color" ? "bg-purple-100 text-purple-800" : "Rất không tốt";
		return type === "color" ? "bg-rose-100 text-rose-800" : "Nguy hiểm";
	};

	return (
		<div className="rounded-lg bg-white shadow-md">
			<div className="border-b border-gray-200 p-4">
				<h2 className="text-lg font-medium text-gray-800">Thành phố yêu thích</h2>
			</div>
			<div className="p-4">
				<ul className="divide-y divide-gray-200">
					{cities.map((city) => (
						<li key={city.id} className="py-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<Heart size={18} className="text-red-500 mr-2" />
									<span className="text-sm font-medium text-gray-800">
										{city.name}
									</span>
								</div>
								<div>
									<span className={`px-2 py-1 text-xs font-medium rounded-full ${getAQIStatus(city.aqi)}`}>
										AQI: {city.aqi}
									</span>
								</div>
							</div>
						</li>
					))}
				</ul>
				<div className="mt-4">
					<Link
						href="/dashboard/favorites"
						className="text-sm text-blue-600 hover:text-blue-800"
					>
						Xem tất cả thành phố yêu thích
					</Link>
				</div>
			</div>
		</div>
	);
};

// Component hiển thị lịch sử xem
interface ViewedItem {
	id: number;
	name: string;
	time: string;
}

interface RecentlyViewedProps {
	items: ViewedItem[];
}

const RecentlyViewed = ({ items }: RecentlyViewedProps) => {
	return (
		<div className="rounded-lg bg-white shadow-md">
			<div className="border-b border-gray-200 p-4">
				<h2 className="text-lg font-medium text-gray-800">Đã xem gần đây</h2>
			</div>
			<div className="p-4">
				<ul className="divide-y divide-gray-200">
					{items.map((item) => (
						<li key={item.id} className="py-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<Clock size={18} className="text-blue-500 mr-2" />
									<span className="text-sm font-medium text-gray-800">
										{item.name}
									</span>
								</div>
								<div>
									<span className="text-xs text-gray-500">{item.time}</span>
								</div>
							</div>
						</li>
					))}
				</ul>
				<div className="mt-4">
					<Link
						href="/dashboard/history"
						className="text-sm text-blue-600 hover:text-blue-800"
					>
						Xem tất cả lịch sử
					</Link>
				</div>
			</div>
		</div>
	);
};

// Component hiển thị thông tin tài khoản
interface UserProps {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	favorites: string[];
}

const UserAccount = ({ user }: { user: UserProps | null }) => {
	return (
		<div className="rounded-lg bg-white shadow-md">
			<div className="border-b border-gray-200 p-4">
				<h2 className="text-lg font-medium text-gray-800">Tài khoản của bạn</h2>
			</div>
			<div className="p-4">
				<div className="flex items-center mb-4">
					<div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xl mr-4">
						{user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
					</div>
					<div>
						<div className="text-md font-medium text-gray-800">
							{user?.firstName} {user?.lastName}
						</div>
						<div className="text-sm text-gray-500">{user?.email}</div>
					</div>
				</div>
				
				<ul className="divide-y divide-gray-200">
					<li className="py-3">
						<Link href="/dashboard/account" className="flex items-center justify-between hover:text-blue-600">
							<div className="flex items-center">
								<User size={18} className="text-blue-500 mr-2" />
								<span className="text-sm font-medium">Thông tin tài khoản</span>
							</div>
							<span className="text-blue-500">&#8250;</span>
						</Link>
					</li>
					<li className="py-3">
						<Link href="/dashboard/favorites" className="flex items-center justify-between hover:text-blue-600">
							<div className="flex items-center">
								<Heart size={18} className="text-red-500 mr-2" />
								<span className="text-sm font-medium">Thành phố yêu thích</span>
							</div>
							<span className="text-blue-500">&#8250;</span>
						</Link>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default function UserDashboard() {
	const [data, setData] = useState(DEMO_DATA);
	const { user } = useAuthContext();
	const [favoriteCities, setFavoriteCities] = useState<City[]>([]);
	const { recentCities } = useRecentlyViewed();
	const [recentlyViewedItems, setRecentlyViewedItems] = useState<ViewedItem[]>([]);

	// Trong môi trường thực tế, bạn sẽ lấy dữ liệu từ API
	useEffect(() => {
		// Giả lập việc lấy dữ liệu từ API
		const fetchData = async () => {
			// const response = await fetch('/api/user/dashboard');
			// const result = await response.json();
			// setData(result);

			// Cập nhật dữ liệu dựa trên thông tin người dùng thực tế
			if (user) {
				setData(prevData => ({
					...prevData,
					favorites: user.favorites ? user.favorites.length : 0,
					recentViews: recentCities.length || 0
				}));

				// Cập nhật danh sách thành phố yêu thích
				if (user.favorites && user.favorites.length > 0) {
					// Chuyển đổi cityId từ user.favorites thành đối tượng City
					const cities: City[] = [];
					user.favorites.forEach((cityId) => {
						// Tìm thông tin thành phố từ CITY_DATA
						const cityEntry = Object.entries(CITY_DATA).find(([, cityData]) => cityData.id === cityId);
						if (cityEntry) {
							const cityName = cityEntry[0];
							// Thêm vào danh sách với một giá trị AQI ngẫu nhiên (sẽ được thay thế bằng dữ liệu thực trong ứng dụng thực tế)
							const randomAqi = Math.floor(Math.random() * 250) + 20;
							let status = "good";
							if (randomAqi > 200) status = "unhealthy";
							else if (randomAqi > 150) status = "unhealthy-sensitive";
							else if (randomAqi > 100) status = "moderate";
							
							cities.push({
								id: cities.length + 1,
								name: cityName,
								aqi: randomAqi,
								status,
								cityId: cityId
							});
						}
					});
					setFavoriteCities(cities);
				}
			}
		};

		fetchData();
	}, [user, recentCities.length]);

	// Cập nhật danh sách thành phố đã xem gần đây từ dữ liệu recentCities
	useEffect(() => {
		if (recentCities.length > 0) {
			const viewedItems: ViewedItem[] = recentCities.map((city, index) => ({
				id: index + 1,
				name: city.name,
				time: city.formattedTime || "Vừa xong",
				slug: city.slug
			}));
			
			setRecentlyViewedItems(viewedItems);
		}
	}, [recentCities]);

	return (
		<>
			<Navbar />
			<div className="container mx-auto px-4 py-24 max-w-7xl">
				<h1 className="text-3xl font-bold mb-8 text-gray-800">Bảng điều khiển</h1>

				{/* Stats Overview */}
				<div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
					<StatCard
						title="Thành phố yêu thích"
						value={user?.favorites?.length || 0}
						icon={Heart}
						colorClass="bg-red-500"
						href="/dashboard/favorites"
					/>
					<StatCard
						title="Đã xem gần đây"
						value={recentCities.length || 0}
						icon={Clock}
						colorClass="bg-blue-500"
						href="/dashboard/history"
					/>
				</div>

				{/* Main Content */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					<div className="lg:col-span-1">
						<UserAccount user={user} />
					</div>
					<div className="lg:col-span-2">
						<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
							<FavoriteCities cities={favoriteCities.length > 0 ? favoriteCities : data.favoritesCities} />
							<RecentlyViewed items={recentlyViewedItems.length > 0 ? recentlyViewedItems : data.recentlyViewed} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
} 