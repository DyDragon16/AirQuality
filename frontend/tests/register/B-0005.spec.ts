import { test, expect } from "@playwright/test";

test.describe("B-0005: Đăng ký tài khoản (nhập họ tên có ký tự đặc biệt)", () => {
	test("Hiển thị thông báo lỗi khi nhập họ tên có ký tự đặc biệt", async ({ page }) => {
		// Điều hướng đến trang đăng nhập
		await page.goto("/login");

		// Tìm link "đăng ký ngay" và click
		await page.getByText("Đăng ký ngay").click();

		// Kiểm tra đã chuyển hướng đến trang đăng ký
		await expect(page).toHaveURL(/.*register/);

		// Nhập họ tên có ký tự đặc biệt
		await page.fill('input[name="firstName"]', "Duy@.~");

		// Nhập email
		await page.fill('input[name="email"]', "d@gmail.com");

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

		// Chụp ảnh màn hình để xác nhận kết quả
		await page.screenshot({
			path: "tests/screenshots/B-0005-special-chars-name.png",
		});

		// Kỳ vọng: Phải hiển thị thông báo lỗi "vui lòng không điền ký tự đặt biệt"
		// Kiểm tra xem có thông báo lỗi không
		const errorVisible = await page
			.locator('text=vui lòng không điền ký tự đặt biệt, .bg-red-100:has-text("ký tự đặc biệt")')
			.isVisible()
			.catch(() => false);

		// Kiểm tra xem có đăng ký thành công không
		const successVisible = await page
			.locator('text=Đăng ký thành công')
			.isVisible()
			.catch(() => false);
			
		// Test case này kỳ vọng hiển thị lỗi nhưng thực tế hệ thống đang cho phép đăng ký
		if (!errorVisible) {
			// Ghi log thông tin để debug
			console.log(`Test case B-0005 fails: Không có thông báo lỗi về ký tự đặc biệt trong họ tên. ${successVisible ? 'Đăng ký thành công' : 'Có lỗi khác'}`);
			
			// Thêm expect để test thất bại với thông báo rõ ràng
			// Comment dòng này nếu muốn test pass mà không hiển thị thông báo lỗi
			expect(errorVisible, "Kỳ vọng: Hiển thị thông báo 'vui lòng không điền ký tự đặc biệt'; Thực tế: Không có thông báo lỗi").toBeTruthy();
		}
	});
}); 