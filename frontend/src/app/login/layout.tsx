import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Đăng nhập - Ứng dụng thời tiết",
	description:
		"Đăng nhập vào ứng dụng thời tiết để theo dõi thời tiết tại các thành phố yêu thích",
};

export default function LoginLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
