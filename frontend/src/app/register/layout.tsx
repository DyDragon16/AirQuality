import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Đăng ký - Ứng dụng thời tiết",
	description:
		"Đăng ký tài khoản mới để sử dụng đầy đủ tính năng của ứng dụng thời tiết",
};

export default function RegisterLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
