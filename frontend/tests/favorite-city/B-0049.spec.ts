import { test, expect } from "@playwright/test";

test.describe("B-0049: Kiểm tra chức năng chỉnh sửa tên thành công", () => {
	test("User có thể chỉnh sửa họ và tên thành công", async ({ page }) => {
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
				path: "tests/screenshots/B-0049-before-edit.png",
			});

			// BƯỚC 3: Lưu thông tin hiện tại để so sánh sau khi cập nhật
			const profileSection = page
				.locator(".py-5.border-b.border-gray-100")
				.first();
			const currentName = await profileSection
				.locator(".text-lg.font-semibold.text-gray-800")
				.textContent();
			console.log(`Tên hiện tại: ${currentName}`);

			// BƯỚC 4: Nhấn nút "Chỉnh sửa"
			const editButton = profileSection.locator("button", {
				hasText: "Chỉnh sửa",
			});
			await editButton.click();
			console.log("Đã nhấn nút Chỉnh sửa");

			// BƯỚC 5: Kiểm tra hiển thị popup chỉnh sửa họ và tên
			// Sử dụng selector chính xác hơn cho modal chỉnh sửa
			const editModal = page
				.locator(".fixed.inset-0.z-40")
				.filter({ hasText: "Chỉnh sửa Họ Tên" });
			await expect(editModal).toBeVisible({ timeout: 5000 });
			console.log("Đã hiển thị popup chỉnh sửa họ và tên");

			// Kiểm tra tiêu đề popup
			const modalTitle = editModal.locator("h3.text-xl.font-semibold");
			await expect(modalTitle).toHaveText("Chỉnh sửa Họ Tên");
			console.log("Xác nhận tiêu đề popup là Chỉnh sửa Họ Tên");

			// Chụp ảnh popup
			await page.screenshot({
				path: "tests/screenshots/B-0049-edit-modal.png",
			});

			// BƯỚC 6: Nhập thông tin mới
			// Tìm trường nhập Họ - đảm bảo đúng selector
			const modalContent = editModal.locator(".bg-white.rounded-lg");
			const firstNameInput = modalContent.locator("input").nth(0);
			await firstNameInput.fill("Lê");
			console.log("Đã nhập họ: Lê");

			// Tìm trường nhập Tên
			const lastNameInput = modalContent.locator("input").nth(1);
			await lastNameInput.fill("Văn Q");
			console.log("Đã nhập tên: Văn Q");

			// BƯỚC 7: Nhấn nút Lưu thay đổi
			const saveButton = modalContent.locator(
				'button:has-text("Lưu thay đổi")'
			);
			await saveButton.click();
			console.log("Đã nhấn nút Lưu thay đổi");

			// BƯỚC 8: Kiểm tra hiển thị thông báo cập nhật thành công
			// Thử tìm thông báo thành công trong modal
			await page.waitForTimeout(2000);
			try {
				const successMessage = page.locator(
					".mb-4.p-3.bg-green-50.text-green-600"
				);
				if (await successMessage.isVisible({ timeout: 3000 })) {
					const messageText = await successMessage.textContent();
					console.log(`Thông báo: ${messageText}`);
					console.log("Đã hiển thị thông báo thành công trong modal");
				}
			} catch {
				console.log("Không tìm thấy thông báo trong modal");
			}

			// Đóng modal nếu vẫn còn hiển thị
			try {
				const modalCloseButton = page.locator('button:has-text("Hủy")');
				if (await modalCloseButton.isVisible({ timeout: 2000 })) {
					await modalCloseButton.click();
					console.log("Đã đóng modal bằng nút Hủy");
				}
			} catch {
				console.log("Modal có thể đã tự đóng");
			}

			// Chờ một chút để thông tin cập nhật
			await page.waitForTimeout(3000);

			// Chụp ảnh màn hình sau khi cập nhật
			await page.screenshot({
				path: "tests/screenshots/B-0049-after-update.png",
			});

			// BƯỚC 9: Kiểm tra thông tin đã được cập nhật
			// Làm mới trang để đảm bảo UI được cập nhật
			await page.reload();
			await page.waitForSelector("h1.text-3xl.font-bold", { timeout: 10000 });
			console.log("Đã làm mới trang để kiểm tra tên đã cập nhật");

			// Đợi để thông tin được cập nhật trên UI
			await page.waitForTimeout(2000);

			// Kiểm tra tên mới đã được cập nhật
			const updatedProfileSection = page
				.locator(".py-5.border-b.border-gray-100")
				.first();
			const updatedName = await updatedProfileSection
				.locator(".text-lg.font-semibold.text-gray-800")
				.textContent();
			console.log(`Tên sau khi cập nhật: ${updatedName}`);

			// Xác nhận tên đã được cập nhật đúng
			expect(updatedName?.includes("Lê")).toBeTruthy();
			expect(updatedName?.includes("Văn Q")).toBeTruthy();
			console.log("Đã xác nhận tên được cập nhật thành công");

			// BƯỚC 10: Đảm bảo trở lại tên ban đầu để không ảnh hưởng đến các test khác
			// Nhấn nút chỉnh sửa lại
			const editAgainButton = updatedProfileSection.locator("button", {
				hasText: "Chỉnh sửa",
			});
			await editAgainButton.click();
			console.log("Đã nhấn nút Chỉnh sửa để trở lại tên ban đầu");

			// Đợi modal hiển thị
			const editModalAgain = page
				.locator(".fixed.inset-0.z-40")
				.filter({ hasText: "Chỉnh sửa Họ Tên" });
			await expect(editModalAgain).toBeVisible({ timeout: 5000 });

			// Lấy tên ban đầu từ biến currentName
			const originalFirstName = "Bao";
			const originalLastName = "Bao";

			// Nhập lại tên ban đầu
			const modalContentAgain = editModalAgain.locator(".bg-white.rounded-lg");
			const firstNameInputAgain = modalContentAgain.locator("input").nth(0);
			await firstNameInputAgain.fill(originalFirstName);
			console.log(`Đã nhập lại họ: ${originalFirstName}`);

			const lastNameInputAgain = modalContentAgain.locator("input").nth(1);
			await lastNameInputAgain.fill(originalLastName);
			console.log(`Đã nhập lại tên: ${originalLastName}`);

			// Nhấn nút Lưu thay đổi
			const saveButtonAgain = modalContentAgain.locator(
				'button:has-text("Lưu thay đổi")'
			);
			await saveButtonAgain.click();
			console.log("Đã nhấn nút Lưu thay đổi để trở lại tên ban đầu");

			// Đợi một chút và đóng modal nếu cần
			await page.waitForTimeout(3000);
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi trong quá trình test: ${errorMessage}`);

			// Chụp ảnh màn hình khi có lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0049-error.png",
			});

			throw error;
		}

		console.log("Test case B-0049 hoàn thành thành công");
	});
});
