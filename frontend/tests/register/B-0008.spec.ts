import { test, expect } from "@playwright/test";

test.describe("B-0008: Đăng ký tài khoản (nhập lại mật khẩu không khớp)", () => {
	test("Hiển thị lỗi khi mật khẩu nhập lại không khớp", async ({ page }) => {
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

		// Nhập lại mật khẩu không khớp
		await page.fill('input[name="confirmPassword"]', "Duy@");

		// Nhấn nút đăng ký
		await page.click('button[type="submit"]');

		// Đợi một chút để đảm bảo validation client-side được thực hiện
		await page.waitForTimeout(500);

		// Kiểm tra thông báo lỗi "mật khẩu nhập lại không khớp"
		const errorMessage = page.locator(".bg-red-100.text-red-700");
		await expect(errorMessage).toBeVisible();
		await expect(errorMessage).toContainText("không khớp");

		// Chụp ảnh màn hình để xác nhận lỗi
		await page.screenshot({
			path: "tests/screenshots/B-0008-password-mismatch.png",
		});

		// Kiểm tra trạng thái của trang (vẫn ở trang đăng ký)
		await expect(page.locator("h2")).toContainText("Đăng ký tài khoản");
	});
});
