import { test, expect } from "@playwright/test";

test.describe("B-0012: Đăng nhập (sai email)", () => {
	test("Hiển thị lỗi khi đăng nhập với email sai", async ({ page }) => {
		// Điều hướng đến trang đăng nhập
		await page.goto("/login");

		// Kiểm tra tiêu đề trang đăng nhập
		await expect(page.locator("h2")).toContainText("Đăng nhập");

		// Nhập email không chính xác
		await page.fill('input[name="email"]', "duyle16@gmail.com");

		// Nhập mật khẩu
		await page.fill('input[name="password"]', "Duy@123");

		// Nhấn nút đăng nhập
		await page.click('button[type="submit"]');

		// Đợi phản hồi từ server
		await page.waitForResponse(
			(response) => response.url().includes("/api/auth/login"),
			{ timeout: 10000 }
		);

		// Kiểm tra thông báo lỗi "email hoặc mật khẩu không chính xác"
		const errorMessage = page.locator(".bg-red-100, .text-red-700");
		await expect(errorMessage).toBeVisible({ timeout: 5000 });
		await expect(errorMessage).toContainText(/email|mật khẩu không chính xác/i);

		// Chụp ảnh màn hình để xác nhận lỗi
		await page.screenshot({
			path: "tests/screenshots/B-0012-login-wrong-email.png",
		});

		// Kiểm tra trạng thái của trang (vẫn ở trang đăng nhập)
		await expect(page.locator("h2")).toContainText("Đăng nhập");
	});
});
