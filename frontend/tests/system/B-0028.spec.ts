import { test } from "@playwright/test";

test.describe("B-0028: Xem chi tiết thành phố trong bảng xếp hạng", () => {
	test("Nhấn chọn thành phố và xem chi tiết", async ({ page }) => {
		try {
			// Truy cập trang xếp hạng
			await page.goto("/rankings");
			
			// Đợi cho trang load hoàn tất
			await page.waitForLoadState('networkidle');
			await page.waitForTimeout(2000);
			
			// Tìm link thành phố Vũng Tàu
			const vungTauLink = await page.waitForSelector([
				'a:has-text("Vũng Tàu")',
				'tr:has-text("Vũng Tàu") a',
				'td:has-text("Vũng Tàu")',
				'[role="row"]:has-text("Vũng Tàu") a'
			].join(', '), { timeout: 5000 });
			
			// Lưu lại tên thành phố
			const cityName = await vungTauLink.textContent();
			console.log("✅ Đã tìm thấy thành phố:", cityName?.trim());
			
			// Lưu URL hiện tại
			const currentUrl = page.url();
			
			// Click vào link Vũng Tàu
			await Promise.all([
				// Đợi điều hướng sau khi click
				page.waitForNavigation(),
				// Click vào link
				vungTauLink.click()
			]);
			
			// Đợi trang chi tiết load xong
			await page.waitForLoadState('networkidle');
			
			// Kiểm tra đã chuyển trang thành công
			const newUrl = page.url();
			if (newUrl === currentUrl) {
				throw new Error("Trang không chuyển hướng sau khi click");
			}
			
			// Chụp ảnh trang chi tiết thành phố
			await page.screenshot({
				path: "tests/screenshots/B-0028-city-detail.png",
				fullPage: true
			});
			
			console.log("✅ Đã chuyển hướng thành công đến trang chi tiết thành phố Vũng Tàu");
			
		} catch (err) {
			console.error("❌ Đã xảy ra lỗi:", err instanceof Error ? err.message : 'Lỗi không xác định');
			
			// Nếu có lỗi, vẫn cố gắng chụp ảnh hiện trạng
			await page.screenshot({
				path: "tests/screenshots/B-0028-error-state.png",
				fullPage: true
			});
			
			throw err;
		}
	});
}); 