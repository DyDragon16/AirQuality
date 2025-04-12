import { test, expect } from "@playwright/test";

test.describe("B-0017: Gửi yêu cầu đặt lại mật khẩu thành công", () => {
	test("Hiển thị thông báo gửi mail đặt lại mật khẩu thành công", async ({
		page,
	}) => {
		// Điều hướng đến trang đăng nhập
		await page.goto("/login");

		// Kiểm tra tiêu đề trang đăng nhập
		await expect(page.locator("h2")).toContainText("Đăng nhập");

		// Nhấn nút quên mật khẩu
		await page.click('a:has-text("Quên mật khẩu"), a[href*="forgot-password"]');

		// Kiểm tra đã chuyển hướng đến trang quên mật khẩu
		await expect(page).toHaveURL(/.*forgot-password/);

		// Kiểm tra tiêu đề trang quên mật khẩu
		await expect(page.locator("h2")).toContainText(
			/Quên mật khẩu|Đặt lại mật khẩu/
		);

		// Nhập email
		await page.fill('input[name="email"]', "duyle16vip@gmail.com");

		// Nhấn nút gửi yêu cầu
		await page.click('button[type="submit"]');

		// Đợi phản hồi từ server
		await page.waitForResponse(
			(response) => response.url().includes("/api/auth/forgot-password"),
			{ timeout: 10000 }
		);

		// Kiểm tra thông báo gửi mail đặt lại mật khẩu thành công
		const successMessage = page.locator(
			".bg-green-50, .text-green-700, .alert-success"
		);
		await expect(successMessage).toBeVisible({ timeout: 5000 });
		await expect(successMessage).toContainText(
			/đã gửi|thành công|kiểm tra email/i
		);

		// Chụp ảnh màn hình để xác nhận kết quả
		await page.screenshot({
			path: "tests/screenshots/B-0017-forgot-password-success.png",
		});
	});
});
