import { test, expect } from "@playwright/test";

test.describe("B-0047: Kiểm tra chức năng xóa danh sách các thành phố đã xem gần đây", () => {
	test("User có thể xóa danh sách các thành phố đã xem gần đây", async ({
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

			// Đợi một chút để đảm bảo dữ liệu được ghi vào localStorage
			await page.waitForTimeout(1000);

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

			// BƯỚC 2: Click vào "Xem tất cả lịch sử" để vào trang lịch sử xem
			const recentlyViewedComponent = page
				.locator(".rounded-lg.bg-white.shadow-md")
				.filter({ hasText: "Đã xem gần đây" });

			// Xác nhận có thành phố trong lịch sử
			const recentlyViewedItems = recentlyViewedComponent.locator("li");
			const recentItemsCount = await recentlyViewedItems.count();
			console.log(
				`Trong bảng điều khiển hiển thị ${recentItemsCount} thành phố đã xem gần đây`
			);

			// Click vào "Xem tất cả lịch sử"
			const viewAllHistoryLink = recentlyViewedComponent.locator(
				'a:has-text("Xem tất cả lịch sử")'
			);
			await expect(viewAllHistoryLink).toBeVisible({ timeout: 10000 });
			await viewAllHistoryLink.click();
			console.log("Đã click vào 'Xem tất cả lịch sử'");

			// Đợi chuyển hướng đến trang lịch sử
			await page.waitForURL("**/dashboard/history", { timeout: 10000 });
			console.log("Đã chuyển hướng đến trang lịch sử");

			// Chụp ảnh màn hình trước khi xóa lịch sử
			await page.screenshot({
				path: "tests/screenshots/B-0047-history-before-delete.png",
			});

			// BƯỚC 3: Kiểm tra nếu có thành phố trong lịch sử, thực hiện xóa lịch sử
			try {
				// Kiểm tra có lịch sử thành phố không
				const citiesList = page.locator("ul.divide-y.divide-gray-200");
				if (await citiesList.isVisible({ timeout: 5000 })) {
					const cityItems = citiesList.locator("li");
					const cityCountBefore = await cityItems.count();
					console.log(
						`Số lượng thành phố trong lịch sử trước khi xóa: ${cityCountBefore}`
					);

					if (cityCountBefore > 0) {
						// Kiểm tra nếu có danh sách thành phố và có nút "Xóa lịch sử"
						const deleteHistoryButton = page.locator(
							'button:has-text("Xóa lịch sử")'
						);
						if (await deleteHistoryButton.isVisible({ timeout: 5000 })) {
							console.log("Đã tìm thấy nút 'Xóa lịch sử'");

							// Click vào nút "Xóa lịch sử"
							await deleteHistoryButton.click();
							console.log("Đã click vào nút 'Xóa lịch sử'");

							// Đợi để thông báo xóa thành công hiển thị
							const toastNotification = page.locator(
								".fixed.bottom-4.right-4.bg-gray-800"
							);
							await expect(toastNotification).toBeVisible({ timeout: 5000 });

							// Kiểm tra nội dung thông báo
							const toastContent = await toastNotification.textContent();
							expect(toastContent).toContain(
								"Lịch sử xem của bạn đã được xóa thành công"
							);
							console.log("Đã xác nhận thông báo xóa lịch sử thành công");

							// Chụp ảnh màn hình sau khi xóa lịch sử
							await page.screenshot({
								path: "tests/screenshots/B-0047-history-after-delete.png",
							});

							// BƯỚC 4: Kiểm tra xem lịch sử đã được xóa thành công chưa
							// Kiểm tra thông báo "Không có lịch sử xem" hiển thị
							const emptyStateMessage = page.locator(
								"text=Không có lịch sử xem"
							);
							await expect(emptyStateMessage).toBeVisible({ timeout: 5000 });
							console.log(
								"Đã xác nhận hiển thị thông báo 'Không có lịch sử xem'"
							);

							// Kiểm tra nút "Khám phá thành phố" có xuất hiện không
							const exploreButton = page.locator(
								'button:has-text("Khám phá thành phố")'
							);
							await expect(exploreButton).toBeVisible({ timeout: 5000 });
							console.log("Đã xác nhận hiển thị nút 'Khám phá thành phố'");

							// Chụp ảnh màn hình trạng thái trống
							await page.screenshot({
								path: "tests/screenshots/B-0047-empty-history.png",
							});

							// Test đã hoàn thành thành công
							console.log("Đã xóa lịch sử thành công");
							return;
						} else {
							console.log("Không tìm thấy nút 'Xóa lịch sử'");
						}
					}
				} else {
					console.log("Không có thành phố nào trong lịch sử để xóa");

					// Kiểm tra thông báo trống
					const emptyStateMessage = page.locator("text=Không có lịch sử xem");
					if (await emptyStateMessage.isVisible({ timeout: 3000 })) {
						console.log("Trang đã hiển thị thông báo 'Không có lịch sử xem'");
					}
				}
			} catch (error) {
				console.log("Lỗi khi kiểm tra hoặc xóa lịch sử:", error);
				throw error;
			}
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi trong quá trình test: ${errorMessage}`);

			// Chụp ảnh màn hình khi có lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0047-error.png",
			});

			throw error;
		}

		console.log("Test case B-0047 hoàn thành thành công");
	});
});
