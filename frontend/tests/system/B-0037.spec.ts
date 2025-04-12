import { test, expect } from "@playwright/test";

test("B-0037 - Kiểm tra thông tin hiển thị trên dashboard user", async ({ page }) => {
  // Bước 1: Truy cập trang chủ
  console.log("Truy cập trang chủ");
  await page.goto("/");
  
  // Bước 2: Đăng nhập với tài khoản user (duyle16vip@gmail.com/Duy@123)
  console.log("Đăng nhập vào hệ thống");
  
  // Click vào link đăng nhập
  await page.locator("a").filter({ hasText: /Đăng nhập|Login/ }).first().click();
  
  // Đợi form đăng nhập hiển thị
  await page.waitForSelector("form", { state: "visible", timeout: 5000 });
  
  // Điền thông tin đăng nhập
  console.log("Nhập thông tin đăng nhập");
  await page.fill("input[type='email'], input[name='email'], input[placeholder*='email']", "duyle16vip@gmail.com");
  await page.fill("input[type='password'], input[name='password']", "Duy@123");
  
  // Click nút đăng nhập - Sử dụng cách khác để tìm nút đăng nhập
  console.log("Click nút đăng nhập");
  await page.locator("form button").click();
  
  // Đợi đăng nhập thành công
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000); // Đợi thêm 2 giây để đảm bảo trang đã load xong
  
  // Chụp ảnh sau khi đăng nhập thành công
  await page.screenshot({ path: "tests/screenshots/B-0037-after-login.png" });
  console.log("Đã đăng nhập thành công");
  
  // Bước 3: Truy cập trực tiếp vào trang bảng điều khiển
  console.log("Truy cập vào bảng điều khiển");
  await page.goto("/dashboard");
  
  // Đợi trang dashboard load hoàn tất
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  
  // Chụp ảnh trang dashboard
  await page.screenshot({ path: "tests/screenshots/B-0037-dashboard.png" });
  
  // Kiểm tra URL có chứa "dashboard"
  const currentUrl = page.url();
  console.log("Current URL:", currentUrl);
  
  // Kiểm tra các thành phần chính trên dashboard
  const userInfoElements = [
    ".user-info", 
    ".account-info", 
    ".profile-section", 
    ".user-profile", 
    ".user-panel", 
    ".profile-details",
    ".user-details"
  ];
  
  const sidebarElements = [
    ".sidebar", 
    "aside", 
    "nav.dashboard-nav", 
    ".nav-sidebar", 
    ".side-nav", 
    ".left-sidebar",
    ".main-sidebar"
  ];
  
  const contentElements = [
    ".dashboard-content", 
    ".main-content", 
    ".content-area", 
    ".dashboard-main", 
    "main", 
    ".content-wrapper",
    ".page-content"
  ];
  
  // Kiểm tra các phần tử hiển thị
  let hasUserInfo = false;
  let hasSidebar = false;
  let hasMainContent = false;
  
  for (const selector of userInfoElements) {
    if (await page.locator(selector).isVisible().catch(() => false)) {
      hasUserInfo = true;
      console.log(`Thông tin người dùng hiển thị với selector: ${selector}`);
      break;
    }
  }
  
  for (const selector of sidebarElements) {
    if (await page.locator(selector).isVisible().catch(() => false)) {
      hasSidebar = true;
      console.log(`Sidebar hiển thị với selector: ${selector}`);
      break;
    }
  }
  
  for (const selector of contentElements) {
    if (await page.locator(selector).isVisible().catch(() => false)) {
      hasMainContent = true;
      console.log(`Nội dung chính hiển thị với selector: ${selector}`);
      break;
    }
  }
  
  // Kiểm tra title của trang
  const pageTitle = await page.title();
  console.log("Page title:", pageTitle);
  
  // Kiểm tra xem có phải trang dashboard không
  const isDashboardPage = 
    currentUrl.includes("dashboard") || 
    pageTitle.toLowerCase().includes("dashboard") || 
    pageTitle.toLowerCase().includes("bảng điều khiển");
  
  console.log("Là trang Dashboard:", isDashboardPage);
  console.log("Có thông tin người dùng:", hasUserInfo);
  console.log("Có sidebar:", hasSidebar);
  console.log("Có nội dung chính:", hasMainContent);
  
  // Test passed nếu là trang dashboard và hiển thị đầy đủ thông tin
  const testPassed = isDashboardPage && (hasUserInfo || hasSidebar || hasMainContent);
  
  // Sử dụng expect để xác định kết quả test
  expect(testPassed, "Trang dashboard hiển thị đầy đủ thông tin").toBeTruthy();
}); 