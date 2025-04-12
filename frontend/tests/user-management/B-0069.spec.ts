import { test, expect } from "@playwright/test";

test.describe("B-0069: Kiểm tra chức năng xóa tài khoản người dùng", () => {
	test("Admin có thể xóa tài khoản người dùng", async ({ page }) => {
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

		// Đếm số lượng người dùng trước khi xóa
		const rowsBefore = page.locator("table tbody tr");
		const userCountBefore = await rowsBefore.count();
		console.log(`Số lượng người dùng trước khi xóa: ${userCountBefore}`);

		// Chụp ảnh màn hình trước khi xóa người dùng
		await page.screenshot({
			path: "tests/screenshots/B-0069-before-delete.png",
		});

		// Tìm và nhấp vào nút xóa người dùng
		try {
			// Đợi cho bảng và các nút hành động hiển thị đầy đủ
			await page.waitForTimeout(2000);

			// Tìm nút xóa trong bảng với nhiều selector khác nhau
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
				path: "tests/screenshots/B-0069-delete-confirmation.png",
			});

			// Tìm và nhấn nút xác nhận xóa
			const confirmButton = page.locator("button.bg-red-600.text-white");
			await confirmButton.waitFor({ state: "visible", timeout: 5000 });

			// In ra thông tin về nút để debug
			const confirmButtonText = await confirmButton.textContent();
			const confirmButtonHTML = await confirmButton.evaluate(
				(el) => el.outerHTML
			);
			console.log("Tìm thấy nút xác nhận:", {
				text: confirmButtonText,
				html: confirmButtonHTML,
			});

			await confirmButton.click();
			console.log("Đã nhấn nút xác nhận xóa");
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi khi xác nhận xóa: ${errorMessage}`);

			// Chụp ảnh màn hình khi gặp lỗi để debug
			await page.screenshot({
				path: "tests/screenshots/B-0069-delete-error.png",
			});
			throw error;
		}

		// Kiểm tra thông báo thành công
		try {
			// Đợi cho modal đóng
			await page.waitForTimeout(1000);

			// Lưu lại email người dùng đã xóa để kiểm tra
			const deletedUserEmail = "user1@gmail.com"; // email của user bị xóa

			// Kiểm tra theo nhiều cách
			console.log("Bắt đầu kiểm tra kết quả xóa...");

			// Cách 1: Kiểm tra thông báo thành công
			const toast = page
				.locator("div")
				.filter({ hasText: /Đã xóa người dùng thành công/i });
			const isToastVisible = await toast.isVisible().catch(() => false);
			console.log("Trạng thái hiển thị của toast:", isToastVisible);

			// Cách 2: Kiểm tra user đã bị xóa không còn trong danh sách
			const userRow = page.locator("tr").filter({ hasText: deletedUserEmail });
			const isUserStillPresent = (await userRow.count()) === 0;
			console.log("User đã bị xóa khỏi danh sách:", isUserStillPresent);

			// Kết luận thành công nếu một trong các điều kiện đúng
			if (isToastVisible || isUserStillPresent) {
				console.log("Xác nhận xóa user thành công!");
				expect(true).toBeTruthy();
			} else {
				throw new Error("Không thể xác nhận việc xóa user thành công");
			}
		} catch (error: Error | unknown) {
			console.log("Lỗi trong quá trình kiểm tra:", error);

			// Chụp ảnh màn hình để debug
			await page.screenshot({
				path: "tests/screenshots/B-0069-final-state.png",
			});

			throw error;
		}

		// Chụp ảnh màn hình sau khi xóa người dùng
		await page.screenshot({
			path: "tests/screenshots/B-0069-after-delete.png",
		});

		// Kiểm tra danh sách người dùng đã được cập nhật
		try {
			// Hàm kiểm tra số lượng người dùng
			async function checkUserCount(expectedCount: number): Promise<boolean> {
				await page.reload();
				await page.waitForTimeout(1000);
				await page.waitForSelector("table tbody tr", { timeout: 5000 });
				const rows = page.locator("table tbody tr");
				const count = await rows.count();
				console.log(`Kiểm tra số lượng người dùng: ${count}`);
				return count === expectedCount;
			}

			// Thử kiểm tra nhiều lần với timeout
			const expectedCount = userCountBefore - 1;
			const maxAttempts = 5;
			let attempts = 0;
			let success = false;

			while (attempts < maxAttempts && !success) {
				attempts++;
				console.log(`Lần thử ${attempts}/${maxAttempts}`);

				success = await checkUserCount(expectedCount);

				if (!success && attempts < maxAttempts) {
					console.log("Đợi 2 giây trước khi thử lại...");
					await page.waitForTimeout(2000);
				}
			}

			if (!success) {
				throw new Error(
					`Số lượng người dùng không giảm sau ${maxAttempts} lần thử`
				);
			}

			console.log("Số lượng người dùng đã giảm thành công");
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Lỗi không xác định";
			console.log(`Lỗi khi kiểm tra danh sách sau khi xóa: ${errorMessage}`);

			// Chụp ảnh màn hình khi có lỗi
			await page.screenshot({
				path: "tests/screenshots/B-0069-final-count-error.png",
			});

			throw error;
		}

		console.log("Test case hoàn thành thành công");
	});
});
