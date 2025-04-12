import { test, expect } from "@playwright/test";

test.describe("B-0006: Đăng ký tài khoản (nhập email không hợp lệ)", () => {
	test("Hiển thị lỗi khi đăng ký với email không hợp lệ", async ({ page }) => {
		// Điều hướng đến trang đăng nhập
		await page.goto("/login");

		// Tìm link "đăng ký ngay" và click
		await page.getByText("Đăng ký ngay").click();

		// Kiểm tra đã chuyển hướng đến trang đăng ký
		await expect(page).toHaveURL(/.*register/);

		// Nhập họ tên
		await page.fill('input[name="firstName"]', "Lê Văn Duy");

		// Nhập email không hợp lệ
		await page.fill('input[name="email"]', "duy@gmail.haha");

		// Nhập mật khẩu
		await page.fill('input[name="password"]', "Duy@123");

		// Nhập lại mật khẩu
		await page.fill('input[name="confirmPassword"]', "Duy@123");

		// Nhấn nút đăng ký
		await page.click('button[type="submit"]');

		// Đợi phản hồi từ server
		await page.waitForResponse(
			(response) => response.url().includes("/api/auth/register"),
			{ timeout: 10000 }
		);

		// Kiểm tra thông báo lỗi "đã xảy ra lỗi khi đăng ký"
		const errorMessage = page.locator(".bg-red-100.text-red-700");
		await expect(errorMessage).toBeVisible({ timeout: 5000 });

		// Chụp ảnh màn hình để xác nhận lỗi
		await page.screenshot({
			path: "tests/screenshots/B-0006-invalid-email.png",
		});

		// Kiểm tra trạng thái của trang (vẫn ở trang đăng ký)
		await expect(page.locator("h2")).toContainText("Đăng ký tài khoản");
	});
});
