import { test, expect } from "@playwright/test";

test.describe("B-0007: Đăng ký tài khoản (nhập mật khẩu không đủ 6 ký tự)", () => {
	test("Hiển thị lỗi khi đăng ký với mật khẩu ngắn", async ({ page }) => {
		// Điều hướng đến trang đăng nhập
		await page.goto("/login");

		// Tìm link "đăng ký ngay" và click
		await page.getByText("Đăng ký ngay").click();

		// Kiểm tra đã chuyển hướng đến trang đăng ký
		await expect(page).toHaveURL(/.*register/);

		// Nhập họ tên
		await page.fill('input[name="firstName"]', "Lê Văn Duy");

		// Nhập email
		await page.fill('input[name="email"]', "duyle16vip@gmail.com");

		// Nhập mật khẩu không đủ 6 ký tự
		await page.fill('input[name="password"]', "123");

		// Nhập lại mật khẩu
		await page.fill('input[name="confirmPassword"]', "123");

		// Nhấn nút đăng ký
		await page.click('button[type="submit"]');

		// Kiểm tra thông báo lỗi về độ dài mật khẩu tối thiểu
		// Phần này kiểm tra validation HTML5 (minlength)
		await expect(page.locator('input[name="password"]:invalid')).toBeVisible();

		// Hoặc kiểm tra thông báo lỗi từ form
		const errorText = page.locator(
			'text=mật khẩu phải kéo dài ít nhất 6 ký tự trở lên, .bg-red-100, div[role="alert"], .text-red-700'
		);

		const hasError = await Promise.race([
			page
				.locator('input[name="password"]:invalid')
				.isVisible()
				.then((visible) => visible),
			errorText
				.isVisible()
				.then((visible) => visible)
				.catch(() => false),
		]);

		// Chụp ảnh màn hình để xác nhận lỗi
		await page.screenshot({
			path: "tests/screenshots/B-0007-short-password.png",
		});

		// Kiểm tra kỳ vọng
		expect(hasError).toBeTruthy();

		// Kiểm tra trạng thái của trang (vẫn ở trang đăng ký)
		await expect(page.locator("h2")).toContainText("Đăng ký tài khoản");
	});
});
