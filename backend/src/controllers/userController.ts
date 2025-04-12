import { Request, Response } from 'express';
import { User } from '../models/User';
import { logError, logInfo } from '../utils/logger';

class UserController {
  /**
   * Lấy thông tin người dùng theo ID
   */
  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const user = await User.findById(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      logError('Lỗi khi lấy thông tin người dùng:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Cập nhật thông tin người dùng
   */
  async updateUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      
      // Loại bỏ các trường không được phép cập nhật
      const safeUpdateData = { ...updateData };
      delete safeUpdateData.password;
      delete safeUpdateData.email;
      delete safeUpdateData.isVerified;
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: safeUpdateData },
        { new: true }
      );
      
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: updatedUser
      });
    } catch (error) {
      logError('Lỗi khi cập nhật thông tin người dùng:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

export const userController = new UserController();
