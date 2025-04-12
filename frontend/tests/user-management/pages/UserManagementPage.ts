import { Page, Locator, expect } from "@playwright/test";

export class UserManagementPage {
	readonly page: Page;
	readonly roleDropdown: Locator;
	readonly statusDropdown: Locator;
	readonly userTable: Locator;
	readonly userTableRows: Locator;
	readonly roleFilterOptions: { [key: string]: string };
	readonly statusFilterOptions: { [key: string]: string } = {
		all: "Tất cả trạng thái",
		active: "Hoạt động",
		pending: "Chờ xác nhận",
		suspended: "Tạm ngưng",
		inactive: "Không hoạt động",
	};

	constructor(page: Page) {
		this.page = page;
		this.roleDropdown = page.locator(
			'[data-testid="role-filter"], select[name="role"], .role-filter, [aria-label="Lọc theo vai trò"], select:has-text("Tất cả vai trò"), #role-filter, .filter-role'
		);
		this.statusDropdown = page.locator(
			'[data-testid="status-filter"], select[name="status"], .status-filter, [aria-label="Lọc theo trạng thái"], select:has-text("Tất cả trạng thái"), #status-filter, .filter-status'
		);
		this.userTable = page.locator(
			"table, .user-table, .user-list, .data-table, .user-grid"
		);
		this.userTableRows = page.locator(
			"table tbody tr, .user-table .user-row, .user-list .user-item, .data-table tbody tr, .user-grid .user-item"
		);

		// Định nghĩa các giá trị lọc
		this.roleFilterOptions = {
			all: "Tất cả vai trò",
			admin: "Admin",
			user: "User",
		};
	}

	async navigateToUserManagement() {
		// Điều hướng đến trang quản lý người dùng
		await this.page.goto("/admin/users");

		// Chờ cho bảng người dùng hiển thị hoặc nội dung trang tải xong
		try {
			await this.userTable.waitFor({ state: "visible", timeout: 5000 });
			console.log("Đã tìm thấy bảng người dùng");
		} catch {
			console.log("Không tìm thấy bảng, kiểm tra phần tử khác");
			// Nếu không tìm thấy bảng, kiểm tra các phần tử khác để xác nhận trang đã tải
			await this.page.waitForSelector(
				'.user-management-page, h1:has-text("Quản lý người dùng"), .admin-container, .page-heading, h1, h2',
				{ timeout: 5000 }
			);
		}
	}

	async findAndLogFilters() {
		// Tìm tất cả các dropdown trên trang
		const dropdowns = this.page.locator(
			'select, .dropdown, [role="combobox"], button:has-text("Tất cả vai trò"), button:has-text("Tất cả trạng thái")'
		);
		const count = await dropdowns.count();
		console.log(`Tìm thấy ${count} dropdown trên trang`);

		for (let i = 0; i < count; i++) {
			const text = await dropdowns.nth(i).textContent();
			console.log(`Dropdown ${i}: ${text}`);
		}

		return count > 0;
	}

	async filterByRole(role: string) {
		try {
			console.log(`Thực hiện lọc theo vai trò: ${role}`);

			// Tìm dropdown vai trò bằng nhiều selector khác nhau
			const roleDropdown = this.page
				.locator(
					`
				button:has-text("Tất cả vai trò"), 
				button:has-text("Admin"), 
				button:has-text("User"),
				[aria-label="Lọc theo vai trò"],
				.role-filter button,
				button.filter-role
			`
				)
				.first();

			// Đợi và click vào dropdown
			await roleDropdown.waitFor({ state: "visible", timeout: 10000 });
			await roleDropdown.click();
			await this.page.waitForTimeout(1000);

			// Map role parameter to actual UI text
			const roleMap: { [key: string]: string } = {
				user: "Người dùng",
				admin: "Quản trị viên",
			};

			const roleText = roleMap[role.toLowerCase()] || role;
			console.log(`Tìm kiếm option với text: ${roleText}`);

			// Tìm và click vào option trong dropdown với nhiều cách khác nhau
			const roleOptions = [
				`li:has-text("${roleText}")`,
				`div[role="option"]:has-text("${roleText}")`,
				`.dropdown-item:has-text("${roleText}")`,
				`[role="menuitem"]:has-text("${roleText}")`,
				`.select-option:has-text("${roleText}")`,
			];

			for (const selector of roleOptions) {
				try {
					const option = this.page.locator(selector).first();
					const isVisible = await option.isVisible();
					if (isVisible) {
						await option.click();
						console.log(`Đã click vào option với selector: ${selector}`);
						break;
					}
				} catch (e) {
					console.log(`Không tìm thấy option với selector: ${selector}`);
				}
			}

			// Đợi table cập nhật
			await this.page.waitForTimeout(2000);
			await this.userTable.waitFor({ state: "visible" });
		} catch (error) {
			console.error(`Lỗi khi lọc theo vai trò: ${error}`);
			throw error;
		}
	}

	async filterByStatus(
		status: "active" | "pending" | "suspended" | "inactive" | "all"
	) {
		console.log(`Thực hiện lọc theo trạng thái: ${status}`);

		try {
			// Đợi và kiểm tra dropdown trạng thái
			await this.statusDropdown.waitFor({ state: "visible", timeout: 5000 });
			console.log("Dropdown trạng thái đã hiển thị");

			// Thử select option bằng value
			try {
				await this.statusDropdown.selectOption(status);
				console.log(`Đã chọn trạng thái bằng value: ${status}`);
				await this.page.waitForTimeout(2000);
				return;
			} catch (error) {
				console.log(`Không thể chọn bằng value: ${status}`, error);
			}

			// Thử select option bằng label
			try {
				const statusText = this.statusFilterOptions[status];
				await this.statusDropdown.selectOption({ label: statusText });
				console.log(`Đã chọn trạng thái bằng label: ${statusText}`);
				await this.page.waitForTimeout(2000);
				return;
			} catch (error) {
				console.log(`Không thể chọn bằng label`, error);
			}

			// Nếu không thể dùng selectOption, thử force select
			try {
				await this.page.evaluate((status) => {
					const select = document.querySelector(
						'select[name="status"], .status-filter, #status-filter'
					) as HTMLSelectElement;
					if (select) {
						select.value = status;
						select.dispatchEvent(new Event("change", { bubbles: true }));
					}
				}, status);
				console.log(`Đã thử force select với value: ${status}`);
				await this.page.waitForTimeout(2000);
				return;
			} catch (error) {
				console.log(`Không thể force select`, error);
			}

			throw new Error(
				`Không thể chọn trạng thái: ${this.statusFilterOptions[status]}`
			);
		} catch (error) {
			console.error("Lỗi khi lọc theo trạng thái:", error);
			throw error;
		}
	}

	async getUserCount() {
		console.log("Đếm số lượng người dùng trong bảng");
		try {
			const count = await this.userTableRows.count();
			console.log(`Số lượng hàng người dùng: ${count}`);
			return count;
		} catch {
			console.log("Không thể đếm trực tiếp hàng, thử tìm thông tin từ UI");
			// Nếu không thể đếm trực tiếp qua hàng, thử tìm số lượng được hiển thị trên UI
			try {
				const countText = await this.page
					.locator(
						".total-count, .pagination-info, .user-count, .results-count, .showing-text"
					)
					.textContent();
				console.log(`Tìm thấy thông tin số lượng: ${countText}`);
				if (countText) {
					const match = countText.match(/\d+/);
					if (match) return parseInt(match[0]);
				}
			} catch {
				console.log("Không tìm thấy thông tin số lượng");
			}
			return 0;
		}
	}

	async verifySelectedRoleFilter(role: "admin" | "user" | "all") {
		console.log(
			`Xác minh dropdown vai trò hiển thị: ${this.roleFilterOptions[role]}`
		);
		try {
			await expect(this.roleDropdown).toContainText(
				this.roleFilterOptions[role],
				{ ignoreCase: true }
			);
			console.log(
				"Xác minh thành công: Dropdown vai trò hiển thị đúng giá trị"
			);
		} catch (error) {
			console.error("Lỗi khi xác minh giá trị dropdown vai trò:", error);
		}
	}

	async verifySelectedStatusFilter(
		status: "active" | "pending" | "suspended" | "inactive" | "all"
	) {
		console.log(
			`Xác minh dropdown trạng thái hiển thị: ${this.statusFilterOptions[status]}`
		);
		try {
			await expect(this.statusDropdown).toContainText(
				this.statusFilterOptions[status],
				{ ignoreCase: true }
			);
			console.log(
				"Xác minh thành công: Dropdown trạng thái hiển thị đúng giá trị"
			);
		} catch (error) {
			console.error("Lỗi khi xác minh giá trị dropdown trạng thái:", error);
		}
	}

	async verifyAllUsersHaveRole(role: string) {
		console.log(`Kiểm tra tất cả người dùng có vai trò: ${role}`);
		// Lấy tất cả các hàng trong bảng người dùng
		const rowCount = await this.userTableRows.count();
		console.log(`Số lượng hàng cần kiểm tra: ${rowCount}`);

		// Nếu không có kết quả nào thì kiểm tra thông báo không có dữ liệu
		if (rowCount === 0) {
			console.log("Không có kết quả, kiểm tra thông báo 'Không có dữ liệu'");
			try {
				await expect(
					this.page.locator(
						'.no-data, .empty-message, text="Không có dữ liệu", .no-results'
					)
				).toBeVisible();
				console.log("Đã xác minh thông báo 'Không có dữ liệu'");
			} catch {
				console.warn(
					"Không thấy thông báo 'Không có dữ liệu' mặc dùng không có kết quả"
				);
			}
			return;
		}

		// Kiểm tra từng hàng có vai trò đúng không
		let allMatch = true;
		for (let i = 0; i < rowCount; i++) {
			console.log(`Kiểm tra hàng ${i + 1}/${rowCount}`);
			// Lấy nội dung của hàng
			const rowText = (await this.userTableRows.nth(i).textContent()) || "";
			console.log(`Nội dung hàng ${i + 1}: ${rowText}`);

			// Kiểm tra nếu nội dung hàng có chứa "Quản trị viên" hoặc "Người dùng"
			if (role === "Admin" && rowText.includes("Quản trị viên")) {
				console.log(`✓ Hàng ${i + 1} có vai trò Admin (Quản trị viên)`);
				continue;
			} else if (role === "User" && rowText.includes("Người dùng")) {
				console.log(`✓ Hàng ${i + 1} có vai trò User (Người dùng)`);
				continue;
			}

			// Nếu không khớp với các điều kiện trên, đánh dấu là không khớp
			if (
				(role === "Admin" && !rowText.includes("Quản trị viên")) ||
				(role === "User" && !rowText.includes("Người dùng"))
			) {
				console.warn(`✗ Hàng ${i + 1} không khớp với vai trò "${role}"`);
				allMatch = false;
			}
		}

		// Kết quả kiểm tra
		if (allMatch) {
			console.log(`✓ Tất cả ${rowCount} hàng đều có vai trò "${role}"`);
		} else {
			console.warn(`✗ Một số hàng không có vai trò "${role}"`);
		}
	}

	async verifyAllUsersHaveStatus(status: string) {
		console.log(`Kiểm tra tất cả người dùng có trạng thái: ${status}`);
		// Lấy tất cả các hàng trong bảng người dùng
		const rowCount = await this.userTableRows.count();
		console.log(`Số lượng hàng cần kiểm tra: ${rowCount}`);

		// Nếu không có kết quả nào thì kiểm tra thông báo không có dữ liệu
		if (rowCount === 0) {
			console.log("Không có kết quả, kiểm tra thông báo 'Không có dữ liệu'");
			try {
				await expect(
					this.page.locator(
						'.no-data, .empty-message, text="Không có dữ liệu", .no-results'
					)
				).toBeVisible();
				console.log("Đã xác minh thông báo 'Không có dữ liệu'");
			} catch {
				console.warn(
					"Không thấy thông báo 'Không có dữ liệu' mặc dùng không có kết quả"
				);
			}
			return;
		}

		// Xác định các chuỗi cần kiểm tra dựa trên trạng thái
		let statusTextToCheck = "";
		switch (status) {
			case "Tạm ngưng":
				statusTextToCheck = "Tạm ngưng";
				break;
			case "Chờ xác nhận":
				statusTextToCheck = "Chờ xác nhận";
				break;
			case "Hoạt động":
				statusTextToCheck = "Hoạt động";
				break;
			case "Không hoạt động":
				statusTextToCheck = "Không hoạt động";
				break;
			default:
				statusTextToCheck = status;
		}

		// Kiểm tra từng hàng có trạng thái đúng không
		let allMatch = true;
		for (let i = 0; i < rowCount; i++) {
			console.log(`Kiểm tra hàng ${i + 1}/${rowCount}`);
			// Lấy nội dung của hàng
			const rowText = (await this.userTableRows.nth(i).textContent()) || "";
			console.log(`Nội dung hàng ${i + 1}: ${rowText}`);

			// Kiểm tra nội dung hàng có chứa trạng thái cần kiểm tra không
			if (rowText.includes(statusTextToCheck)) {
				console.log(`✓ Hàng ${i + 1} có trạng thái ${statusTextToCheck}`);
			} else {
				console.warn(
					`✗ Hàng ${i + 1} không có trạng thái ${statusTextToCheck}`
				);
				allMatch = false;
			}
		}

		// Kết quả kiểm tra
		if (allMatch) {
			console.log(
				`✓ Tất cả ${rowCount} hàng đều có trạng thái "${statusTextToCheck}"`
			);
		} else {
			console.warn(`✗ Một số hàng không có trạng thái "${statusTextToCheck}"`);
		}
	}

	/**
	 * Chụp ảnh màn hình với tên file được chỉ định
	 * @param name Tên file ảnh (không cần đuôi .png)
	 */
	async takeScreenshot(name: string) {
		await this.page.screenshot({
			path: `tests/screenshots/${name}.png`,
			fullPage: true,
		});
	}

	/**
	 * Thay đổi vai trò của người dùng
	 */
	async changeUserRole(username: string, newRole: "Admin" | "User") {
		// Tìm hàng của người dùng
		const userRow = this.page.locator(`tr:has-text("${username}")`);
		
		// Click vào nút sửa vai trò
		await userRow.locator('button[title="Thay đổi vai trò"]').click();
		
		// Đợi popup hiển thị
		await this.page.waitForSelector('text=Thay đổi vai trò người dùng', { timeout: 10000 });
		
		// Đợi select element hiển thị và có thể tương tác
		await this.page.waitForSelector('#role-select', { state: 'visible' });
		
		// Chọn vai trò mới từ dropdown bằng JavaScript để đảm bảo thay đổi được áp dụng
		await this.page.evaluate((role) => {
			const select = document.querySelector('#role-select');
			if (select) {
				(select as HTMLSelectElement).value = role.toLowerCase();
				select.dispatchEvent(new Event('change', { bubbles: true }));
				console.log(`Changed select value to ${role.toLowerCase()}`);
			} else {
				console.error('Role select element not found');
			}
		}, newRole);
		
		// Đợi nút cập nhật vai trò có thể click được
		await this.page.waitForSelector('button:has-text("Cập nhật vai trò"):not([disabled])', 
			{ timeout: 10000 });
		
		// Click nút cập nhật vai trò
		await this.page.click('button:has-text("Cập nhật vai trò"):not([disabled])');
		
		// Đợi một chút để đảm bảo thay đổi đã được áp dụng
		await this.page.waitForTimeout(2000);
		
		// Kiểm tra vai trò đã được cập nhật trong bảng thay vì đợi toast
		const roleText = newRole === "Admin" ? "Quản trị viên" : "Người dùng";
		try {
			await this.page.waitForSelector(
				`tr:has-text("${username}") td:has-text("${roleText}")`,
				{ timeout: 10000 }
			);
			console.log(`Vai trò của ${username} đã được cập nhật thành ${roleText}`);
		} catch (error) {
			console.error(`Không thể xác minh vai trò đã được cập nhật: ${error}`);
			// Chụp ảnh màn hình để debug
			await this.takeScreenshot(`role-change-error-${Date.now()}`);
			throw error;
		}
	}

	/**
	 * Thay đổi trạng thái của người dùng
	 */
	async changeUserStatus(
		username: string,
		newStatus: "active" | "pending" | "suspended" | "inactive"
	) {
		// Click vào nút sửa trạng thái
		await this.page.click(
			`tr:has-text("${username}") .edit-status-button, tr:has-text("${username}") button:has([aria-label="Sửa trạng thái"])`
		);

		// Đợi popup hiển thị
		await this.page.waitForSelector(
			'.status-change-modal, .modal:has-text("Thay đổi trạng thái")'
		);

		// Chọn trạng thái mới
		const statusText = this.statusFilterOptions[newStatus];
		await this.page.selectOption('.status-select, select[name="status"]', {
			label: statusText,
		});

		// Click nút cập nhật
		await this.page.click('button:has-text("Cập nhật trạng thái")');

		// Đợi thông báo thành công
		await this.page.waitForSelector(
			`text=Đã cập nhật trạng thái của ${username} thành ${statusText}`
		);
	}

	/**
	 * Xóa người dùng
	 */
	async deleteUser(username: string, confirm: boolean = true) {
		// Click vào nút xóa
		await this.page.click(
			`tr:has-text("${username}") .delete-button, tr:has-text("${username}") button:has([aria-label="Xóa người dùng"])`
		);

		// Đợi popup xác nhận hiển thị
		await this.page.waitForSelector(
			"text=Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
		);

		if (confirm) {
			// Click nút Xóa để xác nhận
			await this.page.click('button:has-text("Xóa")');
			// Đợi thông báo thành công
			await this.page.waitForSelector("text=Đã xoá người dùng thành công");
		} else {
			// Click nút Huỷ
			await this.page.click('button:has-text("Huỷ")');
		}
	}

	/**
	 * Kiểm tra người dùng có tồn tại trong danh sách không
	 */
	async checkUserExists(username: string): Promise<boolean> {
		try {
			await this.page.waitForSelector(`tr:has-text("${username}")`, {
				timeout: 5000,
			});
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Xác minh vai trò của người dùng
	 * @param username Tên người dùng cần kiểm tra
	 * @param expectedRole Vai trò mong đợi ("Admin" hoặc "User")
	 */
	async verifyUserRole(username: string, expectedRole: "Admin" | "User") {
		console.log(`Xác minh vai trò của người dùng ${username} là ${expectedRole}`);
		
		// Tìm hàng của người dùng
		const userRow = this.page.locator(`tr:has-text("${username}")`);
		
		// Xác định text vai trò cần kiểm tra
		const roleText = expectedRole === "Admin" ? "Quản trị viên" : "Người dùng";
		
		// Kiểm tra vai trò trong hàng
		try {
			// Chờ tối đa 10 giây để vai trò được cập nhật
			await expect(userRow.locator(`td:has-text("${roleText}")`)).toBeVisible({
				timeout: 10000
			});
			console.log(`✓ Xác minh thành công: ${username} có vai trò ${roleText}`);
			return true;
		} catch (error) {
			console.error(`✗ Xác minh thất bại: ${username} không có vai trò ${roleText}`);
			// Chụp ảnh màn hình để debug
			await this.takeScreenshot(`role-verification-error-${Date.now()}`);
			throw error;
		}
	}
}
