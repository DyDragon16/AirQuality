import { test, expect } from "@playwright/test";

test.describe("B-0043: Kiểm tra chức năng bỏ thành phố yêu thích", () => {
	test("User có thể bỏ thành phố khỏi danh sách yêu thích", async ({
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

			// Chụp ảnh trang danh sách yêu thích trước khi bỏ thành phố yêu thích
			await page.screenshot({
				path: "tests/screenshots/B-0043-before-remove.png",
			});

			// Kiểm tra xem có thành phố yêu thích nào không
			const cityLinks = page.locator("a[href^='/city/']");
			const initialFavCount = await cityLinks.count();
			console.log(`Số lượng thành phố yêu thích ban đầu: ${initialFavCount}`);

			if (initialFavCount === 0) {
				console.log(
					"Không có thành phố yêu thích nào. Thêm một thành phố trước."
				);

				// Quay lại trang chủ để thêm một thành phố vào yêu thích
				await page.goto("http://localhost:3000/");
				await page.waitForSelector("a[href^='/city/']", { timeout: 10000 });

				// Chọn thành phố đầu tiên để thêm vào yêu thích
				const firstCityLink = page.locator("a[href^='/city/']").first();
				await firstCityLink.click();

				// Đợi trang chi tiết load xong
				await page.waitForSelector(".max-w-7xl .container", { timeout: 10000 });

				// Click nút yêu thích để thêm vào danh sách
				const favoriteButton = page.getByRole("button", {
					name: "Thêm vào yêu thích",
				});

				if (await favoriteButton.isVisible()) {
					await favoriteButton.click();

					// Đợi icon trái tim chuyển màu đỏ để xác nhận đã thêm thành công
					const redHeart = page.locator(".fill-red-500");
					await redHeart.waitFor({ state: "visible", timeout: 5000 });
					console.log("Đã thêm thành phố vào danh sách yêu thích");

					// Quay lại trang danh sách yêu thích
					await clickUserMenu();
					await page.getByRole("link", { name: "Bảng điều khiển" }).click();
					await page.waitForSelector("h1.text-3xl.font-bold", {
						timeout: 20000,
					});
					await favLink.click();
					await page.waitForSelector("h1.text-2xl.font-bold.text-blue-600", {
						timeout: 20000,
					});
				} else {
					console.log("Thành phố đã được thêm vào yêu thích trước đó");
				}
			}

			// BƯỚC 2: Lấy thông tin thành phố để bỏ yêu thích
			const updatedCityLinks = page.locator("a[href^='/city/']");
			const updatedFavCount = await updatedCityLinks.count();
			console.log(
				`Số lượng thành phố yêu thích sau khi cập nhật: ${updatedFavCount}`
			);

			expect(updatedFavCount).toBeGreaterThan(0);
			console.log("Phải có ít nhất một thành phố yêu thích");

			// Lưu lại tên thành phố sẽ bỏ yêu thích để kiểm tra sau
			const firstCityElement = updatedCityLinks.first();
			let cityName = "";
			// Lấy nội dung của thẻ h3 trong thành phố đầu tiên hoặc nội dung trực tiếp
			try {
				const h3 = firstCityElement.locator("h3");
				if ((await h3.count()) > 0) {
					cityName = (await h3.textContent()) || "";
				} else {
					cityName = await firstCityElement.innerText();
				}
				cityName = cityName.trim();
			} catch {
				console.log("Không thể lấy tên thành phố, nhưng vẫn tiếp tục test");
			}

			console.log(`Sẽ bỏ thành phố "${cityName}" khỏi danh sách yêu thích`);

			// BƯỚC 3: Click vào thành phố đầu tiên để xem chi tiết
			await firstCityElement.click();
			console.log("Đã click vào thành phố đầu tiên trong danh sách yêu thích");

			// Đợi trang chi tiết load xong
			await page.waitForSelector(".max-w-7xl .container", { timeout: 20000 });
			console.log("Đã load trang chi tiết thành phố");

			// BƯỚC 4: Click vào nút trái tim để bỏ yêu thích
			const heartIcon = page.locator(".fill-red-500");
			await expect(heartIcon).toBeVisible({ timeout: 5000 });
			console.log("Đã tìm thấy icon trái tim màu đỏ (đang yêu thích)");

			// Click vào nút yêu thích để bỏ khỏi danh sách
			await heartIcon.click();
			console.log("Đã click vào icon trái tim để bỏ yêu thích");

			// Đợi cho trái tim chuyển từ màu đỏ sang màu trắng
			await expect(heartIcon).not.toBeVisible({ timeout: 5000 });
			console.log("Trái tim đã chuyển từ màu đỏ sang trắng");

			// Chụp ảnh sau khi bỏ yêu thích
			await page.screenshot({
				path: "tests/screenshots/B-0043-after-unfavorite.png",
			});

			// BƯỚC 5: Quay lại trang dashboard
			await clickUserMenu();
			console.log("Đã mở user menu");

			await page.getByRole("link", { name: "Bảng điều khiển" }).click();
			console.log("Đã click vào Bảng điều khiển");

			await page.waitForSelector("h1.text-3xl.font-bold", { timeout: 20000 });
			console.log("Đã load trang dashboard");

			// BƯỚC 6: Kiểm tra thành phố đã bị xóa khỏi danh sách yêu thích
			const favLinkAgain = page
				.getByRole("link", { name: "Thành phố yêu thích" })
				.first();
			await favLinkAgain.click();
			console.log("Đã click vào Thành phố yêu thích lần nữa");

			await page.waitForSelector("h1.text-2xl.font-bold.text-blue-600", {
				timeout: 20000,
			});
			console.log("Đã load trang thành phố yêu thích");

			// Chụp ảnh trang danh sách yêu thích sau khi bỏ thành phố
			await page.screenshot({
				path: "tests/screenshots/B-0043-favorites-after-remove.png",
			});

			// Kiểm tra danh sách thành phố yêu thích đã được cập nhật
			const finalCityLinks = page.locator("a[href^='/city/']");
			const finalFavCount = await finalCityLinks.count();
			console.log(`Số lượng thành phố yêu thích sau khi bỏ: ${finalFavCount}`);

			// Nếu ban đầu chỉ có 1 thành phố, sau khi bỏ thì danh sách sẽ trống
			if (updatedFavCount === 1) {
				// Kiểm tra xem có hiển thị thông báo "Không có thành phố yêu thích nào" không
				const emptyMessage = page.getByText("Không có thành phố yêu thích nào");
				await expect(emptyMessage).toBeVisible();
				console.log("Đã xác nhận hiển thị thông báo danh sách trống");
			} else {
				// Sau khi bỏ yêu thích, số lượng thành phố có thể giảm 1 hoặc nhiều hơn
				// Kiểm tra thành phố đã bỏ yêu thích không còn trong danh sách
				expect(finalFavCount).toBeLessThan(updatedFavCount);
				console.log("Đã xác nhận số lượng thành phố yêu thích đã giảm");

				// Kiểm tra xem thành phố đã bỏ yêu thích có còn xuất hiện trong danh sách không
				if (cityName) {
					const cityElements = await page
						.locator(`h3:has-text("${cityName}")`)
						.count();
					expect(cityElements).toBe(0);
					console.log(
						`Đã xác nhận thành phố "${cityName}" không còn trong danh sách yêu thích`
					);
				}
			}
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi trong quá trình test: ${errorMessage}`);

			// Chụp ảnh màn hình khi có lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0043-error.png",
			});

			throw error;
		}

		console.log("Test case B-0043 hoàn thành thành công");
	});
});
