import { test, expect } from "@playwright/test";

test.describe("B-0070: Kiểm tra chức năng xóa tài khoản người dùng (Huỷ xoá tài khoản)", () => {
	test("Admin có thể hủy thao tác xóa tài khoản người dùng", async ({
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

		// Đếm số lượng người dùng trước khi thao tác
		const rowsBefore = page.locator("table tbody tr");
		const userCountBefore = await rowsBefore.count();
		console.log(`Số lượng người dùng trước khi thao tác: ${userCountBefore}`);

		// Chụp ảnh màn hình trước khi thao tác
		await page.screenshot({
			path: "tests/screenshots/B-0070-before-cancel.png",
		});

		// Tìm và nhấp vào nút xóa người dùng
		try {
			// Đợi cho bảng và các nút hành động hiển thị đầy đủ
			await page.waitForTimeout(2000);

			// Tìm nút xóa trong bảng
			const deleteButton = page.locator('button[title="Xóa"]').first();

			// Kiểm tra nút có tồn tại
			await deleteButton.waitFor({ state: "visible", timeout: 5000 });

			// In ra thông tin về nút để debug
			const buttonText = await deleteButton.textContent();
			const buttonHTML = await deleteButton.evaluate((el) => el.outerHTML);
			console.log("Tìm thấy nút xóa:", { text: buttonText, html: buttonHTML });

			// Click vào nút và đợi dialog xuất hiện
			await deleteButton.click();
			console.log("Đã nhấp vào nút xóa người dùng");

			// Đợi một chút để dialog xuất hiện
			await page.waitForTimeout(1000);
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi khi tìm nút xóa: ${errorMessage}`);
			throw error;
		}

		// Kiểm tra hiển thị popup xác nhận xóa
		try {
			// Đợi và tìm dialog xác nhận
			const modalOverlay = page.locator(
				"div.fixed.inset-0.z-10.overflow-y-auto"
			);
			await modalOverlay.waitFor({ state: "visible", timeout: 5000 });

			// Tìm dialog content
			const dialogContent = page.locator(
				"div.inline-block.transform.overflow-hidden.rounded-lg.bg-white"
			);
			await dialogContent.waitFor({ state: "visible", timeout: 5000 });

			// Kiểm tra nội dung dialog
			const dialogText = await dialogContent.textContent();
			expect(dialogText).toContain("Xóa người dùng");
			expect(dialogText).toContain("Bạn có chắc chắn muốn xóa người dùng này");

			// Chụp ảnh màn hình popup xác nhận xóa
			await page.screenshot({
				path: "tests/screenshots/B-0070-delete-confirmation.png",
			});

			// Tìm và nhấn nút Hủy
			const cancelButton = page.locator(
				'button:has-text("Hủy"), button:has-text("Huỷ")'
			);
			await cancelButton.waitFor({ state: "visible", timeout: 5000 });

			// In ra thông tin về nút để debug
			const cancelButtonText = await cancelButton.textContent();
			const cancelButtonHTML = await cancelButton.evaluate(
				(el) => el.outerHTML
			);
			console.log("Tìm thấy nút hủy:", {
				text: cancelButtonText,
				html: cancelButtonHTML,
			});

			await cancelButton.click();
			console.log("Đã nhấn nút hủy");

			// Đợi dialog biến mất
			await modalOverlay.waitFor({ state: "hidden", timeout: 5000 });
			console.log("Dialog đã đóng");
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi khi thao tác với dialog: ${errorMessage}`);

			// Chụp ảnh màn hình khi gặp lỗi để debug
			await page.screenshot({
				path: "tests/screenshots/B-0070-dialog-error.png",
			});
			throw error;
		}

		// Kiểm tra số lượng người dùng không thay đổi
		try {
			// Đợi một chút để trang cập nhật
			await page.waitForTimeout(2000);

			// Đếm lại số lượng người dùng
			const rowsAfter = page.locator("table tbody tr");
			const userCountAfter = await rowsAfter.count();
			console.log(`Số lượng người dùng sau khi hủy: ${userCountAfter}`);

			// Kiểm tra số lượng không thay đổi
			expect(userCountAfter).toBe(userCountBefore);
			console.log("Số lượng người dùng không thay đổi");

			// Chụp ảnh màn hình cuối cùng
			await page.screenshot({
				path: "tests/screenshots/B-0070-final-state.png",
			});
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi khi kiểm tra số lượng người dùng: ${errorMessage}`);

			// Chụp ảnh màn hình khi có lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0070-count-error.png",
			});

			throw error;
		}

		console.log("Test case hoàn thành thành công");
	});
});
