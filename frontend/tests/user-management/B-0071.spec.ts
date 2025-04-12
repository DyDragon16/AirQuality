import { test, expect } from "@playwright/test";
import { UserManagementPage } from "./pages/UserManagementPage";
import { loginAsAdmin } from "./helpers/loginAdmin";

test.describe("B-0071: Kiểm tra chức năng lọc danh sách người dùng (lọc theo vai trò Admin)", () => {
	test("Lọc danh sách người dùng theo vai trò Admin", async ({ page }) => {
		// Đặt timeout dài hơn cho test này
		test.setTimeout(120000);

		try {
			// Đăng nhập bằng tài khoản admin
			await loginAsAdmin(page);

			// Khởi tạo trang quản lý người dùng
			const userManagementPage = new UserManagementPage(page);

			// Không cần điều hướng đến trang quản lý người dùng vì loginAsAdmin đã thực hiện rồi
			// nhưng vẫn đảm bảo chúng ta đang ở đúng trang
			await page.waitForTimeout(2000);

			// Lấy số lượng người dùng ban đầu
			const initialUserCount = await userManagementPage.getUserCount();
			console.log(`Số lượng người dùng ban đầu: ${initialUserCount}`);

			// Bước 1: Chọn vào dropdown "Tất cả vai trò"
			// Bước 2: Chọn "Admin" từ danh sách
			await userManagementPage.filterByRole("admin");

			// Bước 3: Kiểm tra dropdown hiển thị giá trị đã chọn là Admin
			await userManagementPage.verifySelectedRoleFilter("admin");

			// Chụp ảnh màn hình hiển thị danh sách đã lọc
			await page.screenshot({
				path: `tests/screenshots/B-0071-filter-admin-result.png`,
			});

			// Lấy số lượng người dùng sau khi lọc
			const filteredUserCount = await userManagementPage.getUserCount();
			console.log(
				`Số lượng người dùng sau khi lọc theo vai trò Admin: ${filteredUserCount}`
			);

			// Bước 4: Kiểm tra danh sách người dùng chỉ hiển thị những người có vai trò Admin
			await userManagementPage.verifyAllUsersHaveRole("Admin");

			// Bước 5: Kiểm tra xem số lượng kết quả khớp với người dùng có vai trò Admin
			// Lưu ý: Số lượng người dùng sau khi lọc phải nhỏ hơn hoặc bằng số lượng ban đầu
			expect(filteredUserCount).toBeLessThanOrEqual(initialUserCount);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error(`Test failed with error: ${errorMessage}`);
			await page.screenshot({ path: `tests/screenshots/B-0071-error.png` });
			throw error;
		}
	});
});
