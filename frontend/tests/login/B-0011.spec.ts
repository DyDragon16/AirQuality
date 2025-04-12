import { test, expect } from "@playwright/test";

test.describe("B-0011: Đăng nhập (bỏ trống mật khẩu)", () => {
	test("Hiển thị lỗi khi bỏ trống mật khẩu", async ({ page }) => {
		// Điều hướng đến trang đăng nhập
		await page.goto("/login");

		// Kiểm tra tiêu đề trang đăng nhập
		await expect(page.locator("h2")).toContainText("Đăng nhập");

		// Nhập email
		await page.fill('input[name="email"]', "duyle16vip@gmail.com");

		// Không nhập mật khẩu

		// Nhấn nút đăng nhập
		await page.click('button[type="submit"]');

		// Kiểm tra thông báo lỗi required của trường password
		await expect(page.locator('input[name="password"]:invalid')).toBeVisible();

		// Chụp ảnh màn hình để xác nhận lỗi
		await page.screenshot({
			path: "tests/screenshots/B-0011-login-empty-password.png",
		});

		// Kiểm tra trạng thái của trang (vẫn ở trang đăng nhập)
		await expect(page.locator("h2")).toContainText("Đăng nhập");
	});
});
