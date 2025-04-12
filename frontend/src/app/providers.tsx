"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { useAuthContext } from "@/context/AuthContext";
import { useEffect } from "react";
import { AuthModals } from "@/components/auth/AuthModals";

// Component kiểm tra trạng thái tài khoản
const AccountStatusChecker = () => {
	const { isAuthenticated, checkAccountStatus } = useAuthContext();
	
	useEffect(() => {
		// Kiểm tra ngay khi component mount nếu đã đăng nhập
		if (isAuthenticated) {
			try {
				checkAccountStatus();
			} catch (error) {
				console.error("Lỗi khi kiểm tra trạng thái tài khoản:", error);
			}
		}
		
		// Thiết lập kiểm tra định kỳ (mỗi 5 giây)
		const interval = setInterval(() => {
			if (isAuthenticated) {
				try {
					checkAccountStatus();
				} catch (error) {
					console.error("Lỗi định kỳ khi kiểm tra trạng thái tài khoản:", error);
				}
			}
		}, 5 * 1000); // Kiểm tra mỗi 5 giây để phát hiện ngay khi tài khoản bị khóa
		
		// Theo dõi hoạt động của người dùng để kiểm tra trạng thái tài khoản
		let lastCheckActivityTime = 0;
		const CHECK_ACTIVITY_INTERVAL = 5000; // 5 giây
		
		const handleUserActivity = () => {
			const currentTime = Date.now();
			if (isAuthenticated && currentTime - lastCheckActivityTime > CHECK_ACTIVITY_INTERVAL) {
				lastCheckActivityTime = currentTime;
				checkAccountStatus();
			}
		};
		
		// Thêm các event listener cho các hoạt động phổ biến của người dùng
		window.addEventListener('click', handleUserActivity);
		window.addEventListener('keydown', handleUserActivity);
		window.addEventListener('mousemove', handleUserActivity);
		window.addEventListener('scroll', handleUserActivity);
		
		return () => {
			clearInterval(interval);
			// Xóa các event listener khi component unmount
			window.removeEventListener('click', handleUserActivity);
			window.removeEventListener('keydown', handleUserActivity);
			window.removeEventListener('mousemove', handleUserActivity);
			window.removeEventListener('scroll', handleUserActivity);
		};
	}, [isAuthenticated, checkAccountStatus]);
	
	return null; // Component không render gì
};

// Create a client
const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<AccountStatusChecker />
				<AuthModals />
				{children}
			</AuthProvider>
		</QueryClientProvider>
	);
}
