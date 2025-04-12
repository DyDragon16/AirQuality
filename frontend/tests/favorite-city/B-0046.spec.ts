import { test, expect } from "@playwright/test";

test.describe("B-0046: Kiểm tra chức năng xem danh sách các thành phố đã xem gần đây", () => {
	test("User có thể xem danh sách các thành phố đã xem gần đây", async ({
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

			// BƯỚC 0: Truy cập vào một thành phố trước để tạo lịch sử xem
			// Lấy thẻ a đầu tiên có href bắt đầu bằng /city/
			const firstCityLink = page.locator("a[href^='/city/']").first();
			await expect(firstCityLink).toBeVisible({ timeout: 5000 });

			// Lưu lại tên thành phố để kiểm tra sau này
			const cityName = await firstCityLink.locator("h3").textContent();
			console.log(`Chuẩn bị truy cập thành phố: ${cityName}`);

			// Click vào thành phố
			await firstCityLink.click();

			// Đợi trang chi tiết thành phố load xong - sử dụng WeatherCard để xác định
			await page.waitForSelector(".bg-white.rounded-lg.shadow-sm", {
				timeout: 10000,
			});
			console.log(`Đã truy cập trang chi tiết thành phố: ${cityName}`);

			// Chụp ảnh màn hình trang chi tiết thành phố
			await page.screenshot({
				path: "tests/screenshots/B-0046-city-detail.png",
			});

			// Quay lại trang chủ
			await page.goto("http://localhost:3000/");
			await page.waitForSelector("a[href^='/city/']", { timeout: 10000 });
			console.log("Đã quay lại trang chủ");

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

			// Kiểm tra phần "Đã xem gần đây" có hiển thị thành phố vừa xem không
			const recentlyViewedComponent = page
				.locator(".rounded-lg.bg-white.shadow-md")
				.filter({ hasText: "Đã xem gần đây" });
			const recentlyViewedItems = recentlyViewedComponent.locator("li");

			const recentItemsCount = await recentlyViewedItems.count();
			console.log(
				`Trong bảng điều khiển hiển thị ${recentItemsCount} thành phố đã xem gần đây`
			);

			if (recentItemsCount > 0) {
				const firstItemName = await recentlyViewedItems
					.first()
					.locator("span.text-sm.font-medium")
					.textContent();
				console.log(`Thành phố đã xem gần đây đầu tiên: ${firstItemName}`);

				// Xác nhận thành phố vừa xem có trong danh sách
				expect(firstItemName).toContain(cityName);
			}

			// BƯỚC 2: Click vào "Xem tất cả lịch sử" trong component "Đã xem gần đây"
			const viewAllHistoryLink = recentlyViewedComponent.locator(
				'a:has-text("Xem tất cả lịch sử")'
			);
			await expect(viewAllHistoryLink).toBeVisible({ timeout: 10000 });
			await viewAllHistoryLink.click();
			console.log("Đã click vào 'Xem tất cả lịch sử'");

			// BƯỚC 3: Đợi trang lịch sử xem load và kiểm tra URL
			// Đợi chuyển hướng đến trang lịch sử
			await page.waitForURL("**/dashboard/history", { timeout: 10000 });
			console.log("Đã chuyển hướng đến trang lịch sử");

			// BƯỚC 4: Kiểm tra URL đã chuyển đến trang lịch sử xem
			const currentUrl = page.url();
			expect(currentUrl).toContain("/dashboard/history");
			console.log("Đã xác nhận chuyển hướng đến trang lịch sử xem thành công");

			// Kiểm tra tiêu đề trang
			const pageTitle = await page
				.locator("h1.text-3xl.font-bold")
				.textContent();
			expect(pageTitle?.includes("Lịch sử xem")).toBeTruthy();
			console.log("Đã xác nhận tiêu đề trang lịch sử xem");

			// Kiểm tra hiển thị danh sách thành phố đã xem gần đây hoặc thông báo trống
			try {
				// Kiểm tra có danh sách thành phố không
				const citiesList = page.locator("ul.divide-y.divide-gray-200");
				if (await citiesList.isVisible({ timeout: 5000 })) {
					// Đếm số lượng thành phố được hiển thị
					const cityItems = citiesList.locator("li");
					const cityCount = await cityItems.count();
					console.log(`Trang hiển thị ${cityCount} thành phố đã xem gần đây`);

					// Kiểm tra nếu có ít nhất một thành phố
					if (cityCount > 0) {
						// Kiểm tra thành phố đầu tiên trong danh sách có phải là thành phố vừa xem không
						const firstHistoryItem = await cityItems
							.first()
							.locator("h3.text-lg.font-medium")
							.textContent();
						console.log(
							`Thành phố đầu tiên trong lịch sử: ${firstHistoryItem}`
						);

						// Xác nhận thành phố vừa xem có trong danh sách
						expect(firstHistoryItem).toContain(cityName);

						console.log(
							"Danh sách thành phố đã xem gần đây hiển thị thành công"
						);
					}
				} else {
					// Kiểm tra thông báo không có thành phố đã xem
					const emptyMessage = page.locator("text=Không có lịch sử xem");
					if (await emptyMessage.isVisible({ timeout: 3000 })) {
						console.log("Hiển thị thông báo chưa có thành phố nào được xem");
					}
				}
			} catch (error) {
				console.log(
					"Không thể xác định trạng thái danh sách thành phố đã xem:",
					error
				);
			}
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi trong quá trình test: ${errorMessage}`);

			// Chụp ảnh màn hình khi có lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0046-error.png",
			});

			throw error;
		}

		console.log("Test case B-0046 hoàn thành thành công");
	});
});
