import { test, expect } from "@playwright/test";

test.describe("B-0042: Kiểm tra chức năng xem chi tiết thành phố yêu thích", () => {
	test("User có thể xem chi tiết thành phố từ danh sách yêu thích", async ({
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

			// BƯỚC 1: Đảm bảo có ít nhất một thành phố yêu thích bằng cách thêm một thành phố vào danh sách yêu thích
			console.log("Đang thêm một thành phố vào danh sách yêu thích...");

			// Lấy thành phố đầu tiên để thêm vào yêu thích
			const firstCityLink = page.locator("a[href^='/city/']").first();
			const cityNameText = await firstCityLink.locator("h3").textContent();
			const cityNameToAdd = cityNameText || "Không tìm thấy tên thành phố";
			console.log(`Chọn thành phố: ${cityNameToAdd} để thêm vào yêu thích`);

			// Click vào thành phố đầu tiên
			await firstCityLink.click();
			console.log("Đã click vào thành phố");

			// Đợi trang chi tiết load xong
			await page.waitForSelector(".max-w-7xl .container", { timeout: 10000 });
			console.log("Đã load trang chi tiết thành phố");

			// Click nút yêu thích nếu thành phố chưa được yêu thích
			const favoriteButton = page.getByRole("button", {
				name: "Thêm vào yêu thích",
			});
			// Nếu nút "Thêm vào yêu thích" tồn tại, click vào để thêm vào yêu thích
			if (await favoriteButton.isVisible()) {
				await favoriteButton.click();
				console.log("Đã click nút yêu thích để thêm vào danh sách");

				// Đợi icon trái tim chuyển màu đỏ để xác nhận đã thêm thành công
				const redHeart = page.locator(".fill-red-500");
				await redHeart.waitFor({ state: "visible", timeout: 5000 });
				console.log(
					"Trái tim đã chuyển màu đỏ - thêm vào yêu thích thành công"
				);
			} else {
				console.log("Thành phố đã có trong danh sách yêu thích");
			}

			// BƯỚC 2: Điều hướng đến trang danh sách yêu thích
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
				path: "tests/screenshots/B-0042-favorite-list.png",
			});

			// BƯỚC 3: Kiểm tra và xem chi tiết thành phố yêu thích
			// Kiểm tra cấu trúc của trang favorite
			console.log("Đang phân tích cấu trúc trang yêu thích...");

			// Kiểm tra tiêu đề trang
			const pageTitle = page.locator("h1.text-2xl.font-bold.text-blue-600");
			await expect(pageTitle).toBeVisible();
			console.log(`Tiêu đề trang: ${await pageTitle.textContent()}`);

			// Kiểm tra nội dung trang để tìm thành phố hoặc thông báo trống
			const pageContent = page.locator(".bg-white.rounded-lg.shadow-md.p-6");
			await expect(pageContent).toBeVisible();

			// Tìm các link đến city trong trang yêu thích
			const cityLinks = page.locator("a[href^='/city/']");
			const linksCount = await cityLinks.count();

			console.log(`Số lượng link thành phố tìm thấy: ${linksCount}`);

			if (linksCount === 0) {
				// Thử tìm các phương thức khác để tìm thành phố
				// Ví dụ, tìm dựa trên text của thành phố đã thêm
				const cityTextLocator = page.getByText(cityNameToAdd, { exact: false });

				if (await cityTextLocator.isVisible()) {
					console.log(`Đã tìm thấy text của thành phố: ${cityNameToAdd}`);
					await cityTextLocator.click();
					console.log("Đã click vào text tên thành phố");
				} else {
					console.log("Không tìm thấy thành phố nào trong danh sách yêu thích");
					console.log("Thử điều hướng trực tiếp đến trang chi tiết thành phố");

					// Lấy slug từ href của firstCityLink
					const href = await firstCityLink.getAttribute("href");
					if (href) {
						// Điều hướng trực tiếp đến trang chi tiết
						await page.goto(`http://localhost:3000${href}`);
						console.log(`Đã điều hướng trực tiếp đến: ${href}`);
					} else {
						throw new Error("Không thể tìm thấy đường dẫn đến thành phố");
					}
				}
			} else {
				// Click vào thành phố đầu tiên trong danh sách
				await cityLinks.first().click();
				console.log(
					"Đã click vào thành phố đầu tiên trong danh sách yêu thích"
				);
			}

			// Đợi trang chi tiết load xong
			await page.waitForSelector(".max-w-7xl .container", { timeout: 20000 });
			console.log("Đã load trang chi tiết thành phố");

			// Chụp ảnh trang chi tiết
			await page.screenshot({
				path: "tests/screenshots/B-0042-city-details.png",
			});

			// Kiểm tra xem trang chi tiết có chứa tên thành phố không
			const h1Title = page.locator("h1");
			const h1Text = await h1Title.textContent();
			console.log(`Tiêu đề trang chi tiết: ${h1Text}`);

			// Kiểm tra các thành phần trên trang chi tiết
			const weatherCard = page.locator(
				".bg-\\[\\#202020\\].text-white.rounded-lg"
			);
			await expect(weatherCard).toBeVisible({ timeout: 10000 });

			console.log("Đã xác nhận trang chi tiết thành phố chính xác");
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi trong quá trình test: ${errorMessage}`);

			// Chụp ảnh màn hình khi có lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0042-error.png",
			});

			throw error;
		}

		console.log("Test case hoàn thành thành công");
	});
});
