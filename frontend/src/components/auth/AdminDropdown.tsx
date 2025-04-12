"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

const AdminDropdown = () => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { logout, user } = useAuthContext();
	const router = useRouter();

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div className="relative z-40" ref={dropdownRef}>
			<button
				onClick={toggleDropdown}
				className="flex items-center text-gray-700 cursor-pointer"
			>
				<span className="text-blue-600 font-medium">Admin System</span>
				<ChevronDown size={14} className="ml-1 text-gray-500" />
			</button>
			
			{isOpen && (
				<div className="absolute top-full right-0 mt-1 w-52 bg-white rounded-md shadow-xl py-1 z-50">
					<div className="px-4 py-3 border-b">
						<div className="font-medium text-gray-900">
							Admin System
						</div>
						<div className="text-xs text-gray-500 mt-1">{user?.email}</div>
					</div>
					
					<Link
						href="/admin"
						className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
						onClick={() => setIsOpen(false)}
					>
						<Settings size={16} className="mr-3 text-blue-500" />
						Quản lý hệ thống
					</Link>
					
					<button
						onClick={() => {
							logout();
							router.push('/');
						}}
						className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100 flex items-center"
					>
						<LogOut size={16} className="mr-3" />
						Đăng xuất
					</button>
				</div>
			)}
		</div>
	);
};

export default AdminDropdown; 