import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';
import { Types } from 'mongoose';
import { logError, logInfo, logWarning } from '../utils/logger';

// Kiểm tra biến môi trường bắt buộc
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET phải được cấu hình trong file .env');
}

// Cấu hình Passport với Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
      scope: ['profile', 'email'],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Tìm user hiện có theo email từ Google
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(new Error('Không thể lấy email từ tài khoản Google'), undefined);
        }
        
        const existingUser = await User.findOne({ email });

        // Nếu user đã tồn tại, kiểm tra trạng thái
        if (existingUser) {
          // Kiểm tra nếu tài khoản bị khóa
          if (existingUser.status === "inactive") {
            logWarning(`Người dùng bị khóa cố gắng đăng nhập qua Google: ${email}`);
            return done(null, false, { message: 'account_suspended' });
          }
          
          logInfo(`Người dùng đăng nhập qua Google: ${existingUser.email}`);
          return done(null, existingUser);
        }

        // Tạo user mới nếu chưa tồn tại
        const newUser = new User({
          email,
          firstName: profile.name?.givenName || profile.displayName,
          lastName: profile.name?.familyName || '',
          // Tạo mật khẩu ngẫu nhiên cho user từ Google
          password: Math.random().toString(36).slice(-12),
          googleId: profile.id,
          status: 'active', // Mặc định trạng thái là active cho người dùng mới
        });

        await newUser.save();
        logInfo(`Người dùng mới đăng ký qua Google: ${newUser.email}`);
        
        return done(null, newUser);
      } catch (error) {
        logError('Lỗi đăng nhập qua Google:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialize user vào session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user từ session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport; 