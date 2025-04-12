import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { JwtPayload } from '../types/auth';
import { Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Không mở rộng interface trong middleware này, sử dụng as any để tránh xung đột

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lấy token từ header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Không có token xác thực' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Tìm user với id từ token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }
    
    // Thêm thông tin người dùng vào request
    (req as any).user = {
      userId: user._id instanceof Types.ObjectId ? user._id.toString() : String(user._id),
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
}; 