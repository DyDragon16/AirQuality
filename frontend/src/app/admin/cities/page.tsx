"use client";

import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { Navbar } from "@/layout/Navbar";
import cityService, { City } from "@/services/cityService";
import { format } from "date-fns";
import Toast from "@/components/ui/Toast";
import { dashboardService } from "@/services/dashboardService";
import { getAQIGradient, getAQIText } from "@/utils/aqi";

export default function CitiesPage() {
	const [cities, setCities] = useState<City[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error" | "info";
	} | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(8);

	// Lấy danh sách thành phố từ API
	useEffect(() => {
		const fetchCities = async () => {
			try {
				setLoading(true);
				setError(null);
				console.log("Bắt đầu tải dữ liệu thành phố...");
				
				// Chỉ sử dụng dashboardService để lấy dữ liệu xếp hạng chính xác từ API weather/ranking
				const rankingData = await dashboardService.getCityRanking(0);
				console.log("Dữ liệu xếp hạng nhận được:", rankingData);
				
				if (rankingData && rankingData.length > 0) {
					// Chuyển đổi dữ liệu từ ranking thành định dạng City
					const citiesWithDetails = rankingData.map((ranking, index) => {
						// Debug
						console.log(`Thành phố từ ranking: ${ranking.name}, AQI: ${ranking.aqi}, status: ${ranking.status}`);
						
						// Tạo ID duy nhất bằng cách thêm index
						return {
							id: `${ranking.name.toLowerCase().replace(/\s+/g, '-')}-${index}`, // Thêm index vào ID để tránh trùng lặp
							name: ranking.name,
							slug: ranking.name.toLowerCase().replace(/\s+/g, '-'),
							aqi: ranking.aqi,
							status: ranking.status,
							lastUpdate: format(new Date(), "dd/MM/yyyy") // Ngày hiện tại
						} as City;
					});
					
					console.log("Dữ liệu thành phố đã xử lý:", citiesWithDetails);
					setCities(citiesWithDetails);
				} else {
					console.log("Không có dữ liệu thành phố được trả về từ API");
					
					// Thử lấy dữ liệu từ API cities nếu không có dữ liệu từ ranking
					const citiesData = await cityService.getAllCities();
					if (citiesData && citiesData.length > 0) {
						const processedCities = citiesData.map((city, index) => {
							const aqi = city.aqi ? Number(city.aqi) : 0;
							let status = city.status || '';
							
							if (!status && aqi > 0) {
								status = cityService.getStatusFromAQI(aqi);
							}
							
							return {
								...city,
								id: city.id || `city-${index}-${Date.now()}`, // Đảm bảo ID là duy nhất bằng cách thêm index và timestamp
								aqi,
								lastUpdate: format(new Date(city.lastUpdated || new Date()), "dd/MM/yyyy"),
								status: status || 'unknown'
							};
						});
						
						setCities(processedCities);
					} else {
						setError("Không thể kết nối đến máy chủ hoặc không có dữ liệu thành phố. Vui lòng thử lại sau.");
						setCities([]);
					}
				}
			} catch (err: unknown) {
				console.error("Chi tiết lỗi khi tải dữ liệu thành phố:", err);
				
				setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.");
				setCities([]);
				
				// Hiển thị thông báo lỗi
				setToast({
					message: "Lỗi kết nối mạng khi tải dữ liệu thành phố. Vui lòng thử lại sau.",
					type: "error"
				});
			} finally {
				setLoading(false);
			}
		};

		fetchCities();
	}, []);

	// Lọc thành phố theo từ khóa tìm kiếm và loại bỏ các thành phố trùng lặp
	const uniqueCities = Array.from(
		new Map(cities.map(city => [city.name, city])).values()
	);
	
	const filteredCities = uniqueCities.filter((city) =>
		city.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Tính toán phân trang
	const totalPages = Math.ceil(filteredCities.length / itemsPerPage);
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = filteredCities.slice(indexOfFirstItem, indexOfLastItem);

	// Hàm chuyển trang
	const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
	const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
	const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

	// Hàm xử lý tìm kiếm và đặt lại trang về 1
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
	};

	return (
		<div>
			<Navbar />
			{/* Toast notification */}
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}
			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-800">
						Quản lý thành phố
					</h1>
				</div>
			</div>

			{/* Hiển thị thông báo lỗi nếu có */}
			{error && (
				<div className="mb-4 rounded-md bg-red-50 p-4 text-red-600">
					<p>{error}</p>
				</div>
			)}

			{/* Tìm kiếm */}
			<div className="mb-6 w-full max-w-md">
				<div className="relative">
					<input
						type="text"
						placeholder="Tìm kiếm thành phố..."
						className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 pl-10 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						value={searchTerm}
						onChange={handleSearch}
					/>
					<Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
				</div>
			</div>

			{/* Hiển thị loading */}
			{loading ? (
				<div className="flex items-center justify-center py-10">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
					<span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
				</div>
			) : (
				/* Bảng thành phố */
				<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
					<div className="overflow-x-auto">
						<table className="w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>
										Thành phố
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
									>
										AQI
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
									>
										Cập nhật lần cuối
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>
										Trạng thái
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 bg-white">
								{currentItems.length > 0 ? (
									currentItems.map((city, index) => (
										<tr key={`city-item-${index}-${city.name.replace(/\s+/g, '-')}`} className="hover:bg-gray-50">
											<td className="whitespace-nowrap px-6 py-4">
												<div className="flex items-center">
													<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500">
														<MapPin size={14} />
													</div>
													<div className="ml-3">
														<div className="text-sm font-medium text-gray-900">
															{city.name}
														</div>
													</div>
												</div>
											</td>
											<td className="whitespace-nowrap px-6 py-4 text-center text-sm text-black-500">
												{city.aqi ? (
													<span
														className={`rounded-full px-2 py-1 text-xs font-semibold leading-4 ${getAQIGradient(Number(city.aqi))}`}
													>
														{city.aqi}
													</span>
												) : (
													"-"
												)}
											</td>
											<td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
												{city.lastUpdate}
											</td>
											<td className="whitespace-nowrap px-6 py-4">
												<span
													className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
														city.status === "good"
															? "bg-green-100 text-green-800"
															: city.status === "moderate"
															? "bg-yellow-100 text-yellow-800"
															: city.status === "warning" || city.status === "unhealthy" || city.status === "unhealthy-sensitive"
															? "bg-orange-100 text-orange-800"
															: city.status === "danger" || city.status === "very-unhealthy" || city.status === "hazardous"
															? "bg-red-100 text-red-800"
															: "bg-gray-100 text-gray-800"
													}`}
												>
													{city.status ? cityService.getStatusLabel(city.status) : getAQIText(Number(city.aqi) || 0)}
												</span>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={4} className="px-6 py-4 text-center text-gray-500">
											{error ? "Lỗi khi tải dữ liệu" : "Không tìm thấy thành phố nào"}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Phân trang */}
					<div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
						<div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
							<div>
								<p className="text-sm text-gray-700">
									Hiển thị <span className="font-medium">{filteredCities.length > 0 ? indexOfFirstItem + 1 : 0}</span> đến{" "}
									<span className="font-medium">{Math.min(indexOfLastItem, filteredCities.length)}</span>{" "}
									trong{" "}
									<span className="font-medium">{filteredCities.length}</span> kết
									quả
								</p>
							</div>
							<div>
								<nav
									className="isolate inline-flex -space-x-px rounded-md shadow-sm"
									aria-label="Pagination"
								>
									<button
										className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
										onClick={goToPrevPage}
										disabled={currentPage === 1 || totalPages === 0}
									>
										Trước
									</button>
									{Array.from({ length: totalPages }, (_, i) => (
										<button
											key={i + 1}
											onClick={() => paginate(i + 1)}
											aria-current={currentPage === i + 1 ? "page" : undefined}
											className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
												currentPage === i + 1
													? "z-10 border-blue-500 bg-blue-50 text-blue-600"
													: "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
											}`}
										>
											{i + 1}
										</button>
									))}
									<button
										className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
										onClick={goToNextPage}
										disabled={currentPage === totalPages || totalPages === 0}
									>
										Sau
									</button>
								</nav>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
