"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Users,
	Map,
	BarChart2,
	Menu,
	X,
	AlignJustify,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";


const AdminSidebar = () => {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const pathname = usePathname();
	const { user } = useAuthContext();

	const menuItems = [
		// { href: "/admin", label: "Tổng quan", icon: Home },
		{ href: "/admin/users", label: "Quản lý người dùng", icon: Users },
		{ href: "/admin/cities", label: "Quản lý thành phố", icon: Map },
		{ href: "/admin", label: "Thống kê", icon: BarChart2 },
	];

	const toggleSidebar = () => {
		setIsCollapsed(!isCollapsed);
	};

	const toggleMinimize = () => {
		setIsMinimized(!isMinimized);
	};

	const isActive = (path: string) => {
		return pathname === path;
	};

	return (
		<>
			{/* Mobile toggle button */}
			<button
				className="fixed top-16 left-4 z-50 rounded-md bg-blue-600 p-2 text-white shadow-md md:hidden"
				onClick={toggleSidebar}
			>
				{isCollapsed ? <Menu size={20} /> : <X size={20} />}
			</button>

			{/* Overlay for mobile */}
			{!isCollapsed && (
				<div
					className="fixed inset-0 z-40 bg-transparent md:hidden"
					onClick={toggleSidebar}
				></div>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed top-14 left-0 z-30 h-[calc(100%-56px)] transition-all duration-300 ${
					isCollapsed ? "-translate-x-full" : "translate-x-0"
				} md:translate-x-0 bg-white shadow-lg 
				${isMinimized ? "w-16" : "w-64"}`}
			>
				{/* Admin Info */}
				<div className="border-b border-gray-200 bg-blue-50 p-4">
					<div className="flex items-center justify-between">
						{!isMinimized ? (
							<>
								<div className="flex items-center flex-1 overflow-hidden">
									<div className="flex h-10 w-10 min-w-[40px] flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
										<Users size={18} />
									</div>
									<div className="ml-3 overflow-hidden">
										<p className="text-sm font-medium text-gray-900 truncate">
											{user?.firstName} {user?.lastName}
										</p>
										<p className="text-xs text-gray-600 truncate">{user?.email}</p>
									</div>
								</div>
								<button
									onClick={toggleMinimize}
									className="p-1 rounded-md hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0 ml-2"
								>
									<AlignJustify size={18} />
								</button>
							</>
						) : (
							<div className="flex flex-col items-center w-full px-1 py-1">
								<div className="flex h-10 w-10 min-w-[40px] flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white mb-2">
									<Users size={18} />
								</div>
								<button
									onClick={toggleMinimize}
									className="p-1 rounded-md hover:bg-gray-200 text-gray-600 transition-colors w-full flex justify-center"
								>
									<AlignJustify size={18} />
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Navigation */}
				<nav className={`mt-2 ${isMinimized ? 'p-1' : 'p-2'}`}>
					<ul className="space-y-1">
						{menuItems.map((item) => {
							const Icon = item.icon;
							return (
								<li key={item.href}>
									<Link
										href={item.href}
										className={`flex items-center rounded-md ${isMinimized ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium transition-colors ${
											isActive(item.href)
												? "bg-blue-100 text-blue-600"
												: "text-gray-700 hover:bg-gray-100"
										}`}
										onClick={() => {
											if (!isCollapsed) {
												setIsCollapsed(true);
											}
										}}
									>
										<Icon
											size={18}
											className={`${isMinimized ? '' : 'mr-3'} ${
												isActive(item.href) ? "text-blue-600" : "text-gray-500"
											}`}
										/>
										{!isMinimized && <span>{item.label}</span>}
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>
			</aside>
		</>
	);
};

export default AdminSidebar;
