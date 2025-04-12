import { test, expect } from "@playwright/test";

test.describe("B-0010: Đăng nhập (bỏ trống email)", () => {
	test("Hiển thị lỗi khi bỏ trống email", async ({ page }) => {
		// Điều hướng đến trang đăng nhập
		await page.goto("/login");

		// Kiểm tra tiêu đề trang đăng nhập
		await expect(page.locator("h2")).toContainText("Đăng nhập");

		// Không nhập email

		// Nhập mật khẩu
		await page.fill('input[name="password"]', "Duy@123");

		// Nhấn nút đăng nhập
		await page.click('button[type="submit"]');

		// Kiểm tra thông báo lỗi
		await expect(page.locator('input[name="email"]:invalid')).toBeVisible();

		// Chụp ảnh màn hình để xác nhận lỗi
		await page.screenshot({
			path: "tests/screenshots/B-0010-login-empty-email.png",
		});

		// Kiểm tra trạng thái của trang (vẫn ở trang đăng nhập)
		await expect(page.locator("h2")).toContainText("Đăng nhập");

		// Kiểm tra thông báo lỗi qua tooltip của trình duyệt (validation HTML5)
		// Không thể kiểm tra trực tiếp nội dung tooltip, nhưng có thể kiểm tra trạng thái invalid
		await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
	});
});
