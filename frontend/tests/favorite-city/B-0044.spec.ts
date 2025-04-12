import { test, expect } from "@playwright/test";

test.describe("B-0044: Kiểm tra chức năng xóa thành phố yêu thích", () => {
	test("User có thể xóa thành phố trực tiếp trong danh sách yêu thích", async ({
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

			// BƯỚC 2: Vào trang Thành phố yêu thích
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

			// Chụp ảnh trang danh sách yêu thích trước khi xóa thành phố
			await page.screenshot({
				path: "tests/screenshots/B-0044-before-delete.png",
			});

			// BƯỚC 3: Kiểm tra số lượng thành phố yêu thích ban đầu
			const initialCityLinks = page.locator("a[href^='/city/']");
			const initialFavCount = await initialCityLinks.count();
			console.log(`Số lượng thành phố yêu thích ban đầu: ${initialFavCount}`);

			// Nếu không có thành phố yêu thích nào, thêm một thành phố mới
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

			// BƯỚC 4: Kiểm tra lại số lượng thành phố và chọn thành phố để xóa
			const updatedCityLinks = page.locator("a[href^='/city/']");
			const updatedFavCount = await updatedCityLinks.count();
			console.log(
				`Số lượng thành phố yêu thích sau khi cập nhật: ${updatedFavCount}`
			);

			expect(updatedFavCount).toBeGreaterThan(0);
			console.log("Có ít nhất một thành phố yêu thích để xóa");

			// Lưu lại tên thành phố sẽ xóa để kiểm tra sau
			const firstCityElement = await page
				.locator(".bg-white.rounded-lg.shadow-md.p-6")
				.first();
			let cityName = "";

			try {
				const h3 = firstCityElement.locator("h3");
				if ((await h3.count()) > 0) {
					cityName = (await h3.textContent()) || "";
				} else {
					const cityText = await firstCityElement.innerText();
					cityName = cityText.split("\n")[0] || "";
				}
				cityName = cityName.trim();
			} catch {
				console.log("Không thể lấy tên thành phố, nhưng vẫn tiếp tục test");
			}

			console.log(`Sẽ xóa thành phố "${cityName}" khỏi danh sách yêu thích`);

			// BƯỚC 5: Tìm và click vào nút xóa
			// Tìm button xóa trong item thành phố đầu tiên (sử dụng icon thùng rác)
			const deleteButton = firstCityElement
				.locator("button")
				.filter({ hasText: "" })
				.first();

			// Có thể cần tìm kiếm nút xóa bằng các cách khác nếu cách trên không hoạt động
			// Thử dùng icon thùng rác nếu có
			if (!(await deleteButton.isVisible({ timeout: 2000 }))) {
				// Tìm theo class icon thùng rác nếu có
				const trashIcon = firstCityElement.locator(
					".text-red-500, svg[fill='none'][stroke='currentColor']"
				);
				if ((await trashIcon.count()) > 0) {
					await trashIcon.first().click();
				} else {
					// Hoặc tìm theo nút có màu đỏ (thường là nút xóa)
					const redButton = firstCityElement.locator(
						"button.bg-red-500, button.text-red-500, button.hover\\:bg-red-600"
					);
					if ((await redButton.count()) > 0) {
						await redButton.first().click();
					} else {
						throw new Error("Không tìm thấy nút xóa trên thành phố yêu thích");
					}
				}
			} else {
				await deleteButton.click();
			}

			console.log("Đã click vào nút xóa thành phố yêu thích");

			// Đợi một chút để hệ thống xử lý yêu cầu xóa
			await page.waitForTimeout(2000);

			// BƯỚC 6: Kiểm tra lại danh sách sau khi xóa
			// Chụp ảnh trang danh sách yêu thích sau khi xóa
			await page.screenshot({
				path: "tests/screenshots/B-0044-after-delete.png",
			});

			// Đếm lại số lượng thành phố
			const finalCityLinks = page.locator("a[href^='/city/']");
			const finalFavCount = await finalCityLinks.count();
			console.log(`Số lượng thành phố yêu thích sau khi xóa: ${finalFavCount}`);

			// Kiểm tra số lượng đã giảm
			expect(finalFavCount).toBeLessThan(updatedFavCount);
			console.log("Số lượng thành phố yêu thích đã giảm sau khi xóa");

			// Nếu thành công xóa hết thành phố, kiểm tra thông báo trống
			if (finalFavCount === 0) {
				const emptyMessage = page.getByText("Không có thành phố yêu thích nào");
				await expect(emptyMessage).toBeVisible();
				console.log("Đã xác nhận hiển thị thông báo danh sách trống");
			} else {
				// Nếu còn thành phố, kiểm tra thành phố đã xóa không còn trong danh sách
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
				path: "tests/screenshots/B-0044-error.png",
			});

			throw error;
		}

		console.log("Test case B-0044 hoàn thành thành công");
	});
});
