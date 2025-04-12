import { test, expect } from "@playwright/test";

test.describe("B-0025: Kiểm tra chức năng slide pages của thành phố nổi bật", () => {
	test("Nhấn vào nút mũi tên > và chuyển sang trang tiếp theo", async ({ page }) => {
		try {
			// Truy cập trang chủ
			await page.goto("/");
			
			// Đợi cho trang load hoàn tất
			await page.waitForLoadState('networkidle');
			await page.waitForTimeout(2000);

			// Tìm section thành phố nổi bật và scroll đến
			const featuredSection = await page.waitForSelector('h2:has-text("Thành phố nổi bật")');
			await featuredSection.scrollIntoViewIfNeeded();
			await page.waitForTimeout(1000);
			
			// Lưu lại active slide hiện tại
			const initialActiveSlide = await page.$eval('.slick-active', el => el.getAttribute('data-index'));
			
			// Tìm và click nút next
			const nextButton = await page.waitForSelector('button.slick-next');
			await nextButton.click();
			
			// Đợi animation chuyển slide hoàn tất
			await page.waitForTimeout(1000);
			
			// Kiểm tra slide đã chuyển
			const newActiveSlide = await page.$eval('.slick-active', el => el.getAttribute('data-index'));
			expect(newActiveSlide).not.toBe(initialActiveSlide);
			
			// Chụp ảnh sau khi chuyển slide
			await page.screenshot({
				path: "tests/screenshots/B-0025-after-slide.png",
				fullPage: true
			});
			
			console.log("✅ Đã chuyển slide thành công sang trang tiếp theo");
			
		} catch (err) {
			console.error("❌ Đã xảy ra lỗi:", err instanceof Error ? err.message : 'Lỗi không xác định');
			await page.screenshot({
				path: "tests/screenshots/B-0025-error-state.png",
				fullPage: true
			});
			throw err;
		}
	});
}); 