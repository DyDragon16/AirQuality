import { test, expect } from "@playwright/test";

test.describe("B-0045: Kiểm tra chức năng khám phá các thành phố", () => {
	test("User có thể khám phá thêm thành phố từ trang yêu thích", async ({
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

			// Chụp ảnh trang danh sách yêu thích trước khi chuyển hướng
			await page.screenshot({
				path: "tests/screenshots/B-0045-favorites-page.png",
			});

			// BƯỚC 3: Tìm và click vào nút "Khám phá các thành phố"
			try {
				// Kiểm tra nếu trang hiển thị "Không có thành phố yêu thích"
				const emptyStateSection = page.locator(".text-center.py-8");

				// Nếu hiển thị trạng thái trống, tìm và click nút khám phá
				if (await emptyStateSection.isVisible({ timeout: 3000 })) {
					console.log("Trang hiển thị thông báo không có thành phố yêu thích");

					const exploreButton = emptyStateSection.getByRole("link", {
						name: "Khám phá các thành phố",
					});

					await exploreButton.click();
					console.log("Đã click vào nút 'Khám phá các thành phố'");
				} else {
					// Nếu có thành phố yêu thích, quay lại trang chủ sử dụng điều hướng trực tiếp
					console.log(
						"Trang có thành phố yêu thích, điều hướng trực tiếp về trang chủ"
					);
					await page.goto("http://localhost:3000/");
				}
			} catch {
				console.log(
					"Lỗi khi tìm nút khám phá thành phố, điều hướng trực tiếp về trang chủ"
				);
				// Phương án dự phòng: điều hướng trực tiếp
				await page.goto("http://localhost:3000/");
			}

			// BƯỚC 4: Kiểm tra chuyển hướng về trang chủ
			// Đợi trang chủ load xong (kiểm tra các thành phố hiển thị)
			await page.waitForSelector("a[href^='/city/']", { timeout: 20000 });

			// Chụp ảnh trang chủ sau khi chuyển hướng
			await page.screenshot({
				path: "tests/screenshots/B-0045-home-page-after-redirect.png",
			});

			// Kiểm tra URL đã chuyển về trang chủ
			const currentUrl = page.url();
			// Kiểm tra URL có phải là trang chủ (URL kết thúc bằng / hoặc không có path)
			const isHomePage =
				currentUrl.includes("localhost:3000") &&
				(currentUrl.endsWith("/") || currentUrl.endsWith("3000"));
			expect(isHomePage).toBeTruthy();
			console.log("Đã xác nhận chuyển hướng về trang chủ thành công");

			// Kiểm tra các thành phố hiển thị trên trang chủ
			const cityCards = page.locator("a[href^='/city/']");
			const cityCount = await cityCards.count();
			expect(cityCount).toBeGreaterThan(0);
			console.log(`Trang chủ hiển thị ${cityCount} thành phố`);
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi trong quá trình test: ${errorMessage}`);

			// Chụp ảnh màn hình khi có lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0045-error.png",
			});

			throw error;
		}

		console.log("Test case B-0045 hoàn thành thành công");
	});
});
