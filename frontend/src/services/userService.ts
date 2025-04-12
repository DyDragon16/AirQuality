import axios, { AxiosError } from "axios";
import { API_URL } from "../constants/apiConfig";

interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	status: "active" | "inactive" | "pending";
	isEmailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
	favorites: string[];
}

interface NewUser {
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	password?: string; // Để password là optional
}

interface ApiErrorResponse {
	success: boolean;
	message: string;
}

// Sử dụng API_URL đã được import từ apiConfig
console.log("User Service: API URL đang sử dụng:", API_URL);

// Lấy header chứa token từ localStorage
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authHeader = () => {
	if (typeof window === "undefined") return {};

	const token = localStorage.getItem("token");
	if (token) {
		return { Authorization: `Bearer ${token}` };
	}
	return {};
};

/**
 * Service để quản lý người dùng (admin)
 */
export const userService = {
	/**
	 * Lấy danh sách tất cả người dùng
	 */
	async getAllUsers(): Promise<User[]> {
		try {
			// Sử dụng URL tuyệt đối để tránh lỗi proxy
			const response = await axios.get(`${API_URL}/auth/users`, {
				// Bỏ qua header xác thực tạm thời để kiểm tra kết nối
				// headers: authHeader(),
			});

			if (response.data.success && response.data.data) {
				console.log("Dữ liệu người dùng từ API:", response.data.data);

				// Sử dụng trạng thái thực tế từ server
				const users = response.data.data.map((user: User) => ({
					...user,
					// Không cần thiết lập status mặc định vì đã có từ server
				}));

				return users;
			}

			throw new Error("Không thể lấy danh sách người dùng");
		} catch (error: unknown) {
			console.error("Chi tiết lỗi getAllUsers:", error);

			const axiosError = error as AxiosError<ApiErrorResponse>;
			if (axiosError.response?.status === 401) {
				throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
			}

			if (axiosError.response?.data) {
				throw new Error(
					axiosError.response.data.message ||
						"Không thể lấy danh sách người dùng"
				);
			}

			throw new Error(
				"Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và API."
			);
		}
	},

	/**
	 * Thêm người dùng mới
	 */
	async addUser(userData: NewUser): Promise<User> {
		try {
			console.log("Đang gửi yêu cầu thêm người dùng:", userData);
			// Sử dụng API endpoint mới cho việc thêm người dùng bởi admin
			const response = await axios.post(
				`${API_URL}/auth/invite-user`,
				userData
			);

			if (response.data.success && response.data.data) {
				console.log("Kết quả thêm user:", response.data);
				return response.data.data.user;
			}

			throw new Error("Không thể thêm người dùng");
		} catch (error: unknown) {
			console.error("Chi tiết lỗi addUser:", error);
			const axiosError = error as AxiosError<ApiErrorResponse>;

			// Xử lý lỗi email đã tồn tại
			if (axiosError.response?.status === 409) {
				throw new Error("Email này đã được sử dụng, vui lòng chọn email khác.");
			}

			if (axiosError.response?.status === 500) {
				// Kiểm tra xem có phải lỗi gửi email không
				const errorMsg = axiosError.response?.data?.message || "";
				if (errorMsg.includes("email") || errorMsg.includes("mail")) {
					throw new Error(
						"Người dùng đã được tạo nhưng không thể gửi email. Vui lòng kiểm tra cài đặt email hoặc liên hệ với quản trị viên."
					);
				}
				throw new Error(
					"Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên."
				);
			}

			if (axiosError.response?.data) {
				throw new Error(
					axiosError.response.data.message || "Không thể thêm người dùng"
				);
			}

			throw new Error(
				"Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và API."
			);
		}
	},

	/**
	 * Xóa người dùng
	 */
	async deleteUser(userId: string): Promise<void> {
		try {
			console.log("Đang gửi yêu cầu xóa user với ID:", userId);
			const response = await axios.delete(`${API_URL}/auth/users/${userId}`, {
				// Bỏ tạm header xác thực trong quá trình phát triển
				// headers: authHeader(),
			});

			console.log("Kết quả xóa user:", response.data);
			if (!response.data.success) {
				throw new Error("Không thể xóa người dùng");
			}
		} catch (error: unknown) {
			console.error("Chi tiết lỗi khi xóa user:", error);
			const axiosError = error as AxiosError<ApiErrorResponse>;

			if (axiosError.response) {
				// Lỗi từ server với status code và phản hồi
				const statusCode = axiosError.response.status;
				const errorMessage =
					axiosError.response.data?.message || "Không thể xóa người dùng";

				if (statusCode === 404) {
					throw new Error("Không tìm thấy người dùng này trong hệ thống");
				} else if (statusCode === 403) {
					throw new Error("Bạn không có quyền xóa người dùng này");
				} else if (statusCode === 400) {
					throw new Error(errorMessage);
				} else {
					throw new Error(`Đã xảy ra lỗi khi xóa người dùng: ${errorMessage}`);
				}
			} else if (axiosError.request) {
				// Đã gửi request nhưng không nhận được phản hồi
				throw new Error(
					"Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng."
				);
			} else {
				// Lỗi khác khi thiết lập request
				throw new Error("Đã xảy ra lỗi khi xóa người dùng");
			}
		}
	},

	/**
	 * Cập nhật vai trò của người dùng
	 * @param userId ID của người dùng
	 * @param role Vai trò mới ('admin' hoặc 'user')
	 */
	async updateUserRole(userId: string, role: string): Promise<User> {
		try {
			console.log(`Đang gửi yêu cầu cập nhật vai trò của người dùng ${userId} thành ${role}`);
			
			const response = await axios.put(`${API_URL}/auth/users/${userId}/role`, { role });

			if (response.data.success && response.data.data) {
				console.log("Kết quả cập nhật vai trò:", response.data);
				return response.data.data;
			}

			throw new Error("Không thể cập nhật vai trò người dùng");
		} catch (error: unknown) {
			console.error("Chi tiết lỗi updateUserRole:", error);
			const axiosError = error as AxiosError<ApiErrorResponse>;

			if (axiosError.response?.status === 404) {
				throw new Error("Không tìm thấy người dùng này trong hệ thống");
			} 
			
			if (axiosError.response?.status === 403) {
				throw new Error("Bạn không có quyền thay đổi vai trò của người dùng này");
			} 
			
			if (axiosError.response?.status === 400) {
				throw new Error(axiosError.response.data?.message || "Vai trò không hợp lệ");
			}

			if (axiosError.response?.data) {
				throw new Error(
					axiosError.response.data.message || "Không thể cập nhật vai trò người dùng"
				);
			}

			throw new Error(
				"Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và API."
			);
		}
	},

	/**
	 * Cập nhật trạng thái của người dùng
	 * @param userId ID của người dùng
	 * @param status Trạng thái mới ('active' hoặc 'inactive')
	 */
	async updateUserStatus(userId: string, status: string): Promise<User> {
		try {
			console.log(`Đang gửi yêu cầu cập nhật trạng thái của người dùng ${userId} thành ${status}`);
			
			const response = await axios.put(`${API_URL}/auth/users/${userId}/status`, { status });

			if (response.data.success && response.data.data) {
				console.log("Kết quả cập nhật trạng thái:", response.data);
				return response.data.data;
			}

			throw new Error("Không thể cập nhật trạng thái người dùng");
		} catch (error: unknown) {
			console.error("Chi tiết lỗi updateUserStatus:", error);
			const axiosError = error as AxiosError<ApiErrorResponse>;

			if (axiosError.response?.status === 404) {
				throw new Error("Không tìm thấy người dùng này trong hệ thống");
			} 
			
			if (axiosError.response?.status === 403) {
				throw new Error("Bạn không có quyền thay đổi trạng thái của người dùng này");
			} 
			
			if (axiosError.response?.status === 400) {
				throw new Error(axiosError.response.data?.message || "Trạng thái không hợp lệ");
			}

			if (axiosError.response?.data) {
				throw new Error(
					axiosError.response.data.message || "Không thể cập nhật trạng thái người dùng"
				);
			}

			throw new Error(
				"Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và API."
			);
		}
	},
};
