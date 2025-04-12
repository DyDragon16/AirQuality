import { test, expect } from "@playwright/test";

test.describe("B-0050: Kiểm tra chức năng hủy chỉnh sửa tài khoản", () => {
	test("User có thể hủy việc chỉnh sửa họ và tên", async ({ page }) => {
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

			// Đợi trang tài khoản load
			await page.waitForURL("**/dashboard/account", { timeout: 10000 });
			await page.waitForSelector("h1.text-3xl.font-bold", { timeout: 10000 });
			console.log("Đã load trang thông tin tài khoản");

			// Chụp ảnh màn hình trước khi chỉnh sửa
			await page.screenshot({
				path: "tests/screenshots/B-0050-before-edit.png",
			});

			// BƯỚC 3: Lưu thông tin hiện tại để so sánh sau khi hủy
			const profileSection = page
				.locator(".py-5.border-b.border-gray-100")
				.first();
			const currentName = await profileSection
				.locator(".text-lg.font-semibold.text-gray-800")
				.textContent();
			console.log(`Tên hiện tại: ${currentName}`);

			// BƯỚC 4: Nhấn nút "Chỉnh sửa" - Bắt đầu bước 1 theo yêu cầu
			const editButton = profileSection.locator("button", {
				hasText: "Chỉnh sửa",
			});
			await editButton.click();
			console.log("BƯỚC 1: Đã nhấn nút Chỉnh sửa");

			// BƯỚC 5: Kiểm tra hiển thị popup chỉnh sửa họ và tên - Kiểm tra bước 2 theo yêu cầu
			// Sử dụng selector chính xác hơn cho modal chỉnh sửa
			const editModal = page
				.locator(".fixed.inset-0.z-40")
				.filter({ hasText: "Chỉnh sửa Họ Tên" });
			await expect(editModal).toBeVisible({ timeout: 5000 });
			console.log("BƯỚC 2: Đã hiển thị popup chỉnh sửa họ và tên");

			// Kiểm tra tiêu đề popup
			const modalTitle = editModal.locator("h3.text-xl.font-semibold");
			await expect(modalTitle).toHaveText("Chỉnh sửa Họ Tên");

			// Chụp ảnh popup
			await page.screenshot({
				path: "tests/screenshots/B-0050-edit-modal.png",
			});

			// BƯỚC 6: Nhập thông tin mới - Bước 3 và 4 theo yêu cầu
			// Tìm trường nhập Họ - đảm bảo đúng selector
			const modalContent = editModal.locator(".bg-white.rounded-lg");
			const firstNameInput = modalContent.locator("input").nth(0);
			await firstNameInput.fill("Lê");
			console.log("BƯỚC 3: Đã nhập họ: Lê");

			// Tìm trường nhập Tên
			const lastNameInput = modalContent.locator("input").nth(1);
			await lastNameInput.fill("Văn Q");
			console.log("BƯỚC 4: Đã nhập tên: Văn Q");

			// Chụp ảnh sau khi điền thông tin
			await page.screenshot({
				path: "tests/screenshots/B-0050-filled-form.png",
			});

			// BƯỚC 7: Nhấn nút Hủy - Bước 5 theo yêu cầu
			const cancelButton = modalContent.locator('button:has-text("Hủy")');
			await cancelButton.click();
			console.log("BƯỚC 5: Đã nhấn nút Hủy thay đổi");

			// BƯỚC 8: Kiểm tra popup đã tắt - Bước 6 theo yêu cầu
			await expect(editModal).not.toBeVisible({ timeout: 5000 });
			console.log("BƯỚC 6: Popup đã tự động tắt");

			// Chụp ảnh màn hình sau khi hủy
			await page.screenshot({
				path: "tests/screenshots/B-0050-after-cancel.png",
			});

			// BƯỚC 9: Kiểm tra thông tin không bị thay đổi
			// Kiểm tra tên vẫn giữ nguyên
			const unchangedProfileSection = page
				.locator(".py-5.border-b.border-gray-100")
				.first();
			const unchangedName = await unchangedProfileSection
				.locator(".text-lg.font-semibold.text-gray-800")
				.textContent();
			console.log(`Tên sau khi hủy: ${unchangedName}`);

			// Xác nhận tên không bị thay đổi
			expect(unchangedName).toBe(currentName);
			console.log("Đã xác nhận tên không bị thay đổi sau khi hủy");
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi trong quá trình test: ${errorMessage}`);

			// Chụp ảnh màn hình khi có lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0050-error.png",
			});

			throw error;
		}

		console.log("Test case B-0050 hoàn thành thành công");
	});
});
