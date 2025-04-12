"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import authService from "@/services/authService";
import { Settings, LogOut } from "lucide-react";

const AdminMenu = () => {
	const router = useRouter();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Click outside để đóng menu
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	const handleLogout = () => {
		authService.logout();
		setIsMenuOpen(false);
		router.push("/");
		router.refresh();
	};

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={toggleMenu}
				className="flex items-center text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
			>
				Admin System <span className="ml-1">▼</span>
			</button>

			{isMenuOpen && (
				<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
					<div className="px-4 py-2 border-b">
						<div className="font-medium text-gray-900">
							Admin System
						</div>
						<div className="text-xs text-gray-500">admin@gmail.com</div>
					</div>

					<Link
						href="/admin"
						className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
						onClick={() => setIsMenuOpen(false)}
					>
						<Settings size={16} className="mr-2 text-blue-600" />
						<span>Quản lý hệ thống</span>
					</Link>

					<button
						onClick={handleLogout}
						className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
					>
						<LogOut size={16} className="mr-2" />
						<span>Đăng xuất</span>
					</button>
				</div>
			)}
		</div>
	);
};

export default AdminMenu; 