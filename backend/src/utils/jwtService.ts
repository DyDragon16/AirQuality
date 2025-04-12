import jwt from 'jsonwebtoken';
import { logError } from './logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DEFAULT_EXPIRES_IN = '1d';

/**
 * Tạo JWT token
 * @param payload Dữ liệu cần mã hóa trong token
 * @param expiresIn Thời gian hết hạn (mặc định: 1 ngày)
 * @returns Token đã tạo
 */
export const generateToken = (payload: any, expiresIn: string = DEFAULT_EXPIRES_IN): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Xác thực JWT token
 * @param token Token cần xác thực
 * @returns Kết quả xác thực (success: true/false, data: payload giải mã hoặc error: lỗi)
 */
export const verifyToken = (token: string): { success: boolean; data?: any; error?: Error } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { success: true, data: decoded };
  } catch (error) {
    logError('Lỗi khi xác thực token:', error);
    return { success: false, error: error as Error };
  }
};

/**
 * Giải mã JWT token mà không xác thực chữ ký
 * (Chỉ sử dụng cho mục đích debug, không dùng cho xác thực)
 * @param token Token cần giải mã
 * @returns Dữ liệu giải mã
 */
export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};
