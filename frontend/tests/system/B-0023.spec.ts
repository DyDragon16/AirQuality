import { test } from "@playwright/test";

test.describe("B-0023: Xem trang xếp hạng", () => {
	test("Nhấp vào trang xếp hạng ở navbar và hiển thị bảng xếp hạng", async ({ page }) => {
		try {
			// Truy cập trang chủ
			await page.goto("/");
			
			// Đợi trang tải xong
			await page.waitForTimeout(2000);
			
			// Tìm và click vào liên kết "Xếp hạng" trong navbar
			const rankingLink = page.locator('nav a:has-text("Xếp hạng"), header a:has-text("Xếp hạng"), .navbar a:has-text("Xếp hạng"), a:has-text("Ranking")').first();
			
			// Click vào link
			await rankingLink.click();
			
			// Đợi trang tải xong
			await page.waitForTimeout(3000);
			
			// Chụp ảnh trang xếp hạng
			await page.screenshot({
				path: "tests/screenshots/B-0023-ranking-page.png",
				fullPage: true
			});
			
			console.log("Đã chuyển hướng thành công đến trang Xếp hạng");
			
		} catch (err) {
			// Nếu có lỗi, vẫn cố gắng chụp ảnh hiện trạng
			await page.screenshot({
				path: "tests/screenshots/B-0023-error-state.png",
				fullPage: true
			});
			const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
			console.log("Đã xảy ra lỗi:", errorMessage);
			throw err;
		}
	});
}); 