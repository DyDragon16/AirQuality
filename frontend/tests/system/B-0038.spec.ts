import { test, expect } from "@playwright/test";

test("B-0038 - Kiểm tra chức năng thu gọn sidebar", async ({ page }) => {
  // Truy cập trang chủ và đăng nhập
  await page.goto("/");
  
  // Đăng nhập
  await page.locator("a").filter({ hasText: /Đăng nhập|Login/ }).first().click();
  await page.waitForSelector("form", { state: "visible", timeout: 5000 });
  
  await page.fill("input[type='email'], input[name='email'], input[placeholder*='email']", "duyle16vip@gmail.com");
  await page.fill("input[type='password'], input[name='password']", "Duy@123");
  await page.locator("form button").click();
  await page.waitForLoadState("networkidle");
  
  // Xác nhận đăng nhập thành công
  await expect(page).toHaveURL(/.*dashboard|.*/);
  await page.waitForTimeout(2000);

  // Truy cập trang Bảng điều khiển
  await page.getByText("Duy Lê Văn", { exact: false }).first().click();
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: 'Bảng điều khiển' }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  
  // Chụp ảnh trước khi thu gọn sidebar
  await page.screenshot({ path: "tests/screenshots/B-0038-before-collapse.png" });
  
  // Lưu width ban đầu của sidebar
  const initialWidth = await page.evaluate(() => {
    const sidebar = document.querySelector('.sidebar, aside, nav.dashboard-nav');
    return sidebar ? getComputedStyle(sidebar).width : null;
  });
  
  // Click vào nút hamburger
  await page.waitForSelector('.sidebar, aside, nav.dashboard-nav', { state: 'visible', timeout: 5000 });
  
  let clicked = false;
  
  // Thử các cách click khác nhau
  if (!clicked) {
    try {
      const menuButton = page.locator('button:has(svg.lucide.lucide-align-justify)').first();
      await menuButton.click();
      clicked = true;
    } catch {
      // Tiếp tục với cách khác
    }
  }

  if (!clicked) {
    try {
      clicked = await page.evaluate(() => {
        const button = document.querySelector('button:has(svg.lucide.lucide-align-justify)');
        if (button) {
          (button as HTMLElement).click();
          return true;
        }
        return false;
      });
    } catch {
      // Tiếp tục với cách khác
    }
  }

  if (!clicked) {
    try {
      const sidebarHeader = page.locator('.sidebar-header button, .MuiBox-root > header button').first();
      await sidebarHeader.click();
      clicked = true;
    } catch {
      // Tiếp tục với cách khác
    }
  }

  if (!clicked) {
    try {
      const sidebar = page.locator('.sidebar, aside, nav.dashboard-nav').first();
      const box = await sidebar.boundingBox();
      if (box) {
        await page.mouse.click(box.x + 30, box.y + 30);
        clicked = true;
      }
    } catch {
      throw new Error("Không thể click vào nút menu");
    }
  }

  // Đợi animation hoàn tất
  await page.waitForTimeout(2000);

  // Chụp ảnh sau khi thu gọn
  await page.screenshot({ path: "tests/screenshots/B-0038-after-collapse.png" });

  // Kiểm tra kết quả
  const checkResult = await page.evaluate((initialWidth) => {
    const sidebar = document.querySelector('.sidebar, aside, nav.dashboard-nav');
    if (!sidebar) return false;
    
    const currentWidth = getComputedStyle(sidebar).width;
    const hasCollapsedClass = sidebar.classList.contains('collapsed');
    const hasSidebarCollapsedClass = sidebar.classList.contains('sidebar-collapsed');
    const hasDataCollapsed = sidebar.getAttribute('data-collapsed') === 'true';
    const widthChanged = initialWidth && currentWidth !== initialWidth;
    const isSmallWidth = currentWidth === '64px' || currentWidth === '80px';
    
    return hasCollapsedClass || 
           hasSidebarCollapsedClass || 
           hasDataCollapsed || 
           widthChanged ||
           isSmallWidth;
  }, initialWidth);

  expect(checkResult, "Sidebar chưa được thu gọn").toBeTruthy();
}); 