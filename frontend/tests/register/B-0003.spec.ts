import { test, expect } from "@playwright/test";

test.describe("B-0003: Đăng ký tài khoản (bỏ trống mật khẩu)", () => {
	test("Hiển thị thông báo lỗi khi bỏ trống mật khẩu", async ({ page }) => {
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

		// Không nhập mật khẩu - bỏ qua bước này

		// Nhập lại mật khẩu
		await page.fill('input[name="confirmPassword"]', "Duy@123");

		// Nhấn nút đăng ký
		await page.click('button[type="submit"]');

		// Kiểm tra thông báo lỗi từ HTML5 validation
		const passwordInput = page.locator('input[name="password"]:invalid');
		await expect(passwordInput).toBeVisible();

		// Kiểm tra nội dung thông báo lỗi từ trình duyệt
		const validationMessage = await page.evaluate(() => {
			const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
			return passwordInput.validationMessage;
		});

		expect(validationMessage).toBeTruthy();
		console.log("Thông báo lỗi từ trình duyệt:", validationMessage);

		// Kiểm tra trạng thái của trang (vẫn ở trang đăng ký)
		await expect(page.locator("h2")).toContainText("Đăng ký tài khoản");

		// Chụp ảnh màn hình để xác nhận lỗi
		await page.screenshot({
			path: "tests/screenshots/B-0003-empty-password.png",
		});
	});
}); 