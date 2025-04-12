import { test} from "@playwright/test";

test("B-0029 - Phóng to bản đồ chất lượng không khí", async ({ page }) => {
  // Truy cập trang chất lượng không khí
  await page.goto("/air-quality");
  
  // Đợi cho bản đồ và controls load xong
  await page.waitForSelector(".leaflet-container", { timeout: 10000 });
  await page.waitForSelector(".leaflet-control-zoom-in", { timeout: 10000 });
  
  // Chụp ảnh trước khi zoom
  await page.screenshot({ path: "tests/screenshots/B-0029-before.png" });
  
  // Click nút zoom in (+)
  await page.locator(".leaflet-control-zoom-in").click();
  
  // Đợi animation zoom hoàn thành
  await page.waitForTimeout(1000);
  
  // Chụp ảnh sau khi zoom để verify
  await page.screenshot({ path: "tests/screenshots/B-0029-after.png" });
}); 