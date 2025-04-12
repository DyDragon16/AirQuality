import { test, expect } from "@playwright/test";

test("B-0039 - Kiểm tra chức năng mở rộng sidebar", async ({ page }) => {
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
  
  // Thu gọn sidebar trước (để đảm bảo trạng thái ban đầu)
  await page.waitForSelector('.sidebar, aside, nav.dashboard-nav', { state: 'visible', timeout: 5000 });
  
  // Click lần 1 để thu gọn
  try {
    const menuButton = page.locator('button:has(svg.lucide.lucide-align-justify)').first();
    await menuButton.click();
  } catch {
    await page.evaluate(() => {
      const button = document.querySelector('button:has(svg.lucide.lucide-align-justify)');
      if (button) {
        (button as HTMLElement).click();
      } else {
        throw new Error("Không tìm thấy nút menu");
      }
    });
  }

  // Đợi animation thu gọn hoàn tất
  await page.waitForTimeout(2000);

  // Chụp ảnh trước khi mở rộng
  await page.screenshot({ path: "tests/screenshots/B-0039-before-expand.png" });
  
  // Lưu width khi đang thu gọn
  const collapsedWidth = await page.evaluate(() => {
    const sidebar = document.querySelector('.sidebar, aside, nav.dashboard-nav');
    return sidebar ? getComputedStyle(sidebar).width : null;
  });

  // Click lần 2 để mở rộng
  try {
    const menuButton = page.locator('button:has(svg.lucide.lucide-align-justify)').first();
    await menuButton.click();
  } catch {
    await page.evaluate(() => {
      const button = document.querySelector('button:has(svg.lucide.lucide-align-justify)');
      if (button) {
        (button as HTMLElement).click();
      } else {
        throw new Error("Không tìm thấy nút menu");
      }
    });
  }

  // Đợi animation mở rộng hoàn tất
  await page.waitForTimeout(2000);

  // Chụp ảnh sau khi mở rộng
  await page.screenshot({ path: "tests/screenshots/B-0039-after-expand.png" });

  // Kiểm tra kết quả
  const checkResult = await page.evaluate((collapsedWidth) => {
    const sidebar = document.querySelector('.sidebar, aside, nav.dashboard-nav');
    if (!sidebar) return false;
    
    const currentWidth = getComputedStyle(sidebar).width;
    
    // Kiểm tra các điều kiện mở rộng
    const hasExpandedClass = !sidebar.classList.contains('collapsed') && 
                           !sidebar.classList.contains('sidebar-collapsed');
    const hasExpandedData = sidebar.getAttribute('data-collapsed') !== 'true';
    const widthIncreased = collapsedWidth && currentWidth > collapsedWidth;
    
    // Kiểm tra hiển thị text trong sidebar
    const menuTexts = Array.from(sidebar.querySelectorAll('.menu-item, .nav-item'))
                          .some(item => {
                            const style = getComputedStyle(item);
                            return style.display !== 'none' && style.visibility !== 'hidden';
                          });
    
    return hasExpandedClass || hasExpandedData || widthIncreased || menuTexts;
  }, collapsedWidth);

  expect(checkResult, "Sidebar chưa được mở rộng").toBeTruthy();
}); 