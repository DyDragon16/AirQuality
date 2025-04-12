"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

// Interface cho dữ liệu trong context
interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	favorites: string[];
	hasPassword?: boolean;
}

interface RegisterData {
	email: string;
	firstName: string;
	lastName: string;
	password: string;
}

interface AuthContextProps {
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
	updateProfile: (data: { firstName?: string; lastName?: string }) => Promise<void>;
	updatePassword: (data: { currentPassword?: string; newPassword: string }) => Promise<void>;
	getStoredPassword: () => string | null;
	checkAccountStatus: () => Promise<void>;
}

// Tạo context với giá trị mặc định
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
	// Sử dụng hook useAuth để quản lý trạng thái authentication
	const auth = useAuth();

	// Xử lý lỗi xác thực toàn cục
	useEffect(() => {
		const handleAuthError = (event: ErrorEvent) => {
			// Kiểm tra nếu lỗi liên quan đến xác thực
			if (
				event.message?.includes("token") ||
				event.message?.includes("xác thực") ||
				event.message?.includes("Không có token")
			) {
				console.error("Phát hiện lỗi xác thực toàn cục:", event.message);
				// Đăng xuất nếu người dùng đang đăng nhập
				if (auth.isAuthenticated) {
					console.log("Tự động đăng xuất do lỗi xác thực");
					auth.logout();
				}
			}
		};

		window.addEventListener("error", handleAuthError);
		
		return () => {
			window.removeEventListener("error", handleAuthError);
		};
	}, [auth]);

	return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Hook để sử dụng context trong các components khác
export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
};
