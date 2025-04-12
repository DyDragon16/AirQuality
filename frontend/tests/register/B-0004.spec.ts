import { test, expect } from "@playwright/test";

test.describe("B-0004: Đăng ký tài khoản (bỏ trống nhập lại mật khẩu)", () => {
	test("Hiển thị thông báo lỗi khi bỏ trống nhập lại mật khẩu", async ({ page }) => {
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

		// Nhập mật khẩu
		await page.fill('input[name="password"]', "Duy@123");

		// Không nhập lại mật khẩu - bỏ qua bước này

		// Nhấn nút đăng ký
		await page.click('button[type="submit"]');

		// Kiểm tra thông báo lỗi từ HTML5 validation
		const confirmPasswordInput = page.locator('input[name="confirmPassword"]:invalid');
		await expect(confirmPasswordInput).toBeVisible();

		// Kiểm tra nội dung thông báo lỗi từ trình duyệt
		const validationMessage = await page.evaluate(() => {
			const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]') as HTMLInputElement;
			return confirmPasswordInput.validationMessage;
		});

		expect(validationMessage).toBeTruthy();
		console.log("Thông báo lỗi từ trình duyệt:", validationMessage);

		// Kiểm tra trạng thái của trang (vẫn ở trang đăng ký)
		await expect(page.locator("h2")).toContainText("Đăng ký tài khoản");

		// Chụp ảnh màn hình để xác nhận lỗi
		await page.screenshot({
			path: "tests/screenshots/B-0004-empty-confirm-password.png",
		});
	});
}); 