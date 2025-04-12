import { test } from "@playwright/test";

test.describe("B-0024: Xem trang home", () => {
	test("Nhấp vào logo AirQuality ở navbar và hiển thị trang chủ", async ({ page }) => {
		try {
			// Truy cập trang xếp hạng để test việc quay về trang chủ
			await page.goto("/rankings");
			
			// Đợi trang tải xong
			await page.waitForTimeout(2000);
			
			// Tìm và click vào logo trong navbar
			const logo = page.locator('.logo, .navbar-brand, header img[alt*="logo" i], header img[alt*="AirQuality" i], a:has-text("AirQuality")').first();
			
			// Click vào logo
			await logo.click();
			
			// Đợi trang tải xong
			await page.waitForTimeout(3000);
			
			// Chụp ảnh trang chủ
			await page.screenshot({
				path: "tests/screenshots/B-0024-home-page.png",
				fullPage: true
			});
			
			console.log("Đã chuyển hướng thành công về trang chủ");
			
		} catch (err) {
			// Nếu có lỗi, vẫn cố gắng chụp ảnh hiện trạng
			await page.screenshot({
				path: "tests/screenshots/B-0024-error-state.png",
				fullPage: true
			});
			const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
			console.log("Đã xảy ra lỗi:", errorMessage);
			throw err;
		}
	});
}); 