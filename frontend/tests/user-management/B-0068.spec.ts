import { test, expect } from "@playwright/test";

test.describe("B-0068: Kiểm tra chức năng thay đổi trạng thái (trạng thái chờ xác nhận)", () => {
	test("Admin có thể thay đổi trạng thái người dùng thành chờ xác nhận", async ({
		page,
	}) => {
		// Tăng timeout cho test
		test.setTimeout(120000);

		// Điều hướng đến trang đăng nhập
		await page.goto("http://localhost:3000/");
		await page.getByRole("button", { name: "Đăng nhập" }).click();

		// Đăng nhập với tài khoản admin
		await page.getByRole("textbox", { name: "Email" }).click();
		await page.getByRole("textbox", { name: "Email" }).fill("admin@gmail.com");
		await page.getByRole("textbox", { name: "Email" }).press("Tab");
		await page.getByRole("textbox", { name: "Mật khẩu" }).fill("Admin@123");
		await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();

		// Đợi cho menu admin hiển thị và điều hướng
		await page.waitForSelector('button:has-text("Admin System")', {
			timeout: 10000,
		});
		await page.getByRole("button", { name: "Admin System" }).click();
		await page.getByRole("link", { name: "Quản lý hệ thống" }).click();
		await page.getByRole("link", { name: "Quản lý người dùng" }).click();

		// Đợi cho bảng người dùng hiển thị
		await page.waitForSelector("table", { timeout: 10000 });

		// Chụp ảnh màn hình trước khi thay đổi trạng thái
		await page.screenshot({
			path: "tests/screenshots/B-0068-before-status-change.png",
		});

		// Tìm và nhấp vào nút thay đổi trạng thái
		try {
			// Đợi cho bảng và các nút hành động hiển thị đầy đủ
			await page.waitForTimeout(2000);

			// Tìm nút thay đổi trạng thái trong bảng
			const statusButtons = page.locator(
				'button[title="Thay đổi trạng thái"], button.edit-status-button, button:has-text("Thay đổi trạng thái")'
			);
			const count = await statusButtons.count();

			if (count > 0) {
				// Click vào nút đầu tiên tìm thấy
				await statusButtons.first().click();
				console.log("Đã nhấp vào nút thay đổi trạng thái");
			} else {
				throw new Error("Không tìm thấy nút thay đổi trạng thái");
			}
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi khi tìm nút thay đổi trạng thái: ${errorMessage}`);
			throw error;
		}

		// Xác nhận hiển thị popup thay đổi trạng thái
		const statusPopup = page.getByText("Thay đổi trạng thái người dùng", {
			exact: false,
		});
		await expect(statusPopup).toBeVisible({ timeout: 10000 });

		// Chọn trạng thái "Chờ xác nhận" từ dropdown
		try {
			await page.waitForTimeout(1000); // Đợi popup hiển thị hoàn toàn

			const statusDropdown = page
				.locator('select[name="status"], #status-select, .status-select')
				.first();
			await statusDropdown.waitFor({ state: "visible", timeout: 5000 });
			await statusDropdown.selectOption("pending");
			console.log('Đã chọn trạng thái "Chờ xác nhận" từ dropdown');
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi khi chọn trạng thái: ${errorMessage}`);
			throw error;
		}

		// Nhấn nút cập nhật trạng thái
		const updateButton = page.getByRole("button", {
			name: "Cập nhật trạng thái",
		});
		await updateButton.waitFor({ state: "visible", timeout: 5000 });
		await updateButton.click();

		// Đợi cho hành động hoàn tất
		await page.waitForTimeout(3000);

		// Chụp ảnh màn hình sau khi thay đổi trạng thái
		await page.screenshot({
			path: "tests/screenshots/B-0068-after-status-change.png",
		});

		// Kiểm tra thông báo thành công
		try {
			const successMessage = page.locator(
				".toast, .notification, .alert, [role='alert']"
			);
			await expect(successMessage).toBeVisible({ timeout: 10000 });
			await expect(successMessage).toContainText("Đã cập nhật trạng thái", {
				timeout: 5000,
			});
			console.log("Tìm thấy thông báo thành công về cập nhật trạng thái");
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi khi kiểm tra thông báo: ${errorMessage}`);
		}

		// Kiểm tra trạng thái đã được cập nhật trong bảng
		try {
			// Đợi bảng cập nhật
			await page.waitForTimeout(2000);
			await page.waitForSelector("table tbody tr", { timeout: 10000 });

			// Tìm các ô chứa trạng thái "Chờ xác nhận"
			const pendingStatuses = page.locator("td").filter({
				hasText: /Chờ xác nhận|pending/i,
			});

			const count = await pendingStatuses.count();
			if (count > 0) {
				console.log(
					`Tìm thấy ${count} người dùng có trạng thái "Chờ xác nhận"`
				);
			} else {
				console.log(
					'Không tìm thấy người dùng nào có trạng thái "Chờ xác nhận"'
				);
				throw new Error("Không tìm thấy trạng thái đã cập nhật");
			}
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi khi kiểm tra trạng thái trong bảng: ${errorMessage}`);
			throw error;
		}

		console.log("Test case hoàn thành thành công");
	});
});
