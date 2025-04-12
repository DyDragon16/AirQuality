import { test, expect } from "@playwright/test";

test("B-0031 - Toàn màn hình bản đồ chất lượng không khí", async ({ page }) => {
  // Truy cập trang chất lượng không khí
  await page.goto("/air-quality");
  
  // Đợi cho bản đồ load xong
  await page.waitForSelector(".leaflet-container", { timeout: 10000 });
  
  // Click nút fullscreen
  await page.locator("button.leaflet-control:has-text('⛶')").click();
  
  // Đợi cho animation fullscreen hoàn thành
  await page.waitForTimeout(1000);
  
  // Kiểm tra xem bản đồ có ở chế độ fullscreen không
  const isFullscreen = await page.evaluate(() => {
    return !!document.fullscreenElement;
  });
  
  expect(isFullscreen).toBe(true);
  
  // Chụp ảnh kết quả
  await page.screenshot({ path: "test-results/B-0031.png" });
  
  // Thoát khỏi chế độ fullscreen
  await page.keyboard.press("Escape");
}); 