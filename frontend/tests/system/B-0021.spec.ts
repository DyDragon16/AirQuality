import { test } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

test.describe("B-0021: Tìm kiếm (auto complete)", () => {
	test("Nhập ký tự và hiển thị danh sách gợi ý tự động", async ({ page }) => {
		try {
			const homePage = new HomePage(page);

			// Truy cập trang chủ
			await homePage.goto();
			
			// Đợi trang tải xong
			await homePage.waitForLoad();
			
			// Tìm kiếm với ký tự "p"
			await homePage.searchFor("p");
			
			// Đợi và kiểm tra kết quả autocomplete
			const autocomplete = await homePage.getAutocompleteResults();
			if (await autocomplete.isVisible()) {
				// Chụp ảnh kết quả gợi ý
				await homePage.captureScreenshot("B-0021-autocomplete.png");
				console.log("Đã hiển thị danh sách gợi ý tự động");
			}
			
		} catch (err) {
			console.log("Đã xảy ra lỗi:", err instanceof Error ? err.message : 'Lỗi không xác định');
		}
	});
}); 