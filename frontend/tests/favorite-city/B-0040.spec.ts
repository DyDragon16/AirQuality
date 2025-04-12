import { test, expect } from "@playwright/test";

test.describe("B-0040: Kiểm tra chức năng thêm thành phố yêu thích", () => {
	test("User có thể thêm thành phố vào danh sách yêu thích", async ({
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

		try {
			// Đợi trang chủ load xong và hiển thị danh sách thành phố
			await page.waitForSelector("a[href^='/city/']", { timeout: 10000 });
			console.log("Đã load trang chủ");

			// Lưu lại tên thành phố đầu tiên để kiểm tra sau
			const firstCityLink = page.locator("a[href^='/city/']").first();
			const cityNameText = await firstCityLink.locator("h3").textContent();
			const cityName = cityNameText || "Không tìm thấy tên thành phố";
			console.log(`Chọn thành phố: ${cityName}`);

			// Click vào thành phố đầu tiên
			await firstCityLink.click();
			console.log("Đã click vào thành phố");

			// Đợi trang chi tiết load xong bằng cách đợi WeatherCard xuất hiện
			await page.waitForSelector(".max-w-7xl .container", { timeout: 10000 });
			console.log("Đã load trang chi tiết thành phố");

			// Chụp ảnh trước khi thêm yêu thích
			await page.screenshot({
				path: "tests/screenshots/B-0040-before-favorite.png",
			});

			// Click nút yêu thích
			const favoriteButton = page.getByRole("button", {
				name: "Thêm vào yêu thích",
			});
			await favoriteButton.waitFor({ state: "visible", timeout: 5000 });
			await favoriteButton.click();
			console.log("Đã click nút yêu thích");

			// Đợi icon trái tim chuyển màu đỏ
			const redHeart = page.locator(".fill-red-500");
			await redHeart.waitFor({ state: "visible", timeout: 5000 });
			console.log("Trái tim đã chuyển màu đỏ");

			// Chụp ảnh sau khi thêm yêu thích
			await page.screenshot({
				path: "tests/screenshots/B-0040-after-favorite.png",
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

			// Click trực tiếp vào đường dẫn Thành phố yêu thích trong dashboard
			const favoriteCityLink = page
				.locator('a[href="/dashboard/favorites"]')
				.first();
			await favoriteCityLink.waitFor({ state: "visible", timeout: 10000 });
			await favoriteCityLink.click();
			console.log("Đã click vào Thành phố yêu thích");

			// Đợi trang yêu thích load - kiểm tra tiêu đề trang yêu thích
			await page.waitForSelector("h1.text-2xl.font-bold.text-blue-600", {
				timeout: 20000,
			});
			console.log("Đã load trang thành phố yêu thích");

			// Tìm thành phố trong danh sách dựa vào tên
			const cityInFavoriteList = page
				.getByText(cityName, { exact: false })
				.first();
			await cityInFavoriteList.waitFor({ state: "visible", timeout: 10000 });

			// Kiểm tra thành phố vừa thêm có trong danh sách
			const isVisible = await cityInFavoriteList.isVisible();
			expect(isVisible).toBeTruthy();
			console.log("Đã tìm thấy thành phố trong danh sách yêu thích");

			// Chụp ảnh danh sách yêu thích
			await page.screenshot({
				path: "tests/screenshots/B-0040-favorite-list.png",
			});
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi trong quá trình test: ${errorMessage}`);

			// Chụp ảnh màn hình khi có lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0040-error.png",
			});

			throw error;
		}

		console.log("Test case hoàn thành thành công");
	});
});
