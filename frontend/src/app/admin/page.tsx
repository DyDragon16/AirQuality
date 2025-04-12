"use client";

import { useState, useEffect } from "react";
import {
	Users,
	Map,
	ArrowUp,
	ArrowDown,
	AlertTriangle,
} from "lucide-react";
import { Navbar } from "@/layout/Navbar";
import { dashboardService, DashboardStats, Alert, CityRanking } from "@/services/dashboardService";
// Định nghĩa các interface
interface StatCardProps {
	title: string;
	value: number;
	icon: React.ElementType;
	colorClass: string;
}

// Component cho các thẻ thống kê
const StatCard = ({ title, value, icon, colorClass }: StatCardProps) => {
	const Icon = icon;

	return (
		<div className="rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-gray-500">{title}</p>
					<h3 className="mt-2 text-3xl font-bold text-gray-800">
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
	);
};

// Component cho bảng cảnh báo gần đây
const RecentAlerts = ({ alerts }: { alerts: Alert[] }) => {
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;
	
	// Tính toán các cảnh báo hiển thị trên trang hiện tại
	const indexOfLastAlert = currentPage * itemsPerPage;
	const indexOfFirstAlert = indexOfLastAlert - itemsPerPage;
	const currentAlerts = alerts.slice(indexOfFirstAlert, indexOfLastAlert);
	
	// Tính tổng số trang
	const totalPages = Math.ceil(alerts.length / itemsPerPage);
	
	// Xử lý chuyển trang
	const handlePageChange = (newPage: number) => {
		if (newPage < 1 || newPage > totalPages) return;
		setCurrentPage(newPage);
	};
	
	// Hàm lấy màu và class dựa trên mức cảnh báo
	const getAlertColor = (level: string) => {
		switch (level) {
			case 'hazardous':
				return 'bg-purple-100 text-purple-600';
			case 'very-unhealthy':
				return 'bg-pink-100 text-pink-600';
			case 'unhealthy':
				return 'bg-red-100 text-red-600';
			case 'unhealthy-sensitive':
				return 'bg-orange-100 text-orange-600';
			case 'moderate':
				return 'bg-amber-100 text-amber-600';
			default:
				return 'bg-green-100 text-green-600';
		}
	};
	
	// Hàm lấy tên mức cảnh báo
	const getAlertLevelName = (level: string) => {
		switch (level) {
			case 'hazardous':
				return 'Nguy hiểm';
			case 'very-unhealthy':
				return 'Rất kém';
			case 'unhealthy':
				return 'Kém';
			case 'unhealthy-sensitive':
				return 'Kém cho nhóm nhạy cảm';
			case 'moderate':
				return 'Trung bình';
			default:
				return 'Tốt';
		}
	};

	return (
		<div className="rounded-lg bg-white p-6 shadow-md">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-gray-800">
					Cảnh báo gần đây
				</h2>
				<span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">
					{alerts.length} cảnh báo
				</span>
			</div>

			<div className="divide-y divide-gray-200">
				{currentAlerts.map((alert: Alert, index: number) => (
					<div key={index} className="py-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<AlertTriangle
									size={18}
									className={alert.level === 'hazardous' || alert.level === 'very-unhealthy' || alert.level === 'unhealthy' 
									  ? "text-red-500" 
										: alert.level === 'unhealthy-sensitive' || alert.level === 'moderate'
										? "text-amber-500"
										: "text-green-500"
									}
								/>
								<span className="ml-2 font-medium text-gray-800">
									{alert.city}
								</span>
							</div>
							<span
								className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getAlertColor(alert.level)}`}
							>
								AQI: {alert.aqi}
							</span>
						</div>
						<div className="mt-1 flex items-center justify-between">
							<p className="text-xs text-gray-500">{alert.time}</p>
							<span className="text-xs font-medium text-gray-500">
								{getAlertLevelName(alert.level)}
							</span>
						</div>
					</div>
				))}
			</div>
			
			{/* Phân trang */}
			{totalPages > 1 && (
				<div className="mt-4 flex items-center justify-center">
					<div className="flex items-center space-x-2">
						<button
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
							className={`rounded px-3 py-1 text-sm font-medium ${
								currentPage === 1
									? "cursor-not-allowed text-gray-400"
									: "text-blue-600 hover:bg-blue-50"
							}`}
						>
							&laquo; Trước
						</button>
						
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<button
								key={page}
								onClick={() => handlePageChange(page)}
								className={`rounded px-3 py-1 text-sm font-medium ${
									currentPage === page
										? "bg-blue-600 text-white"
										: "text-blue-600 hover:bg-blue-50"
								}`}
							>
								{page}
							</button>
						))}
						
						<button
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							className={`rounded px-3 py-1 text-sm font-medium ${
								currentPage === totalPages
									? "cursor-not-allowed text-gray-400"
									: "text-blue-600 hover:bg-blue-50"
							}`}
						>
							Sau &raquo;
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

// Component cho bảng xếp hạng thành phố với phân trang
const CityRankingTable = ({ cities }: { cities: CityRanking[] }) => {
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 7;
	
	// Tính toán các thành phố hiển thị trên trang hiện tại
	const indexOfLastCity = currentPage * itemsPerPage;
	const indexOfFirstCity = indexOfLastCity - itemsPerPage;
	const currentCities = cities.slice(indexOfFirstCity, indexOfLastCity);
	
	// Tính tổng số trang
	const totalPages = Math.ceil(cities.length / itemsPerPage);
	
	// Xử lý chuyển trang
	const handlePageChange = (newPage: number) => {
		if (newPage < 1 || newPage > totalPages) return;
		setCurrentPage(newPage);
	};
	
	// Hàm lấy màu và class dựa trên trạng thái
	const getStatusColorClass = (status: string) => {
		switch (status) {
			case 'hazardous':
				return 'bg-purple-100 text-purple-600';
			case 'very-unhealthy':
				return 'bg-pink-100 text-pink-600';
			case 'unhealthy':
				return 'bg-red-100 text-red-600';
			case 'unhealthy-sensitive':
				return 'bg-orange-100 text-orange-600';
			case 'moderate':
				return 'bg-amber-100 text-amber-600';
			default:
				return 'bg-green-100 text-green-600';
		}
	};
	
	// Hàm lấy tên trạng thái
	const getStatusName = (status: string) => {
		switch (status) {
			case 'hazardous':
				return 'Nguy hiểm';
			case 'very-unhealthy':
				return 'Rất kém';
			case 'unhealthy':
				return 'Kém';
			case 'unhealthy-sensitive':
				return 'Kém cho nhóm nhạy cảm';
			case 'moderate':
				return 'Trung bình';
			default:
				return 'Tốt';
		}
	};

	return (
		<div className="rounded-lg bg-white p-6 shadow-md">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-gray-800">
					Xếp hạng chất lượng không khí
				</h2>
				<span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">
					{cities.length} thành phố
				</span>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full table-auto">
					<thead>
						<tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500">
							<th className="pb-3 pl-2">#</th>
							<th className="pb-3">Thành phố</th>
							<th className="pb-3 text-center">AQI</th>
							<th className="pb-3 text-center">Trạng thái</th>
							<th className="pb-3 text-center">Xu hướng</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{currentCities.map((city: CityRanking, index: number) => (
							<tr key={index} className="text-sm">
								<td className="py-3 pl-2 font-medium text-gray-800">
									{indexOfFirstCity + index + 1}
								</td>
								<td className="py-3 font-medium text-gray-800">{city.name}</td>
								<td className="py-3 text-center font-medium text-gray-800">
									{city.aqi}
								</td>
								<td className="py-3 text-center">
									<span
										className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColorClass(city.status)}`}
									>
										{getStatusName(city.status)}
									</span>
								</td>
								<td className="py-3 text-center">
									{city.change === "up" ? (
										<ArrowUp size={16} className="mx-auto text-red-500" />
									) : city.change === "down" ? (
										<ArrowDown size={16} className="mx-auto text-green-500" />
									) : (
										<span className="mx-auto text-gray-400">―</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			
			{/* Phân trang */}
			{totalPages > 1 && (
				<div className="mt-4 flex items-center justify-center">
					<div className="flex items-center space-x-2">
						<button
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
							className={`rounded px-3 py-1 text-sm font-medium ${
								currentPage === 1
									? "cursor-not-allowed text-gray-400"
									: "text-blue-600 hover:bg-blue-50"
							}`}
						>
							&laquo; Trước
						</button>
						
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<button
								key={page}
								onClick={() => handlePageChange(page)}
								className={`rounded px-3 py-1 text-sm font-medium ${
									currentPage === page
										? "bg-blue-600 text-white"
										: "text-blue-600 hover:bg-blue-50"
								}`}
							>
								{page}
							</button>
						))}
						
						<button
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							className={`rounded px-3 py-1 text-sm font-medium ${
								currentPage === totalPages
									? "cursor-not-allowed text-gray-400"
									: "text-blue-600 hover:bg-blue-50"
							}`}
						>
							Sau &raquo;
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default function AdminDashboard() {
	const [stats, setStats] = useState<DashboardStats>({
		totalUsers: 0,
		totalCities: 0,
		totalMeasurements: 0,
		totalAlerts: 0
	});
	const [alerts, setAlerts] = useState<Alert[]>([]);
	const [cityRanking, setCityRanking] = useState<CityRanking[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Lấy dữ liệu từ API thực tế
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);
				
				// Lấy dữ liệu tuần tự thay vì dùng Promise.all
				try {
					console.log("Đang lấy dữ liệu thống kê...");
					const statsData = await dashboardService.getDashboardStats();
					setStats(statsData);
				} catch (err) {
					console.error("Lỗi khi lấy dữ liệu thống kê:", err);
				}
				
				try {
					console.log("Đang lấy dữ liệu cảnh báo...");
					const alertsData = await dashboardService.getRecentAlerts();
					setAlerts(alertsData);
				} catch (err) {
					console.error("Lỗi khi lấy dữ liệu cảnh báo:", err);
				}
				
				try {
					console.log("Đang lấy dữ liệu xếp hạng thành phố...");
					const rankingData = await dashboardService.getCityRanking(0);
					setCityRanking(rankingData);
				} catch (err) {
					console.error("Lỗi khi lấy dữ liệu xếp hạng thành phố:", err);
				}
			} catch (err) {
				console.error("Lỗi tổng thể khi lấy dữ liệu dashboard:", err);
				setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	return (
		<>
			<Navbar />
			<div>
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-gray-800">Bảng điều khiển</h1>
				</div>

				{loading ? (
					<div className="flex items-center justify-center py-20">
						<div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
						<span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
					</div>
				) : error ? (
					<div className="rounded-md bg-red-50 p-4 text-red-800">
						{error}
					</div>
				) : (
					<>
						{/* Stats Cards */}
						<div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
							<StatCard
								title="Tổng người dùng"
								value={stats.totalUsers}
								icon={Users}
								colorClass="bg-blue-600"
							/>
							<StatCard
								title="Tổng thành phố"
								value={stats.totalCities}
								icon={Map}
								colorClass="bg-green-600"
							/>
							<StatCard
								title="Tổng cảnh báo"
								value={alerts.length || stats.totalAlerts}
								icon={AlertTriangle}
								colorClass="bg-red-600"
							/>
						</div>

						{/* Charts & Tables */}
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
							<RecentAlerts alerts={alerts} />
							<CityRankingTable cities={cityRanking} />
						</div>
					</>
				)}
			</div>
		</>
	);
}
