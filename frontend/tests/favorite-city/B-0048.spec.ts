import { test, expect } from "@playwright/test";

test.describe("B-0048: Kiểm tra chức năng xem trang tài khoản của bạn", () => {
	test("User có thể xem trang tài khoản của mình", async ({ page }) => {
		// Tăng timeout cho test
		test.setTimeout(120000);

		// Điều hướng đến trang đăng nhập
		await page.goto("http://localhost:3000/");
		await page.getByRole("button", { name: "Đăng nhập" }).click();

		// Đăng nhập với tài khoản user
		await page.getByRole("textbox", { name: "Email" }).click();
		await page
			.getByRole("textbox", { name: "Email" })
			.fill("jayamij742@naobk.com");
		await page.getByRole("textbox", { name: "Email" }).press("Tab");
		await page.getByRole("textbox", { name: "Mật khẩu" }).fill("Dungbao28@");
		await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
		console.log("Đã đăng nhập");

		try {
			// Đợi trang chủ load xong
			await page.waitForSelector("a[href^='/city/']", { timeout: 10000 });
			console.log("Đã load trang chủ");

			// BƯỚC 1: Vào trang Bảng điều khiển
			// Xử lý click menu người dùng cho cả desktop và mobile
			async function clickUserMenu() {
				try {
					// Thử click menu desktop trước
					const desktopMenu = page.locator(
						".hidden.md\\:flex.text-gray-700.items-center.cursor-pointer"
					);
					const isMobileView = !(await desktopMenu.isVisible());

					if (!isMobileView) {
						await desktopMenu.click();
						console.log("Đã click menu desktop");
					} else {
						// Nếu là mobile view, tìm và click vào nút menu mobile
						const mobileMenuButton = page.locator(".md\\:hidden button");
						await mobileMenuButton.click();
						console.log("Đã click menu mobile");
					}
				} catch (error) {
					console.log("Lỗi khi click menu:", error);
					throw error;
				}
			}

			// Thực hiện click menu
			await clickUserMenu();
			console.log("Đã mở user menu");

			// Click vào "Bảng điều khiển"
			await page.getByRole("link", { name: "Bảng điều khiển" }).click();
			console.log("Đã click vào Bảng điều khiển");

			// Đợi trang dashboard load - sử dụng selector chính xác
			await page.waitForSelector("h1.text-3xl.font-bold", { timeout: 20000 });
			console.log("Đã load trang dashboard");

			// Chụp ảnh màn hình trang dashboard
			await page.screenshot({
				path: "tests/screenshots/B-0048-dashboard.png",
			});

			// BƯỚC 2: Tìm và nhấn vào "Tài khoản của bạn"
			// Xác định component tài khoản
			const userAccountComponent = page
				.locator(".rounded-lg.bg-white.shadow-md")
				.filter({ hasText: "Tài khoản của bạn" });
			await expect(userAccountComponent).toBeVisible({ timeout: 5000 });
			console.log("Đã tìm thấy thành phần Tài khoản của bạn");

			// Tìm link "Thông tin tài khoản" trong component
			const accountInfoLink = userAccountComponent.locator("a", {
				hasText: "Thông tin tài khoản",
			});
			await expect(accountInfoLink).toBeVisible({ timeout: 5000 });

			// Click vào link "Thông tin tài khoản"
			await accountInfoLink.click();
			console.log("Đã click vào Thông tin tài khoản");

			// BƯỚC 3: Kiểm tra chuyển hướng đến trang thông tin tài khoản
			await page.waitForURL("**/dashboard/account", { timeout: 10000 });
			console.log("Đã chuyển hướng đến trang thông tin tài khoản");

			// Chụp ảnh trang account
			await page.screenshot({
				path: "tests/screenshots/B-0048-account-page.png",
			});

			// Kiểm tra URL đã chuyển đến trang account
			const currentUrl = page.url();
			expect(currentUrl).toContain("/dashboard/account");
			console.log("URL đã chuyển đến trang thông tin tài khoản");

			// Kiểm tra tiêu đề trang
			const pageTitle = await page
				.locator("h1.text-3xl.font-bold")
				.textContent();
			expect(pageTitle?.includes("Account")).toBeTruthy();
			console.log("Đã xác nhận tiêu đề trang tài khoản");

			// BƯỚC 4: Kiểm tra nội dung trang tài khoản có hiển thị đúng thông tin
			// Kiểm tra thông tin cá nhân có được hiển thị hay không
			const accountInfoSection = page
				.locator("h2", { hasText: "Thông tin tài khoản" })
				.first();
			await expect(accountInfoSection).toBeVisible({ timeout: 5000 });
			console.log("Đã xác nhận hiển thị phần thông tin tài khoản");

			// Kiểm tra thông tin cá nhân có được hiển thị hay không
			const userAvatar = page.locator(".w-16.h-16.rounded-full.bg-blue-600");
			await expect(userAvatar).toBeVisible({ timeout: 5000 });
			console.log("Đã xác nhận hiển thị avatar người dùng");

			// Kiểm tra hiển thị phần email
			const emailSection = page.locator("span", {
				hasText: "Email đã xác thực",
			});
			await expect(emailSection).toBeVisible({ timeout: 5000 });
			console.log("Đã xác nhận hiển thị trạng thái email đã xác thực");

			// Kiểm tra có phần hiển thị "Email" trong trang
			const emailLabel = page.locator(
				'.font-medium.text-gray-600:has-text("Email")'
			);
			await expect(emailLabel).toBeVisible({ timeout: 5000 });
			console.log("Đã xác nhận hiển thị nhãn email");

			// Kiểm tra nút "Chỉnh sửa" có tồn tại
			const editButton = page.locator('button:has-text("Chỉnh sửa")');
			await expect(editButton).toBeVisible({ timeout: 5000 });
			console.log("Đã xác nhận hiển thị nút Chỉnh sửa");
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi trong quá trình test: ${errorMessage}`);

			// Chụp ảnh màn hình khi có lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0048-error.png",
			});

			throw error;
		}

		console.log("Test case B-0048 hoàn thành thành công");
	});
});
