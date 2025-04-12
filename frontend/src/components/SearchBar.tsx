"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_CITIES, CITY_DATA } from "@/constants/cities";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";

interface SearchBarProps {
	defaultCity?: string;
	onSearch?: (city: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ defaultCity, onSearch }) => {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const searchContainerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Khởi tạo searchTerm khi component mount hoặc defaultCity thay đổi
	useEffect(() => {
		if (defaultCity) {
			setSearchTerm(defaultCity);
		}
	}, [defaultCity]);

	// Đảm bảo input luôn ở trạng thái có thể tương tác sau khi trang đã load
	useEffect(() => {
		// Đặt timeout để đảm bảo input có thể tương tác sau khi client-side render
		const timeoutId = setTimeout(() => {
			if (inputRef.current) {
				// Xóa thuộc tính readOnly và đảm bảo input không bị disabled
				inputRef.current.removeAttribute('readonly');
				inputRef.current.disabled = false;
			}
		}, 300);

		return () => clearTimeout(timeoutId);
	}, []);

	// Thêm một MutationObserver để phát hiện và sửa các thay đổi thuộc tính trên input
	useEffect(() => {
		if (!inputRef.current) return;

		// Tạo một observer để theo dõi các thay đổi thuộc tính
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.attributeName === 'readonly' || mutation.attributeName === 'disabled') {
					// Xóa các thuộc tính hạn chế khi chúng xuất hiện
					if (inputRef.current) {
						inputRef.current.removeAttribute('readonly');
						inputRef.current.disabled = false;
					}
				}
			});
		});

		// Cấu hình và bắt đầu observer
		observer.observe(inputRef.current, { attributes: true });

		// Cleanup
		return () => observer.disconnect();
	}, []);

	// Xử lý click outside để ẩn suggestions
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchContainerRef.current &&
				!searchContainerRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
				setIsFocused(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Xử lý tìm kiếm gợi ý
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchTerm(value);

		if (value.trim()) {
			const filtered = SUPPORTED_CITIES.filter((city) =>
				city.toLowerCase().includes(value.toLowerCase())
			);
			setSuggestions(filtered);
			setShowSuggestions(true);
		} else {
			setSuggestions([]);
			setShowSuggestions(false);
		}
	};

	// Xử lý khi chọn một gợi ý
	const handleSuggestionClick = (city: string) => {
		setSearchTerm(city);
		setShowSuggestions(false);
		handleCitySelect(city);
	};

	// Xử lý phím tắt
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && searchTerm.trim()) {
			handleCitySelect(searchTerm);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchTerm.trim()) {
			handleCitySelect(searchTerm);
		}
	};

	const handleCitySelect = (city: string) => {
		// Kiểm tra khớp chính xác trước
		const exactMatch = SUPPORTED_CITIES.find(
			(c) => c.toLowerCase() === city.toLowerCase()
		);

		if (exactMatch) {
			if (onSearch) {
				onSearch(exactMatch);
			} else {
				// Lấy slug từ CITY_DATA thay vì tạo mới để đảm bảo URL đúng
				const cityData = CITY_DATA[exactMatch];
				if (cityData && cityData.slug) {
					router.push(`/city/${cityData.slug}`);
				}
			}
			return;
		}

		// Nếu không khớp chính xác, tìm kiếm thành phố chứa từ khóa
		const partialMatches = SUPPORTED_CITIES.filter(
			(c) => c.toLowerCase().includes(city.toLowerCase())
		);

		if (partialMatches.length === 1) {
			// Nếu chỉ có một kết quả, chuyển đến trang đó
			if (onSearch) {
				onSearch(partialMatches[0]);
			} else {
				// Lấy slug từ CITY_DATA thay vì tạo mới
				const cityData = CITY_DATA[partialMatches[0]];
				if (cityData && cityData.slug) {
					router.push(`/city/${cityData.slug}`);
				}
			}
		} else if (partialMatches.length > 1) {
			// Nếu có nhiều kết quả, hiển thị gợi ý
			setSuggestions(partialMatches);
			setShowSuggestions(true);
		} else {
			// Không tìm thấy kết quả nào
			setSuggestions([]);
			setShowSuggestions(false);
			alert("Không tìm thấy thành phố. Vui lòng thử tên thành phố khác.");
		}
	};

	const clearSearch = () => {
		setSearchTerm("");
		setSuggestions([]);
		setShowSuggestions(false);
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	// Khi trang đã load hoàn chỉnh, mở khóa input
	const unlockInput = () => {
		// Đảm bảo input không bị readOnly khi người dùng tương tác
		if (inputRef.current) {
			inputRef.current.removeAttribute('readonly');
			inputRef.current.disabled = false;
			inputRef.current.focus();
		}
	};

	return (
		<div
			className="w-full max-w-2xl mx-auto relative mt-1 mb-1"
			ref={searchContainerRef}
		>
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
			>
				<form onSubmit={handleSubmit} className="relative">
					<div
						className={`relative flex items-center transition-all duration-300 ${
							isFocused ? "scale-102" : ""
						}`}
					>
						<input
							ref={inputRef}
							type="text"
							value={searchTerm}
							onChange={handleInputChange}
							onKeyDown={handleKeyDown}
							onFocus={() => {
								unlockInput();
								setShowSuggestions(searchTerm.trim() !== "");
								setIsFocused(true);
							}}
							onClick={() => {
								unlockInput();
								setIsFocused(true);
								if (searchTerm.trim() !== "") {
									setShowSuggestions(true);
								}
							}}
							placeholder="Tìm kiếm thành phố"
							className="w-full px-4 py-2 pr-28 text-sm rounded-full border border-gray-200 
							focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-500
							transition-all duration-300 bg-white text-gray-800"
							autoComplete="off"
						/>
						{searchTerm && (
							<button
								type="button"
								onClick={clearSearch}
								className="absolute right-24 text-gray-400 hover:text-gray-600 transition-colors"
							>
								<X size={16} />
							</button>
						)}
						<motion.button
							type="submit"
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
							className="absolute right-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full
							hover:from-blue-600 hover:to-blue-700 transition-all duration-300
							focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
							disabled:opacity-50 disabled:cursor-not-allowed
							flex items-center space-x-1 text-xs"
							disabled={!searchTerm.trim()}
						>
							<span>Tìm kiếm</span>
						</motion.button>
					</div>

					{/* Suggestions Dropdown */}
					<AnimatePresence>
						{showSuggestions && (
							<motion.div
								initial={{ opacity: 0, y: -5 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -5 }}
								transition={{ duration: 0.2 }}
								className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 
								max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
							>
								{suggestions.length > 0 ? (
									suggestions.map((city, index) => (
										<motion.div
											key={index}
											onClick={() => handleSuggestionClick(city)}
											className="px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors
											flex items-center group border-b border-gray-50 last:border-b-0"
											whileHover={{ backgroundColor: "#EBF5FF" }}
										>
											<div className="p-1.5 rounded-full bg-blue-100 text-blue-600 mr-2 group-hover:bg-blue-200 transition-colors">
												<MapPin size={14} />
											</div>
											<span className="text-gray-700 group-hover:text-blue-600 text-sm font-medium transition-colors">
												{city}
											</span>
										</motion.div>
									))
								) : (
									<div className="px-4 py-3 text-sm text-gray-500 text-center">
										Không tìm thấy thành phố nào phù hợp. Vui lòng thử lại.
									</div>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</form>
			</motion.div>
		</div>
	);
};

export default SearchBar;
