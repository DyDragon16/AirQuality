import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Chất lượng không khí Việt Nam",
	description:
		"Kiểm tra chất lượng không khí và thời tiết tại các thành phố lớn ở Việt Nam",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="vi">
			<body className={`${inter.className} bg-white`} suppressHydrationWarning>
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	);
}
