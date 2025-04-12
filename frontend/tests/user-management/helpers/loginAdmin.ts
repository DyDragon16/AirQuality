import { Page } from "@playwright/test";

/**
 * Đăng nhập với tài khoản Admin
 * @param page Trang Playwright
 * @param email Email của admin (mặc định: admin@gmail.com)
 * @param password Mật khẩu của admin (mặc định: Admin@123)
 */
export async function loginAsAdmin(
	page: Page,
	email: string = "admin@gmail.com",
	password: string = "Admin@123"
) {
	// Điều hướng đến trang đăng nhập
	await page.goto("/login");

	// Đợi trang đăng nhập hiển thị
	await page.waitForSelector('input[name="email"]');

	// Nhập thông tin đăng nhập
	await page.fill('input[name="email"]', email);
	await page.fill('input[name="password"]', password);

	// Click nút đăng nhập
	await page.click('button[type="submit"]');

	// Đợi đăng nhập hoàn tất (2 giây)
	await page.waitForTimeout(2000);

	// Kiểm tra xem đã đăng nhập thành công bằng cách đợi các phần tử sau đăng nhập
	try {
		// Đợi nút đăng xuất
		await page.waitForSelector('button:has-text("Đăng xuất")', {
			timeout: 5000,
		});
	} catch {
		console.log(
			"Không tìm thấy nút đăng xuất, tiếp tục kiểm tra các phần tử khác..."
		);
	}

	// Điều hướng đến trang quản lý người dùng
	console.log("Điều hướng đến trang admin");
	await page.goto("/admin");
	await page.waitForTimeout(1000);

	// Click vào menu Quản lý người dùng
	console.log("Tìm kiếm và nhấp vào menu Quản lý người dùng");
	try {
		// Thử nhiều cách để tìm và click vào menu quản lý người dùng
		let menuFound = false;

		// Cách 1: Click trực tiếp vào link quản lý người dùng nếu có
		try {
			await page.click(
				'a[href="/admin/users"], a:has-text("Quản lý người dùng")'
			);
			menuFound = true;
		} catch {
			console.log("Không tìm thấy link quản lý người dùng trực tiếp");
		}

		// Cách 2: Tìm trong sidebar
		if (!menuFound) {
			try {
				const sidebarItems = page.locator(
					".sidebar a, .admin-sidebar a, .nav-link"
				);
				const count = await sidebarItems.count();
				console.log(`Đã tìm thấy ${count} mục menu`);

				for (let i = 0; i < count; i++) {
					const text = await sidebarItems.nth(i).textContent();
					console.log(`Menu item ${i}: ${text}`);
					if (text && text.includes("Quản lý người dùng")) {
						await sidebarItems.nth(i).click();
						menuFound = true;
						break;
					}
				}
			} catch {
				console.log("Không tìm thấy menu trong sidebar");
			}
		}

		// Cách 3: Điều hướng trực tiếp nếu không tìm thấy menu
		if (!menuFound) {
			console.log("Điều hướng trực tiếp đến trang quản lý người dùng");
			await page.goto("/admin/users");
		}
	} catch {
		console.log("Lỗi khi tìm menu quản lý người dùng, chuyển hướng trực tiếp");
		await page.goto("/admin/users");
	}

	// Đợi trang quản lý người dùng tải xong
	await page.waitForTimeout(2000);
}
