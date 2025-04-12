import { test } from "@playwright/test";

test("B-0030 - Thu nhỏ bản đồ chất lượng không khí", async ({ page }) => {
  // Truy cập trang chất lượng không khí
  await page.goto("/air-quality");
  
  // Đợi cho bản đồ và controls load xong
  await page.waitForSelector(".leaflet-container", { timeout: 10000 });
  await page.waitForSelector(".leaflet-control-zoom-out", { timeout: 10000 });
  
  // Chụp ảnh trước khi zoom out
  await page.screenshot({ path: "tests/screenshots/B-0030-before.png" });
  
  // Click nút zoom out (-)
  await page.locator(".leaflet-control-zoom-out").click();
  
  // Đợi animation zoom hoàn thành
  await page.waitForTimeout(1000);
  
  // Chụp ảnh sau khi zoom out để verify
  await page.screenshot({ path: "tests/screenshots/B-0030-after.png" });
}); 