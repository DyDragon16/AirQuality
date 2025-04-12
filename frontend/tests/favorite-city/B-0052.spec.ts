import { test, expect } from "@playwright/test";

test.describe("B-0052: Kiểm tra chức năng chỉnh sửa tên nhưng bỏ trống cả họ và tên", () => {
	test("User không thể chỉnh sửa tên khi bỏ trống cả họ và tên", async ({
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
				path: "tests/screenshots/B-0052-before-edit.png",
			});

			// BƯỚC 3: Lưu thông tin hiện tại để so sánh sau khi thao tác
			const profileSection = page
				.locator(".py-5.border-b.border-gray-100")
				.first();
			const currentName = await profileSection
				.locator(".text-lg.font-semibold.text-gray-800")
				.textContent();
			console.log(`Tên hiện tại: ${currentName}`);

			// BƯỚC 4: Nhấn nút "Chỉnh sửa" - Bước 1 trong yêu cầu
			const editButton = profileSection.locator("button", {
				hasText: "Chỉnh sửa",
			});
			await editButton.click();
			console.log("BƯỚC 1: Đã nhấn nút Chỉnh sửa");

			// BƯỚC 5: Kiểm tra hiển thị popup chỉnh sửa họ và tên - Bước 2 trong yêu cầu
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
				path: "tests/screenshots/B-0052-edit-modal.png",
			});

			// BƯỚC 6: Xóa thông tin trong cả 2 trường - Bước 3 và 4 trong yêu cầu
			const modalContent = editModal.locator(".bg-white.rounded-lg");
			const firstNameInput = modalContent.locator("input").nth(0);
			const lastNameInput = modalContent.locator("input").nth(1);

			await firstNameInput.fill("");
			console.log("BƯỚC 3: Đã xóa họ, để trống");

			await lastNameInput.fill("");
			console.log("BƯỚC 4: Đã xóa tên, để trống");

			// Chụp ảnh sau khi xóa thông tin
			await page.screenshot({
				path: "tests/screenshots/B-0052-empty-fields.png",
			});

			// BƯỚC 7: Nhấn nút Lưu thay đổi - Bước 5 trong yêu cầu
			const saveButton = modalContent.locator(
				'button:has-text("Lưu thay đổi")'
			);
			await saveButton.click();
			console.log("BƯỚC 5: Đã nhấn nút Lưu thay đổi");

			// Đợi một chút để xem có validation message xuất hiện không
			await page.waitForTimeout(1000);

			// Kiểm tra xem input có thuộc tính 'required' không
			const isFirstNameRequired = await firstNameInput.evaluate((element) =>
				element.hasAttribute("required")
			);
			const isLastNameRequired = await lastNameInput.evaluate((element) =>
				element.hasAttribute("required")
			);

			// Kiểm tra xem modal vẫn hiển thị hay đã đóng (lỗi nếu đóng)
			const isModalStillVisible = await editModal.isVisible();

			// TEST THẤT BẠI NẾU MODAL ĐÃ ĐÓNG - có nghĩa là form đã submit thành công khi không nên
			if (!isModalStillVisible) {
				// Lấy tên sau khi thử cập nhật
				await page.reload();
				await page.waitForSelector("h1.text-3xl.font-bold", { timeout: 10000 });
				await page.waitForTimeout(2000);

				const updatedProfileSection = page
					.locator(".py-5.border-b.border-gray-100")
					.first();
				const updatedName = await updatedProfileSection
					.locator(".text-lg.font-semibold.text-gray-800")
					.textContent();

				console.log(`Tên sau khi thử cập nhật: ${updatedName}`);

				// Nếu tên đã thay đổi hoặc trống, test phải fail
				if (updatedName !== currentName) {
					console.log(
						"LỖI: Hệ thống đã cho phép cập nhật tên mặc dù cả họ và tên đều bị bỏ trống"
					);
					// Chụp ảnh màn hình lỗi
					await page.screenshot({
						path: "tests/screenshots/B-0052-unexpected-update.png",
					});
					expect(updatedName).toBe(currentName);
					console.log(
						"Hệ thống không nên cho phép cập nhật khi cả họ và tên bị bỏ trống"
					);
				}

				// Fail test vì modal đã đóng khi không nên
				expect(false).toBeTruthy();
				console.log(
					"Modal đã đóng sau khi nhấn Lưu thay đổi mặc dù cả họ và tên bị bỏ trống"
				);
			}

			// Kiểm tra thông báo lỗi
			console.log("Kiểm tra các thông báo lỗi validation");
			if (isFirstNameRequired || isLastNameRequired) {
				console.log(
					"Các trường nhập có thuộc tính required, sẽ hiển thị thông báo lỗi của trình duyệt"
				);
			} else {
				// Kiểm tra xem có thông báo lỗi hiển thị trong UI không
				const errorSelectors = [
					'text="Vui lòng điền vào trường này"',
					'text="This field is required"',
					'text="Trường này là bắt buộc"',
					".text-red-500",
					".error-message",
				];

				let foundError = false;
				for (const selector of errorSelectors) {
					try {
						const errorElement = modalContent.locator(selector);
						if (await errorElement.isVisible({ timeout: 2000 })) {
							console.log(
								`Tìm thấy thông báo lỗi: ${await errorElement.textContent()}`
							);
							foundError = true;
							break;
						}
					} catch {
						// Tiếp tục tìm kiếm với selector khác
					}
				}

				// TEST THẤT BẠI NẾU KHÔNG TÌM THẤY THÔNG BÁO LỖI
				if (!foundError) {
					await page.screenshot({
						path: "tests/screenshots/B-0052-missing-validation.png",
					});
					expect(foundError).toBeTruthy();
					console.log("Không hiển thị thông báo lỗi khi bỏ trống cả họ và tên");
				}
			}

			// Chụp ảnh màn hình thông báo lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0052-error-message.png",
			});

			// Đóng modal bằng nút Hủy
			const cancelButton = modalContent.locator('button:has-text("Hủy")');
			await cancelButton.click();
			console.log("Đã nhấn nút Hủy để đóng modal");

			// Đợi modal đóng
			await expect(editModal).not.toBeVisible({ timeout: 5000 });

			// Kiểm tra tên không bị thay đổi
			// Làm mới trang để đảm bảo UI được cập nhật
			await page.reload();
			await page.waitForSelector("h1.text-3xl.font-bold", { timeout: 10000 });
			console.log("Đã làm mới trang để kiểm tra tên có bị thay đổi không");

			// Đợi để thông tin được cập nhật trên UI
			await page.waitForTimeout(2000);

			// Kiểm tra tên không bị thay đổi
			const unchangedProfileSection = page
				.locator(".py-5.border-b.border-gray-100")
				.first();
			const unchangedName = await unchangedProfileSection
				.locator(".text-lg.font-semibold.text-gray-800")
				.textContent();
			console.log(`Tên sau khi thao tác: ${unchangedName}`);

			// Xác nhận tên không bị thay đổi
			expect(unchangedName).toBe(currentName);
			console.log(
				"Test passed: Tên không bị thay đổi khi bỏ trống cả họ và tên"
			);
		} catch (error) {
			console.log(`Lỗi trong quá trình test: ${error}`);

			// Chụp ảnh màn hình khi có lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0052-error.png",
			});

			throw error;
		}

		console.log("Test case B-0052 hoàn thành");
	});
});
