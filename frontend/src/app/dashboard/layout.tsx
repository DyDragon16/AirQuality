"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import UserDashboardSidebar from "@/components/user/UserDashboardSidebar";
import { Navbar } from "@/layout/Navbar";
import AccessDenied from "@/components/AccessDenied";

export default function UserDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, isAuthenticated, isLoading, checkAccountStatus } = useAuthContext();
	const router = useRouter();
	const [showAccessDenied, setShowAccessDenied] = useState(false);

	useEffect(() => {
		// Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
		if (!isLoading && !isAuthenticated) {
			router.push("/login");
			return;
		}

		// Nếu đã đăng nhập nhưng là admin, hiển thị trang truy cập bị từ chối
		if (!isLoading && isAuthenticated && user?.role === "admin") {
			setShowAccessDenied(true);
		} else {
			setShowAccessDenied(false);
		}
		
		// Kiểm tra trạng thái tài khoản khi vừa vào dashboard
		if (isAuthenticated && user?.role === "user") {
			checkAccountStatus();
		}
		
		// Thiết lập interval để kiểm tra định kỳ
		const interval = setInterval(() => {
			if (isAuthenticated && user?.role === "user") {
				checkAccountStatus();
			}
		}, 15000); // Kiểm tra mỗi 15 giây
		
		return () => clearInterval(interval);
	}, [isAuthenticated, isLoading, router, checkAccountStatus, user]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null; // Không hiển thị gì cho đến khi chuyển hướng hoàn tất
	}

	if (showAccessDenied) {
		return <AccessDenied />;
	}

	return (
		<div className="flex flex-col min-h-screen bg-white">
			<Navbar />
			<div className="flex flex-1 pt-14">
			<UserDashboardSidebar />
			<div className="flex-1 p-8 md:ml-64">{children}</div>
			</div>
		</div>
	);
} 