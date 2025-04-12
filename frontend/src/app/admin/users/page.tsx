"use client";

import { useState, useEffect } from "react";
import { User, Search, Trash2, UserCheck, Shield } from "lucide-react";
import { Navbar } from "@/layout/Navbar";
import { userService } from "@/services/userService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Toast from "@/components/ui/Toast";

// Định nghĩa interface cho User trong component
interface UserData {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	createdAt: Date;
	status: string;
	isEmailVerified: boolean;
}

export default function UsersPage() {
	const [users, setUsers] = useState<UserData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<string | null>(null);
	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error" | "info";
	} | null>(null);

	// State cho bộ lọc
	const [roleFilter, setRoleFilter] = useState<string>("");
	const [statusFilter, setStatusFilter] = useState<string>("");

	// Phân trang
	const [currentPage, setCurrentPage] = useState(1);
	const usersPerPage = 6;

	// Mở modal thay đổi vai trò
	const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
	const [userToUpdateRole, setUserToUpdateRole] = useState<{id: string, name: string, currentRole: string} | null>(null);
	const [newRole, setNewRole] = useState<string>("");
	const [isRoleUpdating, setIsRoleUpdating] = useState(false);

	// Mở modal thay đổi trạng thái
	const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
	const [userToUpdateStatus, setUserToUpdateStatus] = useState<{id: string, name: string, currentStatus: string} | null>(null);
	const [newStatus, setNewStatus] = useState<string>("");
	const [isStatusUpdating, setIsStatusUpdating] = useState(false);

	// Lấy danh sách người dùng từ API
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setLoading(true);
				const data = await userService.getAllUsers();
				setUsers(data as unknown as UserData[]);
				setError(null);
			} catch (err: unknown) {
				const error = err as Error;
				setError(error.message || "Không thể tải danh sách người dùng");
				console.error("Lỗi khi tải danh sách người dùng:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	// Lọc người dùng theo từ khóa tìm kiếm, vai trò và trạng thái
	const filteredUsers = users.filter((user) => {
		const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
		const email = user.email.toLowerCase();
		const term = searchTerm.toLowerCase();
		const matchesSearch = fullName.includes(term) || email.includes(term);

		// Kiểm tra điều kiện lọc theo vai trò
		const matchesRole = roleFilter === "" || user.role === roleFilter;

		// Kiểm tra điều kiện lọc theo trạng thái
		const matchesStatus = statusFilter === "" || user.status === statusFilter;

		return matchesSearch && matchesRole && matchesStatus;
	});

	// Hàm xử lý tìm kiếm
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
	};

	// Hàm xử lý thay đổi bộ lọc
	const handleRoleFilterChange = (value: string) => {
		setRoleFilter(value);
		setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc vai trò
	};

	const handleStatusFilterChange = (value: string) => {
		setStatusFilter(value);
		setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc trạng thái
	};

	// Phân trang dữ liệu
	const indexOfLastUser = currentPage * usersPerPage;
	const indexOfFirstUser = indexOfLastUser - usersPerPage;
	const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
	const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

	// Chuyển trang
	const goToPage = (page: number) => {
		if (page > 0 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	// Chọn/bỏ chọn tất cả người dùng trong trang hiện tại
	const toggleSelectAll = () => {
		if (selectedUsers.length === currentUsers.length) {
			setSelectedUsers([]);
		} else {
			setSelectedUsers(currentUsers.map((user) => user.id));
		}
	};

	// Chọn/bỏ chọn một người dùng
	const toggleSelectUser = (userId: string) => {
		if (selectedUsers.includes(userId)) {
			setSelectedUsers(selectedUsers.filter((id) => id !== userId));
		} else {
			setSelectedUsers([...selectedUsers, userId]);
		}
	};

	// Xác nhận xóa một người dùng
	const confirmDelete = (userId: string) => {
		setUserToDelete(userId);
		setIsDeleteModalOpen(true);
	};

	// Xóa người dùng đã chọn
	const handleDelete = async () => {
		if (userToDelete) {
			try {
				setLoading(true);
				await userService.deleteUser(userToDelete);

				// Cập nhật state danh sách người dùng và thông báo
				setUsers((prevUsers) =>
					prevUsers.filter((user) => user.id !== userToDelete)
				);

				// Hiển thị toast thông báo thành công
				setToast({
					message: "Xóa người dùng thành công",
					type: "success",
				});

				// Xóa thông báo lỗi nếu có
				setError(null);
				setUserToDelete(null);
			} catch (err: unknown) {
				const error = err as Error;
				// Hiển thị lỗi trong toast thay vì ở phía trên
				setToast({
					message: error.message || "Không thể xóa người dùng",
					type: "error",
				});
				console.error("Lỗi khi xóa người dùng:", err);
			} finally {
				setLoading(false);
				setIsDeleteModalOpen(false);
			}
		} else {
			setIsDeleteModalOpen(false);
		}
	};

	// Đóng modal xóa
	const closeDeleteModal = () => {
		setIsDeleteModalOpen(false);
		setUserToDelete(null);
	};

	// Format ngày tạo
	const formatDate = (date: Date) => {
		if (!date) return "";
		return format(new Date(date), "dd/MM/yyyy", { locale: vi });
	};

	// Mở modal thay đổi vai trò
	const openRoleModal = (user: UserData) => {
		setUserToUpdateRole({
			id: user.id,
			name: `${user.firstName} ${user.lastName}`,
			currentRole: user.role
		});
		setNewRole(user.role);
		setIsRoleModalOpen(true);
	};

	// Đóng modal thay đổi vai trò
	const closeRoleModal = () => {
		setIsRoleModalOpen(false);
		setUserToUpdateRole(null);
		setNewRole("");
	};

	// Cập nhật vai trò người dùng
	const handleRoleUpdate = async () => {
		if (!userToUpdateRole || newRole === userToUpdateRole.currentRole) {
			closeRoleModal();
			return;
		}

		try {
			setIsRoleUpdating(true);
			const updatedUser = await userService.updateUserRole(userToUpdateRole.id, newRole);
			
			// Cập nhật danh sách người dùng
			setUsers(users.map(user => 
				user.id === userToUpdateRole.id 
					? { ...user, role: updatedUser.role } 
					: user
			));

			setToast({
				message: `Đã cập nhật vai trò của ${userToUpdateRole.name} thành ${newRole === 'admin' ? 'Quản trị viên' : 'Người dùng'}`,
				type: "success"
			});
			
			closeRoleModal();
		} catch (err: unknown) {
			const error = err as Error;
			setToast({
				message: error.message || "Không thể cập nhật vai trò người dùng",
				type: "error"
			});
			console.error("Lỗi khi cập nhật vai trò:", err);
		} finally {
			setIsRoleUpdating(false);
		}
	};

	// Mở modal thay đổi trạng thái
	const openStatusModal = (user: UserData) => {
		setUserToUpdateStatus({
			id: user.id,
			name: `${user.firstName} ${user.lastName}`,
			currentStatus: user.status
		});
		setNewStatus(user.status);
		setIsStatusModalOpen(true);
	};

	// Đóng modal thay đổi trạng thái
	const closeStatusModal = () => {
		setIsStatusModalOpen(false);
		setUserToUpdateStatus(null);
		setNewStatus("");
	};

	// Cập nhật trạng thái người dùng
	const handleStatusUpdate = async () => {
		if (!userToUpdateStatus || newStatus === userToUpdateStatus.currentStatus) {
			closeStatusModal();
			return;
		}

		try {
			setIsStatusUpdating(true);
			const updatedUser = await userService.updateUserStatus(userToUpdateStatus.id, newStatus);
			
			// Cập nhật danh sách người dùng
			setUsers(users.map(user => 
				user.id === userToUpdateStatus.id 
					? { ...user, status: updatedUser.status } 
					: user
			));

			// Hiển thị thông báo thành công
			let statusText = "";
			if (newStatus === "active") statusText = "Hoạt động";
			else if (newStatus === "inactive") statusText = "Tạm ngưng";
			else if (newStatus === "pending") statusText = "Chờ xác nhận";

			setToast({
				message: `Đã cập nhật trạng thái của ${userToUpdateStatus.name} thành ${statusText}`,
				type: "success"
			});

			closeStatusModal();
		} catch (err: unknown) {
			setToast({
				message: err instanceof Error ? err.message : "Không thể cập nhật trạng thái người dùng",
				type: "error"
			});
		} finally {
			setIsStatusUpdating(false);
		}
	};

	return (
		<div>
			<Navbar />
			{/* Toast notification */}
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}
			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-800">
						Quản lý người dùng
					</h1>
				</div>
			</div>

			{/* Hiển thị thông báo lỗi nếu có */}
			{error && (
				<div className="mb-4 rounded-md bg-red-50 p-4 text-red-600">
					<p>{error}</p>
				</div>
			)}

			{/* Bộ lọc và tìm kiếm */}
			<div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
				<div className="w-full max-w-md">
					<div className="relative">
						<input
							type="text"
							placeholder="Tìm kiếm người dùng..."
							className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 pl-10 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
							value={searchTerm}
							onChange={handleSearch}
						/>
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<select
						className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						value={roleFilter}
						onChange={(e) => handleRoleFilterChange(e.target.value)}
					>
						<option value="">Tất cả vai trò</option>
						<option value="admin">Admin</option>
						<option value="user">User</option>
					</select>
					<div className="ml-2">
						<select
							className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
							value={statusFilter}
							onChange={(e) => handleStatusFilterChange(e.target.value)}
						>
							<option value="">Tất cả trạng thái</option>
							<option value="active">Hoạt động</option>
							<option value="inactive">Không hoạt động</option>
							<option value="pending">Chờ xác nhận email</option>
						</select>
					</div>
				</div>
			</div>

			{/* Hiển thị loading */}
			{loading ? (
				<div className="flex items-center justify-center py-10">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
					<span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
				</div>
			) : (
				/* Bảng người dùng */
				<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
					<div className="overflow-x-auto">
						<table className="w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th scope="col" className="px-6 py-3 text-left">
										<div className="flex items-center">
											<input
												type="checkbox"
												className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
												checked={
													selectedUsers.length === currentUsers.length &&
													currentUsers.length > 0
												}
												onChange={toggleSelectAll}
											/>
										</div>
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>
										Người dùng
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>
										Email
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>
										Vai trò
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>
										Ngày tạo
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>
										Trạng thái
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 whitespace-nowrap w-24"
									>
										Thao tác
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 bg-white">
								{currentUsers.map((user) => (
									<tr key={user.id} className="hover:bg-gray-50">
										<td className="whitespace-nowrap px-6 py-4">
											<input
												type="checkbox"
												className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
												checked={selectedUsers.includes(user.id)}
												onChange={() => toggleSelectUser(user.id)}
											/>
										</td>
										<td className="whitespace-nowrap px-6 py-4">
											<div className="flex items-center">
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500">
													<User size={14} />
												</div>
												<div className="ml-3">
													<div className="text-sm font-medium text-gray-900">
														{user.firstName} {user.lastName}
													</div>
												</div>
											</div>
										</td>
										<td className="whitespace-nowrap px-6 py-4">
											<div className="text-sm text-gray-500">{user.email}</div>
										</td>
										<td className="whitespace-nowrap px-6 py-4">
											<div className="flex items-center">
												<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
													user.role === "admin" 
														? "bg-purple-100 text-purple-800" 
														: "bg-blue-100 text-blue-800"
												}`}>
													{user.role === "admin" ? (
														<>
															<Shield size={14} className="mr-1" />
															Quản trị viên
														</>
													) : (
														<>
															<UserCheck size={14} className="mr-1" />
															Người dùng
														</>
													)}
												</span>
												<button 
													onClick={() => openRoleModal(user)}
													className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600" 
													title="Thay đổi vai trò"
												>
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
														<path d="M12 20h9"></path>
														<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
													</svg>
												</button>
											</div>
										</td>
										<td className="whitespace-nowrap px-6 py-4">
											<div className="text-sm text-gray-500">
												{formatDate(user.createdAt)}
											</div>
										</td>
										<td className="whitespace-nowrap px-6 py-4">
											<div className="flex items-center">
												{user.status === "active" ? (
													<>
														<span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
															Hoạt động
														</span>
														<button
															onClick={() => openStatusModal(user)}
															className="text-gray-400 hover:text-orange-500 transition-colors"
															title="Thay đổi trạng thái"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-4 w-4"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
																/>
															</svg>
														</button>
													</>
												) : user.status === "inactive" ? (
													<>
														<span className="bg-orange-100 text-orange-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
															Tạm ngưng
														</span>
														<button
															onClick={() => openStatusModal(user)}
															className="text-gray-400 hover:text-green-500 transition-colors"
															title="Thay đổi trạng thái"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-4 w-4"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
																/>
															</svg>
														</button>
													</>
												) : (
													<>
														<span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
															Chờ xác nhận
														</span>
														<button
															onClick={() => openStatusModal(user)}
															className="text-gray-400 hover:text-blue-500 transition-colors"
															title="Thay đổi trạng thái"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-4 w-4"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
																/>
															</svg>
														</button>
													</>
												)}
											</div>
										</td>
										<td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
											<div className="flex items-center justify-end space-x-2">
												<button
													className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
													title="Xóa"
													onClick={() => confirmDelete(user.id)}
												>
													<Trash2 size={16} />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Phân trang */}
					<div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
						<div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
							<div>
								<p className="text-sm text-gray-700">
									Hiển thị <span className="font-medium">{indexOfFirstUser + 1}</span> đến{" "}
									<span className="font-medium">
										{Math.min(indexOfLastUser, filteredUsers.length)}
									</span>{" "}
									trong{" "}
									<span className="font-medium">{filteredUsers.length}</span>{" "}
									kết quả
								</p>
							</div>
							<div>
								<nav
									className="isolate inline-flex -space-x-px rounded-md shadow-sm"
									aria-label="Pagination"
								>
									<button
										onClick={() => goToPage(currentPage - 1)}
										disabled={currentPage === 1}
										className={`relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium ${
											currentPage === 1
												? "text-gray-300 cursor-not-allowed"
												: "text-gray-500 hover:bg-gray-50 cursor-pointer"
										}`}
									>
										Trước
									</button>
									
									{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
										<button
											key={page}
											onClick={() => goToPage(page)}
											aria-current={currentPage === page ? "page" : undefined}
											className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
												currentPage === page
													? "z-10 border-blue-500 bg-blue-50 text-blue-600"
													: "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
											}`}
										>
											{page}
										</button>
									))}
									
									<button
										onClick={() => goToPage(currentPage + 1)}
										disabled={currentPage === totalPages}
										className={`relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium ${
											currentPage === totalPages
												? "text-gray-300 cursor-not-allowed"
												: "text-gray-500 hover:bg-gray-50 cursor-pointer"
										}`}
									>
										Sau
									</button>
								</nav>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Modal xác nhận xóa */}
			{isDeleteModalOpen && (
				<div className="fixed inset-0 z-10 overflow-y-auto">
					<div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-0 transition-opacity"
							aria-hidden="true"
							onClick={closeDeleteModal}
						></div>
						<span
							className="hidden sm:inline-block sm:h-screen sm:align-middle"
							aria-hidden="true"
						>
							&#8203;
						</span>
						<div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle" style={{ border: '2px solid #2563eb', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
							<div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
								<div className="sm:flex sm:items-start">
									<div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
										<Trash2
											className="h-6 w-6 text-red-600"
											aria-hidden="true"
										/>
									</div>
									<div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
										<h3
											className="text-lg font-medium leading-6 text-gray-900"
											id="modal-title"
										>
											Xóa người dùng
										</h3>
										<div className="mt-2">
											<p className="text-sm text-gray-500">
												Bạn có chắc chắn muốn xóa người dùng này? Hành động này
												không thể hoàn tác.
											</p>
										</div>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
								<button
									type="button"
									className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
									onClick={handleDelete}
									disabled={loading}
								>
									{loading ? (
										<>
											<span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
											Đang xử lý...
										</>
									) : (
										"Xóa"
									)}
								</button>
								<button
									type="button"
									className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
									onClick={closeDeleteModal}
									disabled={loading}
								>
									Hủy
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Modal thay đổi vai trò */}
			{isRoleModalOpen && userToUpdateRole && (
				<div className="fixed inset-0 z-10 overflow-y-auto">
					<div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
							aria-hidden="true"
							onClick={closeRoleModal}
						></div>
						<span
							className="hidden sm:inline-block sm:h-screen sm:align-middle"
							aria-hidden="true"
						>
							&#8203;
						</span>
						<div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
							<div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
								<div className="sm:flex sm:items-start">
									<div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
										<Shield
											className="h-6 w-6 text-blue-600"
											aria-hidden="true"
										/>
									</div>
									<div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
										<h3
											className="text-lg font-medium leading-6 text-gray-900"
											id="modal-title"
										>
											Thay đổi vai trò người dùng
										</h3>
										<div className="mt-2">
											<p className="text-sm text-gray-500 mb-4">
												Bạn đang thay đổi vai trò của người dùng <strong>{userToUpdateRole.name}</strong>.
											</p>
											
											<div className="mt-4">
												<label htmlFor="role-select" className="block text-sm font-medium text-gray-700">
													Vai trò
												</label>
												<select
													id="role-select"
													value={newRole}
													onChange={(e) => setNewRole(e.target.value)}
													className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
												>
													<option value="user">Người dùng</option>
													<option value="admin">Quản trị viên</option>
												</select>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
								<button
									type="button"
									className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
									onClick={handleRoleUpdate}
									disabled={isRoleUpdating || newRole === userToUpdateRole.currentRole}
								>
									{isRoleUpdating ? (
										<>
											<span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
											Đang xử lý...
										</>
									) : (
										"Cập nhật vai trò"
									)}
								</button>
								<button
									type="button"
									className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
									onClick={closeRoleModal}
									disabled={isRoleUpdating}
								>
									Hủy
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Modal thay đổi trạng thái */}
			{isStatusModalOpen && (
				<div className="fixed inset-0 z-50 overflow-y-auto">
					<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 transition-opacity"
							aria-hidden="true"
						>
							<div className="absolute inset-0 bg-gray-500 opacity-75"></div>
						</div>

						<span
							className="hidden sm:inline-block sm:align-middle sm:h-screen"
							aria-hidden="true"
						>
							&#8203;
						</span>

						<div
							className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
							role="dialog"
							aria-modal="true"
							aria-labelledby="modal-headline"
						>
							<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<div className="sm:flex sm:items-start">
									<div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
										<User className="h-6 w-6 text-blue-600" />
									</div>
									<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
										<h3
											className="text-lg leading-6 font-medium text-gray-900"
											id="modal-headline"
										>
											Thay đổi trạng thái người dùng
										</h3>
										<div className="mt-2">
											<p className="text-sm text-gray-500">
												Bạn đang thay đổi trạng thái cho người dùng{" "}
												<span className="font-semibold">
													{userToUpdateStatus?.name}
												</span>
												. Trạng thái hiện tại:{" "}
												<span className="font-semibold">
													{userToUpdateStatus?.currentStatus === "active"
														? "Hoạt động"
														: userToUpdateStatus?.currentStatus === "inactive"
														? "Tạm ngưng"
														: "Chờ xác nhận"}
												</span>
											</p>
										</div>

										<div className="mt-4">
											<label
												htmlFor="status"
												className="block text-sm font-medium text-gray-700"
											>
												Trạng thái mới
											</label>
											<select
												id="status"
												name="status"
												className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
												value={newStatus}
												onChange={(e) => setNewStatus(e.target.value)}
											>
												<option value="active">Hoạt động</option>
												<option value="inactive">Tạm ngưng</option>
												<option value="pending">Chờ xác nhận</option>
											</select>
										</div>
									</div>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
								<button
									type="button"
									className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
									onClick={handleStatusUpdate}
									disabled={isStatusUpdating}
								>
									{isStatusUpdating ? "Đang cập nhật..." : "Cập nhật trạng thái"}
								</button>
								<button
									type="button"
									className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
									onClick={closeStatusModal}
									disabled={isStatusUpdating}
								>
									Hủy
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
