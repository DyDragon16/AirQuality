import { test, expect } from "@playwright/test";
import { UserManagementPage } from "./pages/UserManagementPage";
import { loginAsAdmin } from "./helpers/loginAdmin";

test.describe("B-0075: Kiểm tra chức năng lọc danh sách người dùng (lọc theo trạng thái Không hoạt động)", () => {
	test("Lọc danh sách người dùng theo trạng thái Không hoạt động", async ({
		page,
	}) => {
		// Đặt timeout dài hơn cho test này
		test.setTimeout(120000);

		try {
			// Đăng nhập bằng tài khoản admin
			await loginAsAdmin(page);

			// Đảm bảo trang đã load xong
			await page.waitForLoadState("networkidle");

			// Khởi tạo trang quản lý người dùng
			const userManagementPage = new UserManagementPage(page);

			// Đợi bảng người dùng hiển thị
			await userManagementPage.userTable.waitFor({
				state: "visible",
				timeout: 10000,
			});

			// Lấy số lượng người dùng ban đầu
			const initialUserCount = await userManagementPage.getUserCount();

			// Bước 1 & 2: Chọn trạng thái "Không hoạt động"
			await userManagementPage.filterByStatus("inactive");

			// Đợi để đảm bảo dữ liệu đã được lọc
			await page.waitForTimeout(2000);

			// Bước 3: Kiểm tra dropdown hiển thị giá trị đã chọn
			await userManagementPage.verifySelectedStatusFilter("inactive");

			// Chụp ảnh màn hình kết quả lọc
			await userManagementPage.takeScreenshot("B-0075-inactive-users");

			// Lấy số lượng người dùng sau khi lọc
			const filteredUserCount = await userManagementPage.getUserCount();

			// Bước 4: Kiểm tra danh sách người dùng
			await userManagementPage.verifyAllUsersHaveStatus("Không hoạt động");

			// Bước 5: Kiểm tra số lượng kết quả
			expect(filteredUserCount).toBeLessThanOrEqual(initialUserCount);
		} catch (error: unknown) {
			console.error(
				`Test failed with error: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
			throw error;
		}
	});
});
