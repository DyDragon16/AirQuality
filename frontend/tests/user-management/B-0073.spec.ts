import { test, expect } from "@playwright/test";
import { UserManagementPage } from "./pages/UserManagementPage";
import { loginAsAdmin } from "./helpers/loginAdmin";

test.describe("B-0073: Kiểm tra chức năng lọc danh sách người dùng (lọc theo trạng thái Tạm ngưng)", () => {
	test("Lọc danh sách người dùng theo trạng thái Tạm ngưng", async ({
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

			// Đợi để đảm bảo trang đã load hoàn toàn
			await page.waitForTimeout(3000);

			// Lấy số lượng người dùng ban đầu
			const initialUserCount = await userManagementPage.getUserCount();
			console.log(`Số lượng người dùng ban đầu: ${initialUserCount}`);

			// Bước 1: Chọn vào dropdown "Tất cả trạng thái"
			// Bước 2: Chọn "Không hoạt động" từ danh sách
			await userManagementPage.filterByStatus("inactive");

			// Đợi để đảm bảo dữ liệu đã được lọc
			await page.waitForTimeout(2000);

			// Bước 3: Kiểm tra dropdown hiển thị giá trị đã chọn là Không hoạt động
			await userManagementPage.verifySelectedStatusFilter("inactive");

			// Đợi để đảm bảo trang ổn định trước khi chụp ảnh
			await page.waitForLoadState("networkidle");

			// Chụp ảnh màn hình hiển thị danh sách đã lọc
			await page.screenshot({
				path: `tests/screenshots/B-0073-filter-inactive-result.png`,
			});

			// Lấy số lượng người dùng sau khi lọc
			const filteredUserCount = await userManagementPage.getUserCount();
			console.log(
				`Số lượng người dùng sau khi lọc theo trạng thái Không hoạt động: ${filteredUserCount}`
			);

			// Bước 4: Kiểm tra danh sách người dùng chỉ hiển thị những người có trạng thái Không hoạt động
			await userManagementPage.verifyAllUsersHaveStatus("Không hoạt động");

			// Bước 5: Kiểm tra xem số lượng kết quả khớp với người dùng có trạng thái Không hoạt động
			// Lưu ý: Số lượng người dùng sau khi lọc phải nhỏ hơn hoặc bằng số lượng ban đầu
			expect(filteredUserCount).toBeLessThanOrEqual(initialUserCount);
		} catch (error: unknown) {
			console.error(
				`Test failed with error: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
			// Đảm bảo page vẫn còn tồn tại trước khi chụp ảnh lỗi
			if (page && !page.isClosed()) {
				await page.screenshot({ path: `tests/screenshots/B-0073-error.png` });
			}
			throw error;
		}
	});
});
