"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import authService from "@/services/authService";

// Định nghĩa kiểu dữ liệu cho user
interface UserData {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	favorites: string[];
	isEmailVerified?: boolean;
	status?: string;
}

const UserMenu = () => {
	const router = useRouter();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [user, setUser] = useState<UserData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Kiểm tra nếu đã đăng nhập
		const userData = authService.getUser();
		setUser(userData);
		setIsLoading(false);

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
		setUser(null);
		setIsMenuOpen(false);
		router.push("/");
		router.refresh();
	};

	if (isLoading) {
		return (
			<div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
		);
	}

	if (!user) {
		return (
			<div className="flex items-center space-x-2">
				<Link
					href="/login"
					className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
				>
					Đăng nhập
				</Link>
				<Link
					href="/register"
					className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
				>
					Đăng ký
				</Link>
			</div>
		);
	}

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={toggleMenu}
				className="flex items-center space-x-2 focus:outline-none"
			>
				<div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
					{user.firstName.charAt(0)}
				</div>
				<span className="hidden md:inline text-sm font-medium">
					{user.firstName}
				</span>
			</button>

			{isMenuOpen && (
				<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
					<div className="px-4 py-2 border-b">
						<div className="font-medium">
							{user.firstName} {user.lastName}
						</div>
						<div className="text-sm text-gray-500">{user.email}</div>
					</div>

					<Link
						href="/profile"
						className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
						onClick={() => setIsMenuOpen(false)}
					>
						Thông tin cá nhân
					</Link>

					<Link
						href="/favorites"
						className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
						onClick={() => setIsMenuOpen(false)}
					>
						Thành phố yêu thích
					</Link>

					{user.role === "admin" && (
						<Link
							href="/admin"
							className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
							onClick={() => setIsMenuOpen(false)}
						>
							Quản trị
						</Link>
					)}

					<button
						onClick={handleLogout}
						className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
					>
						Đăng xuất
					</button>
				</div>
			)}
		</div>
	);
};

export default UserMenu;
