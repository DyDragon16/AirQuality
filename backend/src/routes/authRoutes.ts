import express from "express";
import authController from "../controllers/authController";
import { authenticateUser } from "../middleware/authMiddleware";
import passport from "passport";
import { Router } from "express";

const router: Router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký người dùng mới
 * @access  Public
 */
router.post("/register", authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập
 * @access  Public
 */
router.post("/login", authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin người dùng hiện tại
 * @access  Private
 */
router.get("/me", authenticateUser, authController.getCurrentUser);

/**
 * @route   PUT /api/auth/profile
 * @desc    Cập nhật thông tin cá nhân người dùng
 * @access  Private
 */
router.put("/profile", authenticateUser, authController.updateProfile);

/**
 * @route   POST /api/auth/favorites/:cityId
 * @desc    Thêm thành phố vào danh sách yêu thích
 * @access  Private
 */
router.post("/favorites/:cityId", authenticateUser, authController.addFavorite);

/**
 * @route   DELETE /api/auth/favorites/:cityId
 * @desc    Xóa thành phố khỏi danh sách yêu thích
 * @access  Private
 */
router.delete(
	"/favorites/:cityId",
	authenticateUser,
	authController.removeFavorite
);

/**
 * @route   GET /api/auth/google
 * @desc    Bắt đầu quá trình đăng nhập Google
 * @access  Public
 */
router.get(
	"/google",
	passport.authenticate("google", {
		scope: ["profile", "email"],
		session: false,
	})
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Callback từ Google sau khi xác thực
 * @access  Public
 */
router.get(
	"/google/callback",
	(req, res, next) => {
		passport.authenticate('google', { session: false }, (err, user, info) => {
			const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
			
			// Xử lý lỗi không kết nối được với Google
			if (err) {
				return res.redirect(`${FRONTEND_URL}/login?error=auth_failed&auth_complete=true`);
			}
			
			// Xử lý khi tài khoản bị khóa
			if (!user) {
				if (info && info.message === 'account_suspended') {
					return res.redirect(`${FRONTEND_URL}/login?error=account_suspended&auth_complete=true`);
				}
				return res.redirect(`${FRONTEND_URL}/login?error=auth_failed&auth_complete=true`);
			}
			
			// Lưu thông tin user vào request
			req.user = user;
			next();
		})(req, res, next);
	},
	authController.googleAuthCallback
);

/**
 * @route   GET /api/auth/users
 * @desc    Lấy danh sách tất cả người dùng
 * @access  Admin
 */
router.get("/users", authController.getAllUsers);

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Xóa người dùng theo ID
 * @access  Admin
 */
router.delete("/users/:id", authController.deleteUser);

/**
 * @route   POST /api/auth/invite-user
 * @desc    Tạo người dùng mới và gửi email mời
 * @access  Admin (tạm thời mở public trong quá trình phát triển)
 */
router.post("/invite-user", authController.inviteUser);

/**
 * @route   PUT /api/auth/users/:id/role
 * @desc    Cập nhật vai trò của người dùng
 * @access  Admin
 */
router.put("/users/:id/role", authController.updateUserRole);

/**
 * @route   PUT /api/auth/users/:id/status
 * @desc    Cập nhật trạng thái của người dùng
 * @access  Admin
 */
router.put("/users/:id/status", authController.updateUserStatus);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Xác nhận email
 * @access  Public
 */
router.post("/verify-email", authController.verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Gửi lại email xác nhận
 * @access  Public
 */
router.post("/resend-verification", authController.resendVerificationEmail);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Quên mật khẩu
 * @access  Public
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @route   GET /api/auth/check-reset-token
 * @desc    Kiểm tra token reset password có hợp lệ không
 * @access  Public
 */
router.get("/check-reset-token", authController.checkResetToken);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Đặt lại mật khẩu bằng token
 * @access  Public
 */
router.post("/reset-password", authController.resetPassword);

/**
 * @route   GET /api/auth/check-account
 * @desc    Kiểm tra nếu tài khoản tồn tại
 * @access  Public
 */
router.get("/check-account", authController.checkAccountExists);

export default router;
