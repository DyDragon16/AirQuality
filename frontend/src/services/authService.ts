import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "../constants/apiConfig";

// Định nghĩa các interfaces
interface RegisterData {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

interface LoginData {
	email: string;
	password: string;
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

interface AuthResponse {
	success: boolean;
	message: string;
	data: {
		token: string;
		user: User;
	};
}

interface ApiErrorResponse {
	success: boolean;
	message: string;
	code?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const MAX_TIMEOUT = 10000;
console.log("AuthService: API URL được sử dụng:", API_URL);

// Lưu token trong localStorage
const setToken = (token: string) => {
	localStorage.setItem("token", token);
};

// Lấy token từ localStorage
const getToken = (): string | null => {
	if (typeof window !== "undefined") {
		return localStorage.getItem("token");
	}
	return null;
};

// Xóa token từ localStorage
const clearToken = () => {
	localStorage.removeItem("token");
};

// Lưu thông tin user trong localStorage
const setUser = (user: User) => {
	localStorage.setItem("user", JSON.stringify(user));
};

// Lưu mật khẩu đã mã hóa vào localStorage (cho mục đích demo)
const setStoredPassword = (password: string) => {
	try {
		if (typeof window === "undefined") return;

		// Mã hóa đơn giản, trong thực tế cần sử dụng mã hóa mạnh hơn
		const encodedPassword = btoa(password);
		console.log("Đang lưu mật khẩu đã mã hóa:", encodedPassword);
		localStorage.setItem("stored_password", encodedPassword);
	} catch (error) {
		console.error("Lỗi khi lưu mật khẩu:", error);
	}
};

// Lấy mật khẩu đã mã hóa từ localStorage
const getStoredPassword = (): string | null => {
	try {
		if (typeof window === "undefined") return null;

		const encodedPassword = localStorage.getItem("stored_password");
		console.log("Mật khẩu đã mã hóa:", encodedPassword);

		if (encodedPassword) {
			// Giải mã
			const decodedPassword = atob(encodedPassword);
			console.log("Mật khẩu đã giải mã:", decodedPassword);
			return decodedPassword;
		}
		return null;
	} catch (error) {
		console.error("Lỗi khi lấy mật khẩu:", error);
		return null;
	}
};

// Lấy thông tin user từ localStorage
const getUser = (): User | null => {
	if (typeof window !== "undefined") {
		const userStr = localStorage.getItem("user");
		if (userStr) {
			return JSON.parse(userStr);
		}
	}
	return null;
};

// Xóa thông tin user từ localStorage
const clearUser = () => {
	localStorage.removeItem("user");
};

// Kiểm tra user đã đăng nhập hay chưa
const isAuthenticated = (): boolean => {
	const token = getToken();
	return !!token;
};

// Tạo header với token xác thực
const authHeader = () => {
	const token = getToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
};

// Lưu token nhận được từ Google OAuth
const setTokenFromGoogle = (token: string) => {
	setToken(token);
};

// Lấy thông tin user từ token
const loadUserFromToken = async (token: string): Promise<User> => {
	try {
		const response = await axios.get(API_ENDPOINTS.AUTH.ME, {
			headers: { Authorization: `Bearer ${token}` },
			timeout: MAX_TIMEOUT,
		});

		if (response.data.success && response.data.data) {
			setUser(response.data.data);
			return response.data.data;
		}

		throw new Error("Không thể lấy thông tin người dùng");
	} catch (error) {
		const axiosError = error as AxiosError<ApiErrorResponse>;
		if (axiosError.response?.data) {
			throw new Error(
				axiosError.response.data.message || "Không thể lấy thông tin người dùng"
			);
		}
		throw error;
	}
};

// Service cho đăng ký tài khoản
const register = async (userData: RegisterData): Promise<User> => {
	try {
		console.log("Đang gửi yêu cầu đăng ký đến:", API_ENDPOINTS.AUTH.REGISTER);
		const response = await axios.post<AuthResponse>(
			API_ENDPOINTS.AUTH.REGISTER,
			userData
		);

		if (response.data.success && response.data.data) {
			setToken(response.data.data.token);
			setUser(response.data.data.user);
			return response.data.data.user;
		}

		throw new Error("Đăng ký thất bại");
	} catch (error: unknown) {
		console.error("Lỗi đăng ký:", error);
		const axiosError = error as AxiosError<ApiErrorResponse>;
		if (axiosError.response?.data) {
			throw new Error(axiosError.response.data.message || "Đăng ký thất bại");
		}
		throw error;
	}
};

// Service cho đăng nhập
const login = async (loginData: LoginData): Promise<User> => {
	console.log(`Đang thử đăng nhập với email: ${loginData.email}`);

	// Số lần thử lại
	const maxRetries = 2;
	let retries = 0;
	let lastError = null;

	while (retries <= maxRetries) {
		try {
			console.log(`Đang gọi API đăng nhập (lần thử: ${retries + 1})`);

			// Chuẩn hóa email trước khi gửi
			const normalizedLoginData = {
				email: loginData.email.toLowerCase().trim(),
				password: loginData.password,
			};

			const response = await axios.post<AuthResponse>(
				API_ENDPOINTS.AUTH.LOGIN,
				normalizedLoginData,
				{
					timeout: MAX_TIMEOUT,
				}
			);

			if (response.data.success && response.data.data) {
				console.log("Đăng nhập thành công, đang lưu thông tin người dùng");
				setToken(response.data.data.token);
				setUser(response.data.data.user);
				return response.data.data.user;
			}

			throw new Error("Đăng nhập thất bại: Phản hồi không hợp lệ từ server");
		} catch (error: unknown) {
			lastError = error;
			console.error(`Lỗi đăng nhập (lần thử ${retries + 1}):`, error);

			// Kiểm tra lỗi 401 Unauthorized
			const axiosError = error as AxiosError;
			if (axiosError.response?.status === 401) {
				console.log("Lỗi xác thực (401): Email hoặc mật khẩu không chính xác");
				throw new Error("Email hoặc mật khẩu không chính xác");
			}

			// Kiểm tra lỗi mạng hoặc timeout
			if (axiosError.code === "ECONNABORTED" || !axiosError.response) {
				// Lỗi mạng/timeout, thử lại
				retries++;
				if (retries <= maxRetries) {
					console.log(`Đang thử lại lần ${retries}...`);
					await new Promise((resolve) => setTimeout(resolve, 1000)); // Chờ 1 giây trước khi thử lại
					continue;
				}
			} else {
				// Lỗi khác như sai mật khẩu không cần thử lại
				break;
			}
		}
	}

	// Xử lý lỗi cuối cùng
	if (lastError) {
		const axiosError = lastError as AxiosError<ApiErrorResponse>;
		if (axiosError.response?.data) {
			throw new Error(axiosError.response.data.message || "Đăng nhập thất bại");
		} else if (axiosError.code === "ECONNABORTED") {
			throw new Error("Kết nối đến server quá chậm. Vui lòng thử lại sau.");
		} else if (!axiosError.response) {
			throw new Error(
				"Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
			);
		}
		throw lastError;
	}

	throw new Error("Đăng nhập thất bại: Không xác định được nguyên nhân");
};

// Đăng xuất
const logout = () => {
	clearToken();
	clearUser();
};

// Lấy thông tin người dùng hiện tại từ API
const getCurrentUser = async (): Promise<User | null> => {
	try {
		const token = getToken();
		if (!token) {
			console.log(
				"getCurrentUser: Không tìm thấy token xác thực, cần đăng xuất"
			);
			// Thay vì ném lỗi, trả về null để useAuth xử lý
			logout(); // Đảm bảo đăng xuất nếu không có token
			return null;
		}

		// Lấy dữ liệu người dùng từ localStorage làm fallback
		const localUser = getUser();

		try {
			const response = await axios.get(API_ENDPOINTS.AUTH.ME, {
				headers: { Authorization: `Bearer ${token}` },
				timeout: MAX_TIMEOUT,
			});

			if (response.data.success && response.data.data) {
				// Cập nhật thông tin người dùng trong localStorage
				setUser(response.data.data);
				return response.data.data;
			}

			// Nếu response không có dữ liệu nhưng có user trong localStorage, sử dụng dữ liệu local
			if (localUser) {
				console.log(
					"API không trả về dữ liệu người dùng, sử dụng dữ liệu cục bộ"
				);
				return localUser;
			}

			// Không ném lỗi, trả về null
			console.log(
				"Không thể lấy thông tin người dùng từ API và không có dữ liệu cục bộ"
			);
			logout(); // Đăng xuất người dùng
			return null;
		} catch (apiError: unknown) {
			const axiosError = apiError as AxiosError<ApiErrorResponse>;

			// Kiểm tra nếu lỗi là do tài khoản bị khóa
			if (axiosError.response?.data?.code === "account_suspended") {
				// Trả về người dùng hiện tại với trạng thái đã bị khóa
				if (localUser) {
					const inactiveUser = {
						...localUser,
						status: "inactive" as const,
					};
					return inactiveUser;
				}
			}

			// Nếu lỗi kết nối mạng hoặc timeout, sử dụng dữ liệu cục bộ
			if (axiosError.code === "ECONNABORTED" || !axiosError.response) {
				console.log("Lỗi kết nối đến máy chủ, sử dụng dữ liệu cục bộ");
				if (localUser) {
					return localUser;
				}
			}

			// Xử lý lỗi 401 - Unauthorized
			if (axiosError.response?.status === 401) {
				// Token hết hạn hoặc không hợp lệ, đăng xuất người dùng
				console.log("Token hết hạn hoặc không hợp lệ, đăng xuất người dùng");
				logout();
				return null; // Trả về null thay vì ném lỗi
			}

			// Xử lý các lỗi khác từ server
			if (axiosError.response?.data) {
				console.error("Lỗi từ server:", axiosError.response.data.message);
				// Không ném lỗi, trả về dữ liệu cục bộ nếu có
				if (localUser) {
					return localUser;
				}
				return null;
			}

			// Nếu đến đây mà vẫn có lỗi và có dữ liệu cục bộ, sử dụng dữ liệu cục bộ
			if (localUser) {
				console.log(
					"Sử dụng dữ liệu người dùng cục bộ do lỗi API:",
					axiosError.message
				);
				return localUser;
			}

			// Nếu không có dữ liệu cục bộ, trả về null
			console.error(
				"Không thể lấy thông tin người dùng và không có dữ liệu cục bộ"
			);
			return null;
		}
	} catch (error: unknown) {
		console.error("Lỗi toàn cục khi lấy thông tin người dùng:", error);

		// Truy xuất user từ localStorage như là biện pháp cuối cùng
		const localUser = getUser();
		if (localUser) {
			console.log("Sử dụng dữ liệu cục bộ sau khi xử lý lỗi toàn cục");
			return localUser;
		}

		// Trả về null thay vì ném lỗi
		return null;
	}
};

// Thêm thành phố vào danh sách yêu thích
const addFavorite = async (cityId: string): Promise<string[]> => {
	try {
		const response = await axios.post(
			API_ENDPOINTS.AUTH.FAVORITES(cityId),
			{},
			{
				headers: authHeader(),
			}
		);

		if (response.data.success && response.data.data) {
			// Cập nhật lại thông tin user trong localStorage
			const user = getUser();
			if (user) {
				user.favorites = response.data.data.favorites;
				setUser(user);
			}

			return response.data.data.favorites;
		}

		throw new Error("Không thể thêm thành phố vào danh sách yêu thích");
	} catch (error: unknown) {
		const axiosError = error as AxiosError<ApiErrorResponse>;
		if (axiosError.response?.data) {
			throw new Error(
				axiosError.response.data.message ||
					"Không thể thêm thành phố vào danh sách yêu thích"
			);
		}
		throw error;
	}
};

// Xóa thành phố khỏi danh sách yêu thích
const removeFavorite = async (cityId: string): Promise<string[]> => {
	try {
		const response = await axios.delete(API_ENDPOINTS.AUTH.FAVORITES(cityId), {
			headers: authHeader(),
		});

		if (response.data.success && response.data.data) {
			// Cập nhật lại thông tin user trong localStorage
			const user = getUser();
			if (user) {
				user.favorites = response.data.data.favorites;
				setUser(user);
			}

			return response.data.data.favorites;
		}

		throw new Error("Không thể xóa thành phố khỏi danh sách yêu thích");
	} catch (error: unknown) {
		const axiosError = error as AxiosError<ApiErrorResponse>;
		if (axiosError.response?.data) {
			throw new Error(
				axiosError.response.data.message ||
					"Không thể xóa thành phố khỏi danh sách yêu thích"
			);
		}
		throw error;
	}
};

// Cập nhật thông tin cá nhân người dùng
const updateProfile = async (userData: {
	firstName?: string;
	lastName?: string;
}): Promise<User> => {
	console.log("AuthService: Bắt đầu cập nhật profile với data:", userData);
	console.log("AuthService: URL API sẽ gọi:", API_ENDPOINTS.AUTH.PROFILE);

	try {
		// Lấy thông tin người dùng hiện tại
		const currentUser = getUser();
		if (!currentUser) {
			throw new Error("Không tìm thấy thông tin người dùng");
		}
		console.log("AuthService: Tìm thấy currentUser:", currentUser);

		// Gọi API để cập nhật thông tin người dùng
		try {
			console.log(
				"AuthService: Đang gửi request đến API với headers:",
				authHeader()
			);
			const response = await axios.put(API_ENDPOINTS.AUTH.PROFILE, userData, {
				headers: authHeader(),
				timeout: MAX_TIMEOUT,
			});
			console.log("AuthService: Nhận được response từ API:", response.data);

			if (response.data.success && response.data.data) {
				// Cập nhật lại thông tin user trong localStorage
				const updatedUser = {
					...currentUser,
					...response.data.data,
				};
				setUser(updatedUser);
				console.log(
					"AuthService: Cập nhật thành công, trả về user:",
					updatedUser
				);
				return updatedUser;
			}

			throw new Error("Không thể cập nhật thông tin cá nhân");
		} catch (apiError: unknown) {
			console.error(
				"AuthService: Lỗi khi gọi API cập nhật thông tin:",
				apiError
			);

			// Fallback: Nếu không thể kết nối API, chỉ cập nhật localStorage
			console.log("AuthService: Sử dụng fallback: cập nhật localStorage");
			const updatedUser = {
				...currentUser,
				...userData,
			};

			// Lưu vào localStorage
			setUser(updatedUser);
			console.log(
				"AuthService: Cập nhật fallback thành công, trả về user:",
				updatedUser
			);
			return updatedUser; // Đảm bảo luôn trả về user, không ném lỗi
		}
	} catch (error: unknown) {
		console.error("AuthService: Lỗi cập nhật thông tin:", error);

		// Lấy thông tin người dùng hiện tại để thực hiện fallback
		const currentUser = getUser();
		if (currentUser) {
			console.log("AuthService: Sử dụng fallback sau khi xử lý lỗi");
			const updatedUser = {
				...currentUser,
				...userData,
			};

			// Lưu vào localStorage
			setUser(updatedUser);
			console.log(
				"AuthService: Fallback ngoài thành công, trả về user:",
				updatedUser
			);
			return updatedUser;
		}

		throw new Error("Không thể cập nhật thông tin cá nhân");
	}
};

// Cập nhật mật khẩu người dùng
const updatePassword = async (passwordData: {
	currentPassword?: string;
	newPassword: string;
}): Promise<boolean> => {
	try {
		// Lấy thông tin người dùng hiện tại
		const currentUser = getUser();
		if (!currentUser) {
			throw new Error("Không tìm thấy thông tin người dùng");
		}

		// Lưu trạng thái đã thiết lập mật khẩu vào user
		const updatedUser = {
			...currentUser,
			hasPassword: true,
		};

		// Lưu mật khẩu mới vào localStorage (đã mã hóa)
		setStoredPassword(passwordData.newPassword);

		// Lưu trạng thái user vào localStorage
		setUser(updatedUser);
		console.log("Cập nhật mật khẩu thành công:", passwordData.newPassword);

		// Trong trường hợp thực tế, bạn sẽ gọi API để cập nhật mật khẩu
		/* 
		const response = await axios.put(
			`${API_URL}/auth/password`,
			passwordData,
			{
				headers: authHeader(),
			}
		);

		if (response.data.success) {
			// Cập nhật trạng thái đã có mật khẩu
			const updatedUser = {
				...currentUser,
				hasPassword: true
			};
			setUser(updatedUser);
			return true;
		}
		
		throw new Error("Không thể cập nhật mật khẩu");
		*/

		return true;
	} catch (error: unknown) {
		console.error("Lỗi cập nhật mật khẩu:", error);
		const axiosError = error as AxiosError<ApiErrorResponse>;
		if (axiosError.response?.data) {
			throw new Error(
				axiosError.response.data.message || "Không thể cập nhật mật khẩu"
			);
		}
		throw error;
	}
};

// Kiểm tra tài khoản người dùng còn tồn tại không
const checkAccountExists = async (email: string): Promise<boolean> => {
	console.log("Đang kiểm tra tài khoản có tồn tại...");

	// Kiểm tra nếu là tài khoản admin mặc định thì luôn trả về true
	if (typeof window !== "undefined") {
		const adminUsersStr = localStorage.getItem("adminUsers");
		if (adminUsersStr) {
			const adminUsers = JSON.parse(adminUsersStr);
			const isAdmin = adminUsers.some(
				(admin: { email: string }) => admin.email === email
			);
			if (isAdmin) {
				console.log("Đây là tài khoản admin mặc định, luôn tồn tại");
				return true;
			}
		}
	}

	const maxRetries = 3;
	let retryCount = 0;

	while (retryCount < maxRetries) {
		try {
			// Gọi API để kiểm tra tài khoản
			console.log(
				`Đang kiểm tra tài khoản (lần thử ${retryCount + 1}/${maxRetries})...`
			);
			const response = await axios.get(API_ENDPOINTS.AUTH.CHECK_ACCOUNT, {
				params: { email },
				timeout: MAX_TIMEOUT,
			});

			console.log("Kết quả kiểm tra tài khoản:", response.data);
			return response.data.success && response.data.exists;
		} catch (error: unknown) {
			console.error(
				`Lỗi khi kiểm tra tài khoản (lần thử ${retryCount + 1}):`,
				error
			);
			const axiosError = error as AxiosError;

			// Nếu là lỗi 404, đây là phản hồi hợp lệ từ server - tài khoản không tồn tại
			if (axiosError.response?.status === 404) {
				console.log("Server trả về 404: Tài khoản không tồn tại");
				return false;
			}

			// Nếu là lần thử cuối, xử lý lỗi
			if (retryCount === maxRetries - 1) {
				// Nếu lỗi mạng hoặc lỗi kết nối - không xác định được tài khoản có tồn tại không
				// Trong trường hợp này, trả về true để không đăng xuất người dùng
				if (axiosError.code === "ECONNABORTED" || !axiosError.response) {
					console.log(
						"Lỗi kết nối khi kiểm tra tài khoản, giả định tài khoản vẫn tồn tại"
					);
					return true;
				}

				// Các lỗi khác, giả định tài khoản vẫn tồn tại để không đăng xuất người dùng
				return true;
			}

			// Tăng số lần thử
			retryCount++;

			// Chờ một khoảng thời gian trước khi thử lại
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	// Nếu thử hết số lần mà vẫn không thành công, giả định tài khoản vẫn tồn tại
	console.log("Đã thử tối đa số lần, giả định tài khoản vẫn tồn tại");
	return true;
};

// Export tất cả các functions
const authService = {
	register,
	login,
	logout,
	getCurrentUser,
	getUser,
	isAuthenticated,
	setToken,
	getToken,
	addFavorite,
	removeFavorite,
	setTokenFromGoogle,
	loadUserFromToken,
	updateProfile,
	updatePassword,
	getStoredPassword,
	checkAccountExists,
};

export default authService;
