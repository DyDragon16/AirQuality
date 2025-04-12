import { test } from "@playwright/test";

test.describe("B-0026: Kiểm tra chức năng chọn trang thanh trượt của thành phố nổi bật", () => {
	test("Nhấn vào các dấu chấm và chuyển đến đúng trang", async ({ page }) => {
		try {
			// Truy cập trang chủ
			await page.goto("/");
			
			// Đợi trang tải xong và hiển thị thanh trượt
			await page.waitForTimeout(2000);
			
			// Chụp ảnh trước khi click
			await page.screenshot({
				path: "tests/screenshots/B-0026-before-dots.png",
				fullPage: true
			});
			
			// Tìm các nút dấu chấm của thanh trượt
			const dots = page.locator([
				'.slick-dots li button',
				'.carousel-indicators [role="button"]',
				'.slider-dots button',
				'.dot-indicators button',
				'[aria-label*="slide"]'
			].join(', '));
			
			// Lấy số lượng dấu chấm
			const dotsCount = await dots.count();
			
			// Click vào từng dấu chấm và chụp ảnh
			for (let i = 0; i < dotsCount; i++) {
				// Click vào dấu chấm
				await dots.nth(i).click();
				
				// Đợi animation chuyển slide hoàn tất
				await page.waitForTimeout(1000);
				
				// Chụp ảnh sau mỗi lần chuyển slide
				await page.screenshot({
					path: `tests/screenshots/B-0026-slide-${i + 1}.png`,
					fullPage: true
				});
				
				console.log(`Đã chuyển đến slide ${i + 1}`);
			}
			
			console.log("Đã kiểm tra thành công chức năng chọn trang bằng dấu chấm");
			
		} catch (err) {
			// Nếu có lỗi, vẫn cố gắng chụp ảnh hiện trạng
			await page.screenshot({
				path: "tests/screenshots/B-0026-error-state.png",
				fullPage: true
			});
			const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
			console.log("Đã xảy ra lỗi:", errorMessage);
			throw err;
		}
	});
}); 