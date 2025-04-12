import { logInfo, logError } from '../utils/logger';

/**
 * Interface cho một mục cache
 */
interface CacheItem {
  data: any;
  expiresAt: number;
}

/**
 * Service quản lý cache cho dữ liệu thời tiết
 */
class WeatherCacheService {
  private cache: Map<string, CacheItem>;
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // Mặc định 30 phút

  constructor() {
    this.cache = new Map<string, CacheItem>();
    logInfo('WeatherCacheService khởi tạo');
    
    // Đặt bộ hẹn giờ để dọn dẹp cache cũ
    setInterval(() => this.cleanupExpiredCache(), 15 * 60 * 1000); // 15 phút
  }

  /**
   * Lưu dữ liệu vào cache
   * @param key Khóa 
   * @param data Dữ liệu cần lưu
   * @param ttlMinutes Thời gian sống của cache tính bằng phút
   */
  async set(key: string, data: any, ttlMinutes?: number): Promise<void> {
    try {
      const ttlMs = (ttlMinutes || 30) * 60 * 1000; // Mặc định 30 phút
      const expiresAt = Date.now() + ttlMs;
      
      this.cache.set(key, {
        data,
        expiresAt
      });
      
      logInfo(`Đã lưu dữ liệu vào cache với key: ${key}`);
    } catch (error) {
      logError(`Lỗi khi lưu dữ liệu vào cache với key ${key}:`, error);
    }
  }

  /**
   * Lấy dữ liệu từ cache
   * @param key Khóa
   * @returns Dữ liệu được lưu trong cache hoặc null nếu không tìm thấy
   */
  async get(key: string): Promise<any | null> {
    try {
      const cacheItem = this.cache.get(key);
      
      if (!cacheItem) {
        return null;
      }
      
      // Kiểm tra hạn sử dụng
      if (cacheItem.expiresAt < Date.now()) {
        // Cache đã hết hạn, xóa và trả về null
        this.cache.delete(key);
        return null;
      }
      
      return cacheItem.data;
    } catch (error) {
      logError(`Lỗi khi lấy dữ liệu từ cache với key ${key}:`, error);
      return null;
    }
  }

  /**
   * Xóa một mục khỏi cache
   * @param key Khóa của mục cần xóa
   */
  async delete(key: string): Promise<void> {
    try {
      this.cache.delete(key);
      logInfo(`Đã xóa dữ liệu khỏi cache với key: ${key}`);
    } catch (error) {
      logError(`Lỗi khi xóa dữ liệu từ cache với key ${key}:`, error);
    }
  }

  /**
   * Dọn dẹp các mục cache đã hết hạn
   */
  private cleanupExpiredCache(): void {
    try {
      const now = Date.now();
      let expiredCount = 0;
      
      for (const [key, item] of this.cache.entries()) {
        if (item.expiresAt < now) {
          this.cache.delete(key);
          expiredCount++;
        }
      }
      
      if (expiredCount > 0) {
        logInfo(`Đã xóa ${expiredCount} mục cache hết hạn`);
      }
    } catch (error) {
      logError('Lỗi khi dọn dẹp cache:', error);
    }
  }

  /**
   * Xóa tất cả cache
   */
  async clearCache(): Promise<void> {
    try {
      const count = this.cache.size;
      this.cache.clear();
      logInfo(`Đã xóa tất cả ${count} mục trong cache`);
    } catch (error) {
      logError('Lỗi khi xóa toàn bộ cache:', error);
    }
  }

  /**
   * Lấy số lượng mục trong cache
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Tạo một instance duy nhất của service
export const weatherCacheService = new WeatherCacheService();
