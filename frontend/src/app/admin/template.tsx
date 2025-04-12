import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Quản trị - AirQuality",
	description: "Trang quản trị hệ thống AirQuality",
};

export default function AdminTemplate({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
