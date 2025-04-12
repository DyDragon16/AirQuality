import { test } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

test.describe("B-0022: Xem trang chất lượng không khí", () => {
	test("Nhấp vào chất lượng không khí ở navbar và hiển thị bản đồ", async ({ page }) => {
		try {
			const homePage = new HomePage(page);
			
			// Tăng timeout cho test case
			test.setTimeout(50000);

			// Truy cập trang chủ
			await homePage.goto();
			
			// Đợi trang tải xong
			await homePage.waitForLoad();
			
			// Click vào link chất lượng không khí
			await homePage.clickAirQualityLink();
			
			// Đợi và kiểm tra bản đồ
			const mapElement = await homePage.getMapElement();
			await mapElement.waitFor({ state: 'visible', timeout: 10000 });
			
			// Click nút zoom out để thấy tất cả thành phố
			await homePage.clickZoomOut();
			
			// Chụp ảnh bản đồ sau khi đã zoom out
			await homePage.captureMapScreenshot("B-0022-air-quality-map.png");
			
			console.log("Test case B-0022 đã hoàn thành thành công");
		} catch (error) {
			console.error("Lỗi trong test case B-0022:", error);
			throw error;
		}
	});
}); 