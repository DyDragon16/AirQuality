import { test, expect } from "@playwright/test";

test.describe("B-0002: Đăng ký tài khoản (bỏ trống email)", () => {
	test("Hiển thị thông báo lỗi khi bỏ trống email", async ({ page }) => {
		// Điều hướng đến trang đăng nhập
		await page.goto("/login");

		// Tìm link "đăng ký ngay" và click
		await page.getByText("Đăng ký ngay").click();

		// Kiểm tra đã chuyển hướng đến trang đăng ký
		await expect(page).toHaveURL(/.*register/);

		// Nhập họ tên
		await page.fill('input[name="firstName"]', "Lê Văn Duy");

		// Không nhập email - bỏ qua bước này

		// Nhập mật khẩu
		await page.fill('input[name="password"]', "Duy@123");

		// Nhập lại mật khẩu
		await page.fill('input[name="confirmPassword"]', "Duy@123");

		// Nhấn nút đăng ký
		await page.click('button[type="submit"]');

		// Kiểm tra thông báo lỗi từ HTML5 validation
		const emailInput = page.locator('input[name="email"]:invalid');
		await expect(emailInput).toBeVisible();

		// Kiểm tra nội dung thông báo lỗi từ trình duyệt
		const validationMessage = await page.evaluate(() => {
			const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
			return emailInput.validationMessage;
		});

		expect(validationMessage).toBeTruthy();
		console.log("Thông báo lỗi từ trình duyệt:", validationMessage);

		// Kiểm tra trạng thái của trang (vẫn ở trang đăng ký)
		await expect(page.locator("h2")).toContainText("Đăng ký tài khoản");

		// Chụp ảnh màn hình để xác nhận lỗi
		await page.screenshot({
			path: "tests/screenshots/B-0002-empty-email.png",
		});
	});
}); 