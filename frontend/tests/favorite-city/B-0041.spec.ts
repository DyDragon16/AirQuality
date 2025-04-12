import { test, expect } from "@playwright/test";

test.describe("B-0041: Kiểm tra chức năng xem danh sách thành phố yêu thích", () => {
	test("User có thể xem danh sách thành phố yêu thích từ bảng điều khiển", async ({
		page,
	}) => {
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

			// Chụp ảnh trang chủ sau khi đăng nhập
			await page.screenshot({
				path: "tests/screenshots/B-0041-homepage.png",
			});

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

			// Chụp ảnh trang dashboard
			await page.screenshot({
				path: "tests/screenshots/B-0041-dashboard.png",
			});

			// Kiểm tra tiêu đề trang dashboard
			const dashboardTitle = page.locator("h1.text-3xl.font-bold");
			await expect(dashboardTitle).toBeVisible();
			const titleText = await dashboardTitle.textContent();
			expect(titleText).toContain("Bảng điều khiển");
			console.log("Đã xác nhận tiêu đề trang Bảng điều khiển");

			// Tìm và click vào link "Thành phố yêu thích" bằng getByRole
			const favLink = page
				.getByRole("link", { name: "Thành phố yêu thích" })
				.first();
			await expect(favLink).toBeVisible({ timeout: 10000 });
			await favLink.click();
			console.log("Đã click vào Thành phố yêu thích");

			// Đợi trang yêu thích load - kiểm tra tiêu đề trang yêu thích
			await page.waitForSelector("h1.text-2xl.font-bold.text-blue-600", {
				timeout: 20000,
			});
			console.log("Đã load trang thành phố yêu thích");

			// Chụp ảnh trang danh sách yêu thích
			await page.screenshot({
				path: "tests/screenshots/B-0041-favorite-list.png",
			});

			// Kiểm tra hiển thị danh sách thành phố yêu thích hoặc thông báo "Chưa có thành phố yêu thích"
			const favoritePageContent = page.locator(
				".max-w-4xl.mx-auto .bg-white.rounded-lg.shadow-md"
			);
			await expect(favoritePageContent).toBeVisible();

			const pageTitle = page.locator("h1.text-2xl.font-bold.text-blue-600");
			const favoriteTitleText = await pageTitle.textContent();
			expect(favoriteTitleText).toContain("Thành phố yêu thích");
			console.log("Đã xác nhận tiêu đề trang thành phố yêu thích");

			// Kiểm tra xem có danh sách thành phố không hoặc là thông báo trống
			const citiesGrid = page.locator(
				".grid.grid-cols-1.md\\:grid-cols-2.gap-4"
			);
			const emptyMessage = page.locator(".text-center.py-8");

			const hasCities =
				(await citiesGrid.isVisible()) &&
				(await page
					.locator(".border.rounded-lg.overflow-hidden.shadow-sm")
					.count()) > 0;
			const isEmpty = await emptyMessage.isVisible();

			// Một trong hai trường hợp phải đúng: hoặc có danh sách, hoặc có thông báo trống
			expect(hasCities || isEmpty).toBeTruthy();

			if (hasCities) {
				console.log("Đã hiển thị danh sách thành phố yêu thích");
				// Lấy số lượng thành phố yêu thích
				const citiesCount = await page
					.locator(".border.rounded-lg.overflow-hidden.shadow-sm")
					.count();
				console.log(`Số lượng thành phố yêu thích: ${citiesCount}`);
			} else {
				const messageText = await emptyMessage.textContent();
				console.log(`Thông báo: ${messageText}`);
				console.log("Danh sách thành phố yêu thích trống");
			}
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi trong quá trình test: ${errorMessage}`);

			// Chụp ảnh màn hình khi có lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0041-error.png",
			});

			throw error;
		}

		console.log("Test case hoàn thành thành công");
	});
});
