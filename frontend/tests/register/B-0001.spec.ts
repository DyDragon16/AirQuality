import { test, expect } from "@playwright/test";

test.describe("B-0001: Đăng ký tài khoản (bỏ trống họ tên)", () => {
	test("Hiển thị thông báo lỗi khi bỏ trống họ tên", async ({ page }) => {
		// Điều hướng đến trang đăng nhập
		await page.goto("/login");

		// Tìm link "đăng ký ngay" và click
		await page.getByText("Đăng ký ngay").click();

		// Kiểm tra đã chuyển hướng đến trang đăng ký
		await expect(page).toHaveURL(/.*register/);

		// Không nhập họ tên - bỏ qua bước này

		// Nhập email
		await page.fill('input[name="email"]', "duyle16vip@gmail.com");

		// Nhập mật khẩu
		await page.fill('input[name="password"]', "Duy@123");

		// Nhập lại mật khẩu
		await page.fill('input[name="confirmPassword"]', "Duy@123");

		// Nhấn nút đăng ký
		await page.click('button[type="submit"]');

		// Kiểm tra thông báo lỗi từ HTML5 validation
		const nameInput = page.locator('input[name="firstName"]:invalid');
		await expect(nameInput).toBeVisible();

		// Kiểm tra nội dung thông báo lỗi từ trình duyệt
		const validationMessage = await page.evaluate(() => {
			const nameInput = document.querySelector('input[name="firstName"]') as HTMLInputElement;
			return nameInput.validationMessage;
		});

		expect(validationMessage).toBeTruthy();
		console.log("Thông báo lỗi từ trình duyệt:", validationMessage);

		// Kiểm tra trạng thái của trang (vẫn ở trang đăng ký)
		await expect(page.locator("h2")).toContainText("Đăng ký tài khoản");

		// Chụp ảnh màn hình để xác nhận lỗi
		await page.screenshot({
			path: "tests/screenshots/B-0001-empty-name.png",
		});
	});
}); 