import { test, expect } from "@playwright/test";

test.describe("B-0018: Gửi yêu cầu đặt lại mật khẩu (sai định dạng mail)", () => {
	test("Hiển thị lỗi khi nhập email không đúng định dạng", async ({ page }) => {
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

		// Nhập email sai định dạng
		await page.fill('input[name="email"]', "duy@gmail");

		// Nhấn nút gửi yêu cầu
		await page.click('button[type="submit"]');

		// Kiểm tra thông báo lỗi từ validation HTML5 cho định dạng email
		await expect(page.locator('input[name="email"]:invalid')).toBeVisible();

		// Hoặc kiểm tra thông báo lỗi từ server nếu validation được thực hiện phía server
		try {
			// Đợi phản hồi từ server nếu request được gửi
			await page.waitForResponse(
				(response) => response.url().includes("/api/auth/forgot-password"),
				{ timeout: 5000 }
			);

			// Kiểm tra thông báo lỗi từ server
			const errorMessage = page.locator(
				".bg-red-100, .text-red-700, .alert-error"
			);
			if (await errorMessage.isVisible()) {
				await expect(errorMessage).toContainText(
					/email không chính xác|định dạng không hợp lệ/i
				);
			}
		} catch (error) {
			// Nếu không có request đến server (do validation client-side), thì kiểm tra lại validation HTML5
			await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
		}

		// Chụp ảnh màn hình để xác nhận lỗi
		await page.screenshot({
			path: "tests/screenshots/B-0018-forgot-password-invalid-email.png",
		});

		// Kiểm tra trạng thái của trang (vẫn ở trang quên mật khẩu)
		await expect(page.locator("h2")).toContainText(
			/Quên mật khẩu|Đặt lại mật khẩu/
		);
	});
});
