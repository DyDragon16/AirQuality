import { test } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

test.describe("B-0020: Tìm kiếm", () => {
	test("Tìm kiếm và xem chi tiết thành phố", async ({ page }) => {
		try {
			const homePage = new HomePage(page);
			const cityName = "phan thiết";

			// Truy cập trang chủ
			await homePage.goto();
			
			// Đợi trang tải xong
			await homePage.waitForLoad();
			
			// Tìm kiếm thành phố
			await homePage.searchFor(cityName);
			
			// Chụp ảnh kết quả tìm kiếm
			await homePage.captureScreenshot("B-0020-search-input.png");
			
			// Click nút tìm kiếm
			await homePage.clickSearchButton();
			
			// Kiểm tra đã chuyển đến trang chi tiết thành phố
			await homePage.checkCityDetailPage(cityName);
			
			// Chụp ảnh trang chi tiết
			await homePage.captureScreenshot("B-0020-city-detail.png");
			
			console.log(`Đã chuyển hướng thành công đến trang chi tiết thành phố ${cityName}`);
			
		} catch (err) {
			// Nếu có lỗi, vẫn cố gắng chụp ảnh hiện trạng
			await page.screenshot({
				path: "tests/screenshots/B-0020-error-state.png",
				fullPage: true
			});
			console.log("Đã xảy ra lỗi:", err instanceof Error ? err.message : 'Lỗi không xác định');
			throw err;
		}
	});
}); 