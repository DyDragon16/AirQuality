import { test } from "@playwright/test";

test("B-0033 - Chế độ xem mặc định bản đồ chất lượng không khí", async ({ page }) => {
  // Truy cập trang chất lượng không khí
  await page.goto("/air-quality");
  
  // Đợi cho bản đồ load xong
  await page.waitForSelector(".leaflet-container", { timeout: 30000 });
  
  // Chụp ảnh trước khi thay đổi
  await page.screenshot({ path: "tests/screenshots/B-0033-before.png" });
  
  // Tìm và click nút layer control bằng JavaScript để tránh vấn đề với intercepting events
  await page.evaluate(() => {
    const layerButton = document.querySelector('.leaflet-control-layers-toggle');
    if (layerButton) {
      (layerButton as HTMLElement).click();
    }
  });
  
  // Đợi cho danh sách layer hiển thị
  await page.waitForTimeout(2000);
  
  // Click vào radio button cho Mặc định bằng JavaScript
  await page.evaluate(() => {
    // Tìm tất cả các radio buttons trong layer control
    const radioButtons = document.querySelectorAll('.leaflet-control-layers-base input[type="radio"]');
    
    // Click vào radio button đầu tiên (index 0) cho Mặc định
    if (radioButtons.length > 0) {
      (radioButtons[0] as HTMLElement).click();
    }
  });
  
  // Đợi animation chuyển layer hoàn thành
  await page.waitForTimeout(2000);
  
  // Chụp ảnh kết quả
  await page.screenshot({ path: "tests/screenshots/B-0033-after.png" });
}); 