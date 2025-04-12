"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import authService from "@/services/authService";
import axios, { AxiosError } from "axios";

// Thêm vào đầu file trước interface User
interface AuthInstance {
	checkAccountStatus: () => Promise<void>;
}

// Interface cho API Error Response
interface ApiErrorResponse {
	success: boolean;
	message: string;
	code?: string;
}

// Khai báo mở rộng cho Window
declare global {
	interface Window {
		__auth_instance?: AuthInstance;
	}
}

// Thêm interceptor để kiểm tra trạng thái tài khoản sau mỗi lần gọi API
if (typeof window !== "undefined") {
	// Tạo biến để theo dõi thời gian kiểm tra cuối cùng để tránh kiểm tra quá nhiều
	let lastCheckTime = 0;
	const CHECK_INTERVAL = 3000; // 3 giây
	
	// Thêm interceptor phản hồi cho mọi request API
	axios.interceptors.response.use(
		response => {
			const currentTime = Date.now();
			// Chỉ kiểm tra nếu đã qua khoảng thời gian tối thiểu
			if (currentTime - lastCheckTime > CHECK_INTERVAL) {
				// Lấy instance của hook từ global để truy cập các hàm
				const auth = window.__auth_instance;
				if (auth && auth.checkAccountStatus) {
					lastCheckTime = currentTime;
					// Gọi hàm kiểm tra ngay lập tức
					auth.checkAccountStatus();
				}
			}
			return response;
		},
		error => {
			// Kiểm tra nếu lỗi là do xác thực hoặc quyền truy cập
			if (error.response && (error.response.status === 401 || error.response.status === 403)) {
				const auth = window.__auth_instance;
				if (auth && auth.checkAccountStatus) {
					auth.checkAccountStatus();
				}
			}
			return Promise.reject(error);
		}
	);
}

interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	favorites: string[];
	hasPassword?: boolean;
	status?: "active" | "inactive" | "pending";
	isEmailVerified?: boolean;
}

// Import RegisterData type from the service
interface RegisterData {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

interface UseAuthReturn {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	isAccountDeleted: boolean;
	isAccountSuspended: boolean;
	isRoleChanged: boolean;
	hideAccountDeletedModal: () => void;
	hideAccountSuspendedModal: () => void;
	hideRoleChangedModal: () => void;
	login: (email: string, password: string) => Promise<void>;
	register: (userData: RegisterData) => Promise<void>;
	logout: () => void;
	addFavorite: (cityId: string) => Promise<void>;
	removeFavorite: (cityId: string) => Promise<void>;
	handleGoogleCallback: (token: string) => Promise<void>;
	updateProfile: (data: {
		firstName?: string;
		lastName?: string;
	}) => Promise<void>;
	updatePassword: (data: {
		currentPassword?: string;
		newPassword: string;
	}) => Promise<void>;
	getStoredPassword: () => string | null;
	checkAccountStatus: () => Promise<void>;
}

// Danh sách tài khoản admin mặc định cho testing
const adminUsers: User[] = [
	{
		id: "admin",
		email: "admin@gmail.com",
		firstName: "Admin",
		lastName: "System",
		role: "admin",
		favorites: [],
		status: "active",
		isEmailVerified: true
	},

];

// Lưu danh sách tài khoản admin vào localStorage để dễ dàng đăng nhập
if (typeof window !== "undefined") {
	localStorage.setItem("adminUsers", JSON.stringify(adminUsers));
}

export const useAuth = (): UseAuthReturn => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isAccountDeleted, setIsAccountDeleted] = useState<boolean>(false);
	const [isAccountSuspended, setIsAccountSuspended] = useState<boolean>(false);
	const [isRoleChanged, setIsRoleChanged] = useState<boolean>(false);
	const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// Lấy thông tin người dùng từ localStorage khi khởi tạo hook
	useEffect(() => {
		const storedUser = authService.getUser();
		const token = authService.getToken();
		
		// Kiểm tra nếu có user nhưng không có token, đăng xuất
		if (storedUser && !token) {
			console.log("Phát hiện người dùng mà không có token, đăng xuất tự động");
			authService.logout();
			setUser(null);
			setIsLoading(false);
			return;
		}
		
		if (storedUser && token) {
			setUser(storedUser);
			// Kiểm tra ngay tài khoản có tồn tại không
			try {
				checkAccountStatus();
			} catch (error) {
				console.error("Lỗi khi kiểm tra trạng thái tài khoản khi khởi tạo:", error);
			}
		}
		setIsLoading(false);

		// Thiết lập kiểm tra tài khoản định kỳ (mỗi 1 phút)
		checkIntervalRef.current = setInterval(checkAccountStatus, 60 * 1000);

		return () => {
			if (checkIntervalRef.current) {
				clearInterval(checkIntervalRef.current);
			}
		};
	}, []);

	// Xử lý tài khoản đã bị xóa
	const handleAccountDeleted = useCallback(() => {
		// Đăng xuất người dùng
		authService.logout();
		setUser(null);
		
		// Hiển thị thông báo tài khoản bị xóa
		setIsAccountDeleted(true);
	}, []);

	// Ẩn modal thông báo tài khoản bị xóa
	const hideAccountDeletedModal = useCallback(() => {
		setIsAccountDeleted(false);
	}, []);
	
	// Ẩn modal thông báo tài khoản bị tạm ngưng
	const hideAccountSuspendedModal = useCallback(() => {
		setIsAccountSuspended(false);
	}, []);
	
	// Ẩn modal thông báo vai trò bị thay đổi
	const hideRoleChangedModal = useCallback(() => {
		setIsRoleChanged(false);
	}, []);

	// Đăng nhập
	const login = useCallback(async (email: string, password: string) => {
		setIsLoading(true);
		try {
			// Mật khẩu mặc định cho tất cả tài khoản admin
			const adminPassword = "Admin@123";
			
			// Kiểm tra trong danh sách tài khoản admin
			const adminUser = adminUsers.find(admin => admin.email === email);
			if (adminUser) {
				// Nếu là tài khoản admin nhưng mật khẩu sai
				if (password !== adminPassword) {
					throw new Error("Email hoặc mật khẩu không chính xác");
				}
				
				// Lưu thông tin admin vào localStorage
				localStorage.setItem("token", `admin-token-${adminUser.id}`);
				localStorage.setItem("user", JSON.stringify(adminUser));
				setUser(adminUser);
				return;
			}

			// Nếu không phải tài khoản admin, tiếp tục gọi API
			const loggedInUser = await authService.login({ email, password });

			// Sử dụng type assertion để kiểm tra trạng thái tài khoản
			const userWithStatus = loggedInUser as User & { 
				status?: "active" | "inactive" | "pending", 
				isEmailVerified?: boolean 
			};
			
			if (userWithStatus.status === "pending" && !userWithStatus.isEmailVerified) {
				throw new Error(
					"Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email và xác nhận tài khoản."
				);
			}

			// Kiểm tra xem tài khoản có bị tạm ngưng không 
			if (userWithStatus.status === "inactive") {
				throw new Error(
					"Tài khoản của bạn đã bị tạm ngưng. Vui lòng liên hệ quản trị viên để được hỗ trợ."
				);
			}

			setUser(loggedInUser);
		} catch (error) {
			console.error("Lỗi đăng nhập:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Đăng ký
	const register = useCallback(async (userData: RegisterData) => {
		setIsLoading(true);
		try {
			const newUser = await authService.register(userData);
			setUser(newUser);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Đăng xuất
	const logout = useCallback(() => {
		authService.logout();
		setUser(null);

		// Xóa lịch sử thành phố đã xem khi đăng xuất
		const RECENTLY_VIEWED_STORAGE_KEY = "recentlyViewedCities";
		try {
			localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
		} catch (error) {
			console.error("Lỗi khi xóa lịch sử thành phố đã xem:", error);
		}
	}, []);
	
	// Hàm kiểm tra tài khoản
	const checkAccountStatus = useCallback(async () => {
		// Chỉ kiểm tra nếu người dùng đang đăng nhập
		if (!user) return;

		try {
			// Bỏ qua kiểm tra với tài khoản admin mặc định
			if (user.id.startsWith("admin")) {
				return;
			}
			
			// Kiểm tra tài khoản có tồn tại không
			try {
				const exists = await authService.checkAccountExists(user.email);
				if (!exists) {
					// Tài khoản không tồn tại hoặc đã bị xóa
					handleAccountDeleted();
					return;
				}
			} catch (checkError) {
				// Nếu không kiểm tra được, bỏ qua và tiếp tục
				console.log("Không thể kiểm tra sự tồn tại của tài khoản, tiếp tục kiểm tra trạng thái", checkError);
			}
			
			// Kiểm tra thông tin người dùng hiện tại
			try {
				const currentUserInfo = await authService.getCurrentUser();
				
				// Nếu không lấy được thông tin người dùng (null), có thể đã tự động đăng xuất ở authService
				if (currentUserInfo === null) {
					console.log("Không tìm thấy thông tin người dùng, tự động đăng xuất");
					logout();
					return;
				}
				
				// Kiểm tra nếu có thông tin người dùng
				if (currentUserInfo) {
					// Kiểm tra trạng thái tài khoản
					if (currentUserInfo?.status === "inactive") {
						// Tài khoản bị tạm ngưng
						console.log("Phát hiện tài khoản bị khóa, đang đăng xuất...");
						logout();
						setIsAccountSuspended(true);
						return;
					}
					
					// Kiểm tra vai trò người dùng nếu trước đó là admin
					if (user.role === "admin" && currentUserInfo.role !== "admin") {
						// Vai trò đã bị thay đổi
						logout();
						setIsRoleChanged(true);
						return;
					}
					
					// Cập nhật thông tin người dùng nếu có thay đổi
					if (JSON.stringify(user) !== JSON.stringify(currentUserInfo)) {
						setUser(currentUserInfo);
					}
				}
			} catch (error: unknown) {
				// Chuyển đổi error thành AxiosError để kiểm tra
				const axiosError = error as AxiosError<ApiErrorResponse>;
				
				// Kiểm tra nếu lỗi liên quan đến tài khoản bị khóa
				if (axiosError.response?.data?.code === 'account_suspended') {
					console.log("Lỗi API cho biết tài khoản bị khóa");
					logout();
					setIsAccountSuspended(true);
					return;
				}
				
				// Kiểm tra nếu lỗi là lỗi kết nối
				if (axiosError.code === 'ECONNABORTED' || !axiosError.response) {
					console.log("Lỗi kết nối khi kiểm tra trạng thái tài khoản, bỏ qua kiểm tra");
					// Bỏ qua kiểm tra và giữ nguyên trạng thái hiện tại
					return;
				}
				
				console.error("Lỗi khi kiểm tra thông tin người dùng:", error);
			}
		} catch (error) {
			console.error("Lỗi kiểm tra trạng thái tài khoản:", error);
		}
	}, [user, logout, handleAccountDeleted]);

	// Xử lý callback từ đăng nhập Google
	const handleGoogleCallback = useCallback(async (token: string) => {
		setIsLoading(true);
		try {
			authService.setTokenFromGoogle(token);
			const googleUser = await authService.loadUserFromToken(token);
			
			// Kiểm tra trạng thái tài khoản
			// Type assertion để truy cập thuộc tính status
			const userWithStatus = googleUser as User & { 
				status?: "active" | "inactive" | "pending" 
			};
			
			if (userWithStatus.status === "inactive") {
				authService.logout();
				throw new Error("Tài khoản của bạn đã bị tạm ngưng. Vui lòng liên hệ quản trị viên để được hỗ trợ.");
			}
			
			setUser(googleUser);
		} catch (error) {
			console.error("Lỗi khi xử lý đăng nhập Google:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Thêm thành phố vào danh sách yêu thích
	const addFavorite = useCallback(
		async (cityId: string) => {
			if (!user) return;

			try {
				// Đối với tài khoản admin mặc định, chỉ cập nhật trạng thái local
				if (user.id.startsWith("admin")) {
					setUser((prev) => {
						if (!prev) return null;
						return {
							...prev,
							favorites: [...prev.favorites, cityId],
						};
					});
					
					// Cập nhật trong localStorage nếu là admin
					const storedUser = localStorage.getItem("user");
					if (storedUser) {
						const parsedUser = JSON.parse(storedUser);
						parsedUser.favorites = [...parsedUser.favorites, cityId];
						localStorage.setItem("user", JSON.stringify(parsedUser));
					}
					return;
				}

				const favorites = await authService.addFavorite(cityId);
				setUser((prev) => (prev ? { ...prev, favorites } : null));
			} catch (error) {
				console.error("Lỗi khi thêm vào danh sách yêu thích:", error);
			}
		},
		[user]
	);

	// Xóa thành phố khỏi danh sách yêu thích
	const removeFavorite = useCallback(
		async (cityId: string) => {
			if (!user) return;

			try {
				// Đối với tài khoản admin mặc định, chỉ cập nhật trạng thái local
				if (user.id.startsWith("admin")) {
					setUser((prev) => {
						if (!prev) return null;
						return {
							...prev,
							favorites: prev.favorites.filter((id) => id !== cityId),
						};
					});
					
					// Cập nhật trong localStorage nếu là admin
					const storedUser = localStorage.getItem("user");
					if (storedUser) {
						const parsedUser = JSON.parse(storedUser);
						parsedUser.favorites = parsedUser.favorites.filter((id: string) => id !== cityId);
						localStorage.setItem("user", JSON.stringify(parsedUser));
					}
					return;
				}

				const favorites = await authService.removeFavorite(cityId);
				setUser((prev) => (prev ? { ...prev, favorites } : null));
			} catch (error) {
				console.error("Lỗi khi xóa khỏi danh sách yêu thích:", error);
			}
		},
		[user]
	);

	// Cập nhật thông tin profile
	const updateProfile = useCallback(
		async (data: { firstName?: string; lastName?: string }) => {
			if (!user) return;

			console.log("useAuth: Gọi updateProfile với dữ liệu:", data);
			console.log(
				"API URL:",
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
			);

			try {
				const updatedUser = await authService.updateProfile(data);
				console.log("useAuth: Cập nhật thành công, user mới:", updatedUser);
				setUser(updatedUser);
			} catch (error) {
				console.error("useAuth: Lỗi khi cập nhật thông tin cá nhân:", error);
				throw error;
			}
		},
		[user]
	);

	// Cập nhật mật khẩu
	const updatePassword = useCallback(
		async (data: { currentPassword?: string; newPassword: string }) => {
			if (!user) return;

			try {
				await authService.updatePassword(data);
				// Cập nhật lại user để thay đổi trạng thái hasPassword
				const updatedUser = await authService.getUser();
				if (updatedUser) {
					setUser(updatedUser);
				}
			} catch (error) {
				console.error("Lỗi khi cập nhật mật khẩu:", error);
				throw error;
			}
		},
		[user]
	);

	// Lấy mật khẩu đã lưu
	const getStoredPassword = useCallback(() => {
		return authService.getStoredPassword();
	}, []);

	// Lưu instance của useAuth vào window object để interceptors có thể truy cập
	useEffect(() => {
		if (typeof window !== "undefined") {
			window.__auth_instance = {
				checkAccountStatus
			};
		}
		
		return () => {
			if (typeof window !== "undefined") {
				delete window.__auth_instance;
			}
		};
	}, [checkAccountStatus]);

	return {
		user,
		isLoading,
		isAuthenticated: !!user,
		isAccountDeleted,
		isAccountSuspended,
		isRoleChanged,
		hideAccountDeletedModal,
		hideAccountSuspendedModal,
		hideRoleChangedModal,
		login,
		register,
		logout,
		addFavorite,
		removeFavorite,
		handleGoogleCallback,
		updateProfile,
		updatePassword,
		getStoredPassword,
		checkAccountStatus,
	};
};
