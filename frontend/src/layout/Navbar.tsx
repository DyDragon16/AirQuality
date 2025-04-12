"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Menu,
	X,
	Home,
	Search,
	Book,
	User,
	LogIn,
	LogOut,
	ChevronDown,
	Settings,
	BarChart2,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import SearchBar from "@/components/SearchBar";
import { useRouter } from "next/navigation";
import { CITY_DATA } from "@/constants/cities";
import AdminDropdown from "@/components/auth/AdminDropdown";

export const Navbar = () => {
	const { isAuthenticated, logout, user } = useAuthContext();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const router = useRouter();
	const userMenuRef = useRef<HTMLDivElement>(null);

	// Phát hiện scroll để thay đổi kiểu navbar
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Xử lý click bên ngoài để đóng dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
				setIsUserMenuOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const toggleUserMenu = () => {
		setIsUserMenuOpen(!isUserMenuOpen);
	};

	const handleCitySelected = (cityName: string) => {
		const cityData = CITY_DATA[cityName];
		if (cityData) {
			router.push(`/city/${cityData.slug}`);
		}
	};

	// Danh sách các mục menu với icon
	const menuItems = [
		{ href: "/", label: "Trang chủ", icon: Home },
		{ href: "/air-quality", label: "Chất lượng không khí", icon: Search },
		{ href: "/rankings", label: "Xếp hạng", icon: Book },
	];

	// Thêm menu vào allMenuItems
	const allMenuItems = (() => {
		const items = [...menuItems];
		return items;
	})();

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
				scrolled ? "bg-white/90 backdrop-blur-md" : "bg-white"
			}`}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-14">
					<div className="flex items-center">
						{/* Logo */}
						<Link href="/" className="flex-shrink-0 flex items-center group">
							<motion.span
								whileHover={{ scale: 1.05 }}
								className="bg-gradient-to-r from-[#4dabf7] to-[#2196f3] text-transparent bg-clip-text 
								text-2xl font-bold tracking-tight transition-colors"
							>
								AirQuality
							</motion.span>
						</Link>

						{/* Navigation Links - Desktop */}
						<div className="hidden md:ml-10 md:flex md:space-x-6">
							{allMenuItems.map((item) => {
								const Icon = item.icon;
								return item.href === "/" ? null : (
									<Link key={item.href} href={item.href} className="group">
										<motion.div
											className="relative px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600
											flex items-center space-x-1.5 group"
											whileHover={{ y: -2 }}
											transition={{ type: "spring", stiffness: 300 }}
										>
											<Icon
												size={16}
												className="text-blue-500 group-hover:text-blue-600"
											/>
											<span>{item.label}</span>
											<span
												className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-500 
											group-hover:w-full transition-all duration-300"
											></span>
										</motion.div>
									</Link>
								);
							})}
						</div>
						
						{/* Search bar positioned next to navigation links */}
						<div className="hidden md:flex items-center max-w-xs ml-6 mt-1">
							<div className="w-full rounded-full">
								<SearchBar onSearch={handleCitySelected} />
							</div>
						</div>
					</div>

					{/* Right side - Login/Logout button */}
					<div className="flex items-center space-x-4">
						{isAuthenticated ? (
							<div className="flex items-center space-x-4" ref={userMenuRef}>
								{user?.role === "admin" ? (
									<AdminDropdown />
								) : (
									<div 
										className="hidden md:flex text-gray-700 items-center cursor-pointer relative"
										onClick={toggleUserMenu}
									>
										<User size={16} className="mr-2 text-blue-500" />
										<span>{user?.firstName} {user?.lastName}</span>
										<ChevronDown size={14} className="ml-1 text-gray-500" />
										
										{/* User dropdown menu - only shown for non-admin users */}
										{isUserMenuOpen && (
											<div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50">
												<div className="px-4 py-2 border-b">
													<div className="font-medium text-gray-900">
														{user?.firstName} {user?.lastName}
													</div>
													<div className="text-xs text-gray-900">{user?.email}</div>
												</div>
												
												<Link
													href="/dashboard"
													className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
													onClick={() => setIsUserMenuOpen(false)}
												>
													<BarChart2 size={16} className="mr-2 text-blue-500" />
													Bảng điều khiển
												</Link>
												
												<button
													onClick={logout}
													className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
												>
													<LogOut size={16} className="mr-2" />
													Đăng xuất
												</button>
											</div>
										)}
									</div>
								)}
								
								{/* Mobile logout button */}
								<div className="md:hidden">
									<motion.button
										onClick={logout}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 
										rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20
										flex items-center space-x-2 hover:from-red-500 hover:to-red-400"
									>
										<LogOut size={16} />
										<span>Đăng xuất</span>
									</motion.button>
								</div>
							</div>
						) : (
							<div className="flex items-center space-x-2">
								<Link href="/login">
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#228be6] to-[#0c7cd5] 
										rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20
										flex items-center space-x-2 hover:from-[#339af0] hover:to-[#228be6]"
									>
										<LogIn size={16} />
										<span>Đăng nhập</span>
									</motion.button>
								</Link>
							</div>
						)}

						{/* Mobile menu button */}
						<div className="flex items-center md:hidden">
							<motion.button
								type="button"
								onClick={toggleMenu}
								className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 
								hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none"
								whileTap={{ scale: 0.95 }}
								aria-controls="mobile-menu"
								aria-expanded={isMenuOpen}
							>
								<span className="sr-only">Mở menu</span>
								{isMenuOpen ? (
									<X className="h-6 w-6" />
								) : (
									<Menu className="h-6 w-6" />
								)}
							</motion.button>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			<AnimatePresence>
				{isMenuOpen && (
					<motion.div
						id="mobile-menu"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className="md:hidden overflow-hidden bg-white"
					>
						<motion.div
							className="px-3 pt-3 pb-4 space-y-1"
							initial="hidden"
							animate="visible"
							variants={{
								hidden: { opacity: 0 },
								visible: {
									opacity: 1,
									transition: {
										staggerChildren: 0.07,
									},
								},
							}}
						>
							{/* Mobile search bar */}
							<div className="px-4 py-2">
								<SearchBar onSearch={handleCitySelected} />
							</div>
							
							{allMenuItems.map((item) => {
								const Icon = item.icon;
								return (
									<motion.div
										key={item.href}
										variants={{
											hidden: { opacity: 0, x: -20 },
											visible: { opacity: 1, x: 0 },
										}}
									>
										<Link
											href={item.href}
											className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700
											hover:text-blue-600 hover:bg-blue-50 transition-colors"
											onClick={() => setIsMenuOpen(false)}
										>
											<Icon size={18} className="text-blue-500" />
											<span>{item.label}</span>
										</Link>
									</motion.div>
								);
							})}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</nav>
	);
};
