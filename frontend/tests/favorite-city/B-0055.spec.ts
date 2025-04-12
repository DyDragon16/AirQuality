import { test, expect } from "@playwright/test";

test.describe("B-0055: Kiểm tra xác thực định dạng email", () => {
	test("User không thể cập nhật email với định dạng không hợp lệ", async ({
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
				path: "tests/screenshots/B-0055-before-edit.png",
			});

			// Tìm phần Email và nút chỉnh sửa
			const emailSection = page
				.locator(".py-5.border-b.border-gray-100")
				.filter({ hasText: "Email" });
			await expect(emailSection).toBeVisible({ timeout: 5000 });
			console.log("Đã tìm thấy phần Email");

			// Lưu email hiện tại để so sánh sau
			const currentEmail = await emailSection
				.locator(".text-lg.font-semibold.text-gray-800")
				.textContent();
			console.log(`Email hiện tại: ${currentEmail}`);

			// Nhấn nút chỉnh sửa email
			const editEmailButton = emailSection.locator("button", {
				hasText: "Chỉnh sửa",
			});
			await editEmailButton.click();
			console.log("BƯỚC 1: Đã nhấn nút Chỉnh sửa Email");

			// Kiểm tra hiển thị popup chỉnh sửa email
			const editModal = page
				.locator(".fixed.inset-0.z-40")
				.filter({ hasText: "Chỉnh sửa Email" });
			await expect(editModal).toBeVisible({ timeout: 5000 });
			console.log("BƯỚC 2: Đã hiển thị popup chỉnh sửa Email");

			// Chụp ảnh popup
			await page.screenshot({
				path: "tests/screenshots/B-0055-edit-modal.png",
			});

			// Nhập email không hợp lệ (thiếu @)
			const modalContent = editModal.locator(".bg-white.rounded-lg");
			const emailInput = modalContent.locator("input[type='email']");

			// Xóa email hiện tại
			await emailInput.fill("");
			// Nhập email không hợp lệ
			await emailInput.fill("invalid-email.com");
			console.log("BƯỚC 3: Đã nhập email không hợp lệ: invalid-email.com");

			// Chụp ảnh sau khi nhập email không hợp lệ
			await page.screenshot({
				path: "tests/screenshots/B-0055-invalid-email.png",
			});

			// Nhấn nút Lưu thay đổi
			const saveButton = modalContent.locator(
				'button:has-text("Lưu thay đổi")'
			);
			await saveButton.click();
			console.log("BƯỚC 4: Đã nhấn nút Lưu thay đổi");

			// Đợi một chút để xem có validation message xuất hiện không
			await page.waitForTimeout(1000);

			// Kiểm tra xem modal vẫn hiển thị hay đã đóng (lỗi nếu đóng)
			const isModalStillVisible = await editModal.isVisible();

			// TEST THẤT BẠI NẾU MODAL ĐÃ ĐÓNG - có nghĩa là form đã submit thành công khi không nên
			if (!isModalStillVisible) {
				// Lấy email sau khi thử cập nhật
				await page.reload();
				await page.waitForSelector("h1.text-3xl.font-bold", { timeout: 10000 });
				await page.waitForTimeout(2000);

				const updatedEmailSection = page
					.locator(".py-5.border-b.border-gray-100")
					.filter({ hasText: "Email" });
				const updatedEmail = await updatedEmailSection
					.locator(".text-lg.font-semibold.text-gray-800")
					.textContent();

				console.log(`Email sau khi thử cập nhật: ${updatedEmail}`);

				// Test thất bại nếu email đã được cập nhật thành định dạng không hợp lệ
				if (updatedEmail === "invalid-email.com") {
					console.log(
						"LỖI: Hệ thống đã cho phép cập nhật email với định dạng không hợp lệ"
					);
					// Chụp ảnh màn hình lỗi
					await page.screenshot({
						path: "tests/screenshots/B-0055-unexpected-update.png",
					});
					expect(updatedEmail).not.toBe("invalid-email.com");
					console.log(
						"Hệ thống không nên cho phép cập nhật với email không hợp lệ"
					);
				}

				// Fail test vì modal đã đóng khi không nên
				expect(false).toBeTruthy();
				console.log(
					"Modal đã đóng sau khi nhấn Lưu thay đổi mặc dù email không hợp lệ"
				);
			}

			// Kiểm tra thông báo lỗi validation
			console.log("Kiểm tra thông báo lỗi validation cho định dạng email");

			// Kiểm tra xem có thông báo lỗi hiển thị trong UI không
			const errorSelectors = [
				'text="Vui lòng nhập email hợp lệ"',
				'text="Email không hợp lệ"',
				'text="Định dạng email không đúng"',
				'text="Please enter a valid email address"',
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

			// Kiểm tra attribute invalid của input
			const isEmailInvalid = await emailInput.evaluate((el) => {
				// Ép kiểu thành HTMLInputElement để có thể truy cập thuộc tính validity
				const inputEl = el as HTMLInputElement;
				return inputEl.validity.valid === false;
			});
			if (isEmailInvalid) {
				console.log("Input email có trạng thái không hợp lệ");
				foundError = true;
			}

			// TEST THẤT BẠI NẾU KHÔNG TÌM THẤY THÔNG BÁO LỖI
			if (!foundError) {
				await page.screenshot({
					path: "tests/screenshots/B-0055-missing-validation.png",
				});
				expect(foundError).toBeTruthy();
				console.log("Không hiển thị thông báo lỗi khi nhập email không hợp lệ");
			}

			// Chụp ảnh màn hình thông báo lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0055-error-message.png",
			});

			// Đóng modal bằng nút Hủy
			const cancelButton = modalContent.locator('button:has-text("Hủy")');
			await cancelButton.click();
			console.log("Đã nhấn nút Hủy để đóng modal");

			// Đợi modal đóng
			await expect(editModal).not.toBeVisible({ timeout: 5000 });

			// Kiểm tra email không bị thay đổi
			// Làm mới trang để đảm bảo UI được cập nhật
			await page.reload();
			await page.waitForSelector("h1.text-3xl.font-bold", { timeout: 10000 });
			console.log("Đã làm mới trang để kiểm tra email có bị thay đổi không");

			// Đợi để thông tin được cập nhật trên UI
			await page.waitForTimeout(2000);

			// Kiểm tra email không bị thay đổi
			const unchangedEmailSection = page
				.locator(".py-5.border-b.border-gray-100")
				.filter({ hasText: "Email" });
			const unchangedEmail = await unchangedEmailSection
				.locator(".text-lg.font-semibold.text-gray-800")
				.textContent();
			console.log(`Email sau khi thao tác: ${unchangedEmail}`);

			// Xác nhận email không bị thay đổi
			expect(unchangedEmail).toBe(currentEmail);
			console.log(
				"Test passed: Email không bị thay đổi khi nhập định dạng không hợp lệ"
			);
		} catch (error) {
			console.log(`Lỗi trong quá trình test: ${error}`);

			// Chụp ảnh màn hình khi có lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0055-error.png",
			});

			throw error;
		}

		console.log("Test case B-0055 hoàn thành");
	});
});
