import { test, expect } from "@playwright/test";

test.describe("B-0009: Đăng ký tài khoản thành công", () => {
	test("Hiển thị thông báo đăng ký thành công", async ({ page }) => {
		// Điều hướng đến trang đăng nhập
		await page.goto("/login");

		// Tìm link "đăng ký ngay" và click
		await page.getByText("Đăng ký ngay").click();

		// Kiểm tra đã chuyển hướng đến trang đăng ký
		await expect(page).toHaveURL(/.*register/);

		// Tạo email ngẫu nhiên để tránh lỗi email đã tồn tại
		const uniqueEmail = `duyle16vip.${Date.now()}@gmail.com`;

		// Nhập họ tên (theo yêu cầu)
		await page.fill('input[name="firstName"]', "Lê Văn Duy");

		// Nhập email (sử dụng email ngẫu nhiên thay vì email cố định để tránh trùng lặp)
		await page.fill('input[name="email"]', uniqueEmail);

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

		// Kiểm tra tiêu đề trang đã đổi thành "Đăng ký thành công!"
		await expect(page.locator("h2")).toContainText("Đăng ký thành công!");

		// Kiểm tra thông báo thành công cụ thể
		await expect(page.locator("h3.text-green-700")).toContainText(
			"Đăng ký thành công!"
		);

		// Chụp ảnh màn hình để xác nhận kết quả
		await page.screenshot({
			path: "tests/screenshots/B-0009-registration-success.png",
		});
	});
});
