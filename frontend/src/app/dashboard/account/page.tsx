"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { Check, User, Mail, Eye, EyeOff } from "lucide-react";

// Mở rộng interface User để thêm trường hasPassword
interface ExtendedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  favorites: string[];
  hasPassword?: boolean;
}

export default function Account() {
  const { user, isAuthenticated, isLoading, updateProfile, updatePassword, getStoredPassword } = useAuthContext();
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState({ firstName: "", lastName: "" });
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setDisplayName({ 
        firstName: user.firstName || "", 
        lastName: user.lastName || "" 
      });
      setEmail(user.email || "");
      setNewEmail(user.email || "");
      
      // Kiểm tra nếu user đăng nhập bằng Google (email có chứa gmail.com và không có mật khẩu)
      // Đây là logic mẫu, bạn có thể cần điều chỉnh dựa trên cách xác định user Google trong hệ thống của bạn
      const emailDomain = user.email.split('@')[1];
      const isGoogle = emailDomain === 'gmail.com' || user.email.includes('google');
      
      // Nếu là tài khoản Google và chưa thiết lập mật khẩu
      setIsGoogleUser(isGoogle && !(user as ExtendedUser).hasPassword);
    }
  }, [isAuthenticated, isLoading, router, user, getStoredPassword]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleDeleteAccount = () => {
    // Xử lý logic xóa tài khoản
    alert("Tài khoản của bạn đã được yêu cầu xóa. Chúng tôi sẽ xử lý trong thời gian sớm nhất.");
    setShowDeleteModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Account</h1>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8 overflow-hidden">
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
            <User className="mr-2 text-blue-500" size={20} />
            Thông tin tài khoản
          </h2>
          
          <div className="flex items-center py-5 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-2xl mr-6 shadow-md">
              {displayName.firstName ? displayName.firstName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-600 mb-1">Họ và tên</div>
              <div className="text-lg font-semibold text-gray-800">{displayName.firstName} {displayName.lastName}</div>
            </div>
            <button 
              className="px-4 py-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center"
              onClick={() => setShowEditModal(true)}
            >
              <span>Chỉnh sửa</span>
            </button>
          </div>
          
          <div className="py-5 border-b border-gray-100">
            <div className="flex items-center">
              <Mail className="text-blue-500 mr-4" size={20} />
              <div className="flex-1">
                <div className="font-medium text-gray-600 mb-1">Email</div>
                <div className="flex items-center">
                  <span className="text-gray-800">{user.email}</span>
                  <span className="ml-3 inline-flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <Check size={14} className="mr-1" /> Email đã xác thực
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Modal đổi mật khẩu */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-40 overflow-auto flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-25" onClick={() => setShowPasswordModal(false)}></div>
          <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-lg border border-gray-200 z-50 mx-auto my-8">
            <h3 className="text-xl font-semibold mb-4">{isGoogleUser ? "Thiết lập mật khẩu" : "Đổi mật khẩu"}</h3>
            <div className="space-y-4">
              {!isGoogleUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      onMouseDown={() => setShowPassword(true)}
                      onMouseUp={() => setShowPassword(false)}
                      onMouseLeave={() => setShowPassword(false)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isGoogleUser ? "Mật khẩu mới" : "Mật khẩu mới"}
                </label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onMouseDown={() => setShowNewPassword(true)}
                    onMouseUp={() => setShowNewPassword(false)}
                    onMouseLeave={() => setShowNewPassword(false)}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onMouseDown={() => setShowConfirmPassword(true)}
                    onMouseUp={() => setShowConfirmPassword(false)}
                    onMouseLeave={() => setShowConfirmPassword(false)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => setShowPasswordModal(false)}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={async () => {
                  try {
                    if (newPassword !== confirmPassword) {
                      alert("Mật khẩu xác nhận không khớp!");
                      return;
                    }
                    
                    if (newPassword.length < 6) {
                      alert("Mật khẩu phải có ít nhất 6 ký tự!");
                      return;
                    }
                    
                    // Gọi API cập nhật mật khẩu
                    await updatePassword({ 
                      currentPassword: !isGoogleUser ? password : undefined, 
                      newPassword 
                    });
                  } catch (error) {
                    console.error("Lỗi khi cập nhật mật khẩu:", error);
                    alert("Không thể cập nhật mật khẩu. Vui lòng thử lại sau.");
                  }
                }}
              >
                {isGoogleUser ? "Thiết lập mật khẩu" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa tài khoản */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-40 overflow-auto flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-25" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-lg border border-gray-200 z-50 mx-auto my-8">
            <h3 className="text-xl font-semibold mb-2 text-red-600">Xóa tài khoản</h3>
            <p className="mb-4 text-gray-600">Bạn có chắc chắn muốn xóa tài khoản? Tất cả thông tin của bạn sẽ bị xóa và không thể khôi phục.</p>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                onClick={handleDeleteAccount}
              >
                Xóa tài khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa thông tin cá nhân */}
      {showEditModal && (
        <div className="fixed inset-0 z-40 overflow-auto flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-25" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-lg border border-gray-200 z-50 mx-auto my-8">
            <h3 className="text-xl font-semibold mb-4">Chỉnh sửa Họ Tên</h3>
            {updateSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md">
                Thông tin cá nhân đã được cập nhật thành công!
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setShowEditModal(false);
                  setUpdateSuccess(false);
                }}
                disabled={isUpdating}
              >
                Hủy
              </button>
              <button 
                className={`px-4 py-2 ${isUpdating ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md transition-colors flex items-center`}
                onClick={async () => {
                  try {
                    setIsUpdating(true);
                    // Cập nhật tên hiển thị ngay lập tức
                    setDisplayName({ firstName, lastName });
                    
                    console.log("Bắt đầu cập nhật profile với dữ liệu:", { firstName, lastName });
                    
                    // Gọi API để cập nhật tên trong cơ sở dữ liệu
                    await updateProfile({ firstName, lastName });
                    
                    console.log("Cập nhật profile thành công!");
                    
                    // Hiển thị thông báo thành công
                    setUpdateSuccess(true);
                    
                    // Đóng modal sau 2 giây
                    setTimeout(() => {
                      setShowEditModal(false);
                      setUpdateSuccess(false);
                    }, 2000);
                  } catch (error) {
                    console.error("Lỗi chi tiết khi cập nhật:", error);
                    alert("Không thể cập nhật thông tin cá nhân. Vui lòng thử lại sau.");
                  } finally {
                    setIsUpdating(false);
                  }
                }}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa email */}
      {showEmailModal && (
        <div className="fixed inset-0 z-40 overflow-auto flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-25" onClick={() => setShowEmailModal(false)}></div>
          <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-lg border border-gray-200 z-50 mx-auto my-8">
            <h3 className="text-xl font-semibold mb-4">Đổi địa chỉ email</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email hiện tại</label>
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email mới</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại (để xác thực)</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => setShowEmailModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 