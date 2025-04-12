"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AccessDenied from "@/components/AccessDenied";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, isAuthenticated, isLoading } = useAuthContext();
	const router = useRouter();
	const [showAccessDenied, setShowAccessDenied] = useState(false);

	useEffect(() => {
		// Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
		if (!isLoading && !isAuthenticated) {
			router.push("/login");
			return;
		}

		// Nếu đã đăng nhập nhưng không phải admin, hiển thị trang truy cập bị từ chối
		if (!isLoading && isAuthenticated && user?.role !== "admin") {
			setShowAccessDenied(true);
		} else {
			setShowAccessDenied(false);
		}
	}, [isAuthenticated, isLoading, router, user]);

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
		<div className="flex min-h-screen bg-gray-100 pt-14">
			<AdminSidebar />
			<div className="flex-1 p-8 md:ml-64">{children}</div>
		</div>
	);
}
