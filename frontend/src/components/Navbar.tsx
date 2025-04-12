"use client";

import Link from "next/link";
import UserMenu from "./auth/UserMenu";
import AdminMenu from "./auth/AdminMenu";
import { useAuthContext } from "@/context/AuthContext";
import { Search, ListFilter } from "lucide-react";

const Navbar = () => {
	const { user, isAuthenticated } = useAuthContext();
	const isAdmin = user?.role === "admin";

	return (
		<nav className="bg-white border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					{/* Logo và tên sản phẩm */}
					<div className="flex-shrink-0 flex items-center">
						<Link href="/" className="flex items-center">
							<span className="text-2xl font-bold text-blue-500">AirQuality</span>
						</Link>
					</div>

					{/* Navigation links - Desktop */}
					<div className="hidden md:flex md:items-center md:space-x-4">
						<Link 
							href="/air-quality"
							className="flex items-center text-gray-600 px-3 py-2 rounded-md hover:bg-gray-50"
						>
							<Search className="w-5 h-5 mr-2" />
							<span>Chất lượng không khí</span>
						</Link>
						
						<Link 
							href="/rankings"
							className="flex items-center text-gray-600 px-3 py-2 rounded-md hover:bg-gray-50"
						>
							<ListFilter className="w-5 h-5 mr-2" />
							<span>Xếp hạng</span>
						</Link>
						
						{/* Thanh tìm kiếm */}
						<div className="relative mx-4">
							<input
								type="text"
								placeholder="Tìm kiếm thành phố"
								className="w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
							<button className="absolute right-0 top-0 h-full px-3 bg-blue-500 text-white rounded-r-md">
								Tìm kiếm
							</button>
						</div>
					</div>

					{/* User dropdown */}
					<div className="flex items-center">
						{isAuthenticated ? (
							<UserMenu />
						) : (
							<div className="flex items-center space-x-3">
								{isAdmin ? (
									<AdminMenu />
								) : (
									<Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
										Đăng nhập
									</Link>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
