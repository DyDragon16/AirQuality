"use client";

import { useAuthContext } from "@/context/AuthContext";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

/**
 * Component hiển thị các modal thông báo liên quan đến xác thực
 */
export const AuthModals = () => {
  const { 
    isAccountDeleted,
    isAccountSuspended,
    isRoleChanged,
    hideAccountDeletedModal,
    hideAccountSuspendedModal,
    hideRoleChangedModal
  } = useAuthContext();
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  // Chuyển hướng đến trang đăng nhập khi đóng modal
  const handleClose = useCallback((hideFunction: () => void) => {
    hideFunction();
    router.push("/login");
  }, [router]);

  // Tự động đếm ngược và chuyển hướng đến trang đăng nhập nếu có modal nào hiển thị
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let redirectTimeoutId: NodeJS.Timeout;
    
    if (isAccountDeleted || isAccountSuspended || isRoleChanged) {
      // Reset countdown khi modal hiển thị
      setCountdown(10);
      
      // Tạo interval để đếm ngược từ 10 xuống 0
      intervalId = setInterval(() => {
        setCountdown((prevCount) => {
          const newCount = prevCount - 1;
          if (newCount <= 0) {
            clearInterval(intervalId);
            return 0;
          }
          return newCount;
        });
      }, 1000);

      // Tạo timeout riêng cho việc chuyển hướng
      redirectTimeoutId = setTimeout(() => {
        const hideFunction = isAccountDeleted 
          ? hideAccountDeletedModal 
          : isAccountSuspended 
            ? hideAccountSuspendedModal 
            : hideRoleChangedModal;
        
        handleClose(hideFunction);
      }, 10000);
    }
    
    // Cleanup interval và timeout khi component unmount hoặc dependencies thay đổi
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (redirectTimeoutId) clearTimeout(redirectTimeoutId);
    };
  }, [isAccountDeleted, isAccountSuspended, isRoleChanged, router, handleClose, hideAccountDeletedModal, hideAccountSuspendedModal, hideRoleChangedModal]);

  if (!isAccountDeleted && !isAccountSuspended && !isRoleChanged) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative bg-white rounded-lg p-8 max-w-md w-full animate-bounce-once">
        <button
          onClick={() => {
            if (isAccountDeleted) handleClose(hideAccountDeletedModal);
            else if (isAccountSuspended) handleClose(hideAccountSuspendedModal);
            else if (isRoleChanged) handleClose(hideRoleChangedModal);
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        {isAccountDeleted && (
          <>
            <div className="mb-4 text-red-600 text-5xl text-center">⚠️</div>
            <h2 className="text-2xl font-bold mb-4 text-center text-red-600">Tài khoản đã bị xóa</h2>
            <p className="mb-4 text-gray-600 text-center">
              Tài khoản của bạn đã bị xóa khỏi hệ thống. Vui lòng liên hệ với quản trị viên để biết thêm thông tin.
            </p>
          </>
        )}

        {isAccountSuspended && (
          <>
            <div className="mb-4 text-orange-500 text-5xl text-center">🔒</div>
            <h2 className="text-2xl font-bold mb-4 text-center text-orange-500">Tài khoản tạm ngưng</h2>
            <p className="mb-6 text-gray-600 text-center">
              Tài khoản của bạn đã bị tạm ngưng bởi quản trị viên. Vui lòng liên hệ quản trị viên để biết thêm thông tin hoặc yêu cầu mở lại tài khoản.
            </p>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 mb-6">
              <p className="text-sm text-orange-700">
                Bạn đã bị đăng xuất tự động và không thể tiếp tục sử dụng ứng dụng cho đến khi tài khoản được kích hoạt lại.
              </p>
            </div>
          </>
        )}

        {isRoleChanged && (
          <>
            <div className="mb-4 text-blue-500 text-5xl text-center">🔄</div>
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-500">Vai trò đã thay đổi</h2>
            <p className="mb-4 text-gray-600 text-center">
              Vai trò của bạn trong hệ thống đã được thay đổi. Vui lòng đăng nhập lại để tiếp tục.
            </p>
          </>
        )}
{/* 
        <div className="flex justify-center">
          <button
            onClick={() => {
              if (isAccountDeleted) handleClose(hideAccountDeletedModal);
              else if (isAccountSuspended) handleClose(hideAccountSuspendedModal);
              else if (isRoleChanged) handleClose(hideRoleChangedModal);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Đến trang đăng nhập
          </button>
        </div> */}
        
        <div className="mt-4 text-center text-sm text-gray-500">
          Tự động chuyển hướng sau {countdown} giây...
        </div>
      </div>
    </div>
  );
}; 