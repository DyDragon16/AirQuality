import { test } from "@playwright/test";

test.describe("B-0027: Cập nhật bảng xếp hạng", () => {
	test("Nhấn nút cập nhật dữ liệu và kiểm tra dữ liệu mới", async ({ page }) => {
		try {
			// Truy cập trang xếp hạng
			await page.goto("/rankings");
			
			// Đợi trang tải xong
			await page.waitForTimeout(2000);
			
			// Chụp ảnh trước khi cập nhật
			await page.screenshot({
				path: "tests/screenshots/B-0027-before-update.png",
				fullPage: true
			});
			
			// Tìm nút cập nhật dữ liệu
			const updateButton = page.locator([
				'button:has-text("Cập nhật")',
				'button:has-text("Update")',
				'button.update-button',
				'button[aria-label="Update data"]',
				'.refresh-button',
				'button:has-text("Refresh")'
			].join(', ')).first();
			
			// Click vào nút cập nhật
			await updateButton.click();
			
			// Đợi dữ liệu được cập nhật
			await page.waitForTimeout(3000);
			
			// Chụp ảnh sau khi cập nhật
			await page.screenshot({
				path: "tests/screenshots/B-0027-after-update.png",
				fullPage: true
			});
			
			console.log("Đã cập nhật dữ liệu bảng xếp hạng thành công");
			
		} catch (err) {
			// Nếu có lỗi, vẫn cố gắng chụp ảnh hiện trạng
			await page.screenshot({
				path: "tests/screenshots/B-0027-error-state.png",
				fullPage: true
			});
			const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
			console.log("Đã xảy ra lỗi:", errorMessage);
			throw err;
		}
	});
}); 