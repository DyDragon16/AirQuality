import { test } from "@playwright/test";

test("B-0035 - Di chuyển vị trí bản đồ chất lượng không khí", async ({ page }) => {
  // Truy cập trang chất lượng không khí
  await page.goto("/air-quality");
  
  // Đợi cho bản đồ load xong
  await page.waitForSelector(".leaflet-container", { timeout: 30000 });
  
  // Lấy vị trí hiện tại của bản đồ
  const initialPosition = await page.evaluate(() => {
    // @ts-expect-error Leaflet map không được định nghĩa trong TypeScript
    const map = document.querySelector('.leaflet-container')?._leaflet_map;
    if (map) {
      const center = map.getCenter();
      return { lat: center.lat, lng: center.lng };
    }
    return null;
  });
  
  // Chụp ảnh trước khi di chuyển
  await page.screenshot({ path: "tests/screenshots/B-0035-before.png" });
  
  // Di chuyển bản đồ bằng cách kéo và thả
  const mapElement = page.locator(".leaflet-container");
  const mapBounds = await mapElement.boundingBox();
  
  if (mapBounds) {
    // Tính toán điểm bắt đầu và kết thúc của thao tác kéo
    const startX = mapBounds.x + mapBounds.width / 2;
    const startY = mapBounds.y + mapBounds.height / 2;
    const endX = startX - 100; // Di chuyển sang trái 100px
    const endY = startY - 100; // Di chuyển lên trên 100px
    
    // Thực hiện thao tác kéo và thả
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 }); // Di chuyển từ từ với 10 bước
    await page.mouse.up();
  }
  
  // Đợi animation di chuyển hoàn thành
  await page.waitForTimeout(2000);
  
  // Lấy vị trí mới của bản đồ
  const newPosition = await page.evaluate(() => {
    // @ts-expect-error Leaflet map không được định nghĩa trong TypeScript
    const map = document.querySelector('.leaflet-container')?._leaflet_map;
    if (map) {
      const center = map.getCenter();
      return { lat: center.lat, lng: center.lng };
    }
    return null;
  });
  
  // Chụp ảnh sau khi di chuyển
  await page.screenshot({ path: "tests/screenshots/B-0035-after.png" });
  
  // Log kết quả để debugging
  console.log("Vị trí ban đầu:", initialPosition);
  console.log("Vị trí mới:", newPosition);
}); 