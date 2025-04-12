import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface DashboardStats {
  totalUsers: number;
  totalCities: number;
  totalMeasurements: number;
  totalAlerts: number;
}

export interface Alert {
  city: string;
  aqi: number;
  level: string;
  time: string;
  createdAt: Date;
  temperature?: number;
  humidity?: number;
  pollutant?: string;
  recommendation?: string;
}

export interface CityRanking {
  name: string;
  aqi: number;
  status: string;
  change: string;
}

// Định nghĩa kiểu dữ liệu
export interface RankingItem {
  name: string;
  aqi: number;
  status: string;
  change: string;
  lastUpdated?: string;
}

export interface AlertItem {
  cityName: string;
  aqi: number;
  level: string;
  time: string;
  temperature?: number;
  humidity?: number;
  pollutant?: string;
  recommendation?: string;
}

export class DashboardService {
  /**
   * Tiện ích: Gọi API với xử lý lỗi và retry
   */
  private async fetchWithErrorHandling(url: string, retries = 3, timeout = 30000) {
    let attemptCount = 0;
    
    while (attemptCount < retries) {
      // Tạo một AbortController mới cho mỗi request
      const controller = new AbortController();
      
      try {
        console.log(`Đang gọi API ${url} (lần thử ${attemptCount + 1}/${retries})`);
        
        // Đặt timeout lớn hơn cho các yêu cầu quan trọng
        const adjustedTimeout = timeout + (attemptCount * 10000); // Tăng timeout mỗi lần thử
        
        // Sử dụng AbortController để có thể hủy request khi cần
        return await axios.get(url, {
          timeout: adjustedTimeout,
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
          validateStatus: function (status) {
            return status < 500; // Chấp nhận status code < 500
          }
        });
      } catch (error) {
        attemptCount++;
        console.error(`Lỗi khi gọi API ${url} (lần thử ${attemptCount}/${retries}):`, error);
        
        // Nếu là lỗi timeout và còn cơ hội thử lại
        if (attemptCount < retries) {
          console.log(`Đang thử lại sau ${attemptCount} giây...`);
          await new Promise(resolve => setTimeout(resolve, attemptCount * 1000)); // Đợi nhiều hơn mỗi lần retry
        } else {
          console.error(`Đã thử ${retries} lần nhưng vẫn thất bại khi gọi ${url}`);
          return null;
        }
      }
    }
    
    return null;
  }

  /**
   * Tiện ích: Chuyển đổi thời gian thành chuỗi "X phút/giờ/ngày trước"
   */
  private getTimeAgo(timestamp: string): string {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Các khoảng thời gian tính bằng giây
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    
    // Xác định khoảng thời gian phù hợp
    if (seconds < minute) {
      return 'vừa xong';
    } else if (seconds < hour) {
      const minutes = Math.floor(seconds / minute);
      return `${minutes} phút trước`;
    } else if (seconds < day) {
      const hours = Math.floor(seconds / hour);
      return `${hours} giờ trước`;
    } else if (seconds < month) {
      const days = Math.floor(seconds / day);
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  }

  /**
   * Xác định trạng thái dựa trên chỉ số AQI
   */
  private getAQIStatus(aqi: number): string {
    if (aqi > 300) return 'hazardous';
    if (aqi > 200) return 'very-unhealthy';
    if (aqi > 150) return 'unhealthy';
    if (aqi > 100) return 'unhealthy-sensitive';
    if (aqi > 50) return 'moderate';
    return 'good';
  }

  /**
   * Lấy thống kê tổng quan cho dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('Đang lấy thống kê dashboard từ DB');
      
      // Thực hiện các yêu cầu tuần tự để tránh cạnh tranh tài nguyên
      console.log('Bắt đầu lấy dữ liệu người dùng...');
      const userStats = await this.fetchWithErrorHandling(`${API_URL}/auth/users`, 3, 60000);
      
      console.log('Bắt đầu lấy dữ liệu thành phố...');
      const cityStats = await this.fetchWithErrorHandling(`${API_URL}/weather/cities`, 3, 60000);
      
      console.log('Bắt đầu lấy dữ liệu thống kê thời tiết...');
      const weatherStats = await this.fetchWithErrorHandling(`${API_URL}/weather/stats`, 3, 60000);
      
      // Xử lý dữ liệu từ API users
      let totalUsers = 0;
      if (userStats && userStats.data && userStats.data.data) {
        console.log('Dữ liệu người dùng từ DB:', userStats.data);
        totalUsers = userStats.data.data.length || 0;
      } else {
        console.error('Không thể lấy dữ liệu người dùng từ DB');
        totalUsers = 0;
      }
      
      // Xử lý dữ liệu từ API cities
      let totalCities = 0;
      if (cityStats && cityStats.data) {
        console.log('Dữ liệu thành phố từ DB:', cityStats.data);
        totalCities = Array.isArray(cityStats.data) ? cityStats.data.length : 0;
        console.log(`Tổng số thành phố: ${totalCities}`);
      } else {
        console.error('Không thể lấy dữ liệu thành phố từ DB');
        totalCities = 0;
      }
      
      // Xử lý dữ liệu từ API weather/stats
      let totalMeasurements = 0;
      let totalAlerts = 0;
      if (weatherStats && weatherStats.data) {
        console.log('Dữ liệu thống kê thời tiết từ DB:', weatherStats.data);
        totalMeasurements = weatherStats.data.totalMeasurements || 0;
        totalAlerts = weatherStats.data.alerts?.length || 0;
      } else {
        console.error('Không thể lấy dữ liệu thống kê thời tiết từ DB');
        totalMeasurements = 0;
        totalAlerts = 0;
      }
      
      // Trả về dữ liệu từ DB
      return {
        totalUsers,
        totalCities,
        totalMeasurements,
        totalAlerts
      };
    } catch (error) {
      console.error('Lỗi tổng thể khi lấy thống kê dashboard:', error);
      // Trả về dữ liệu trống khi có lỗi
      return {
        totalUsers: 0,
        totalCities: 0,
        totalMeasurements: 0,
        totalAlerts: 0
      };
    }
  }

  /**
   * Lấy danh sách cảnh báo gần đây - chỉ sử dụng dữ liệu thật từ DB
   * @param limit Số lượng cảnh báo cần lấy, mặc định là 0 (lấy tất cả)
   */
  async getRecentAlerts(limit: number = 0): Promise<Alert[]> {
    try {
      const apiLimit = limit > 0 ? limit : 100; // Nếu limit = 0, lấy tối đa 100 cảnh báo
      console.log(`Đang lấy dữ liệu cảnh báo từ DB: ${API_URL}/weather/alerts?limit=${apiLimit}`);
      
      // Gọi API alerts với timeout cao để đảm bảo nhận được dữ liệu
      const response = await this.fetchWithErrorHandling(`${API_URL}/weather/alerts?limit=${apiLimit}`, 3, 60000);
      
      if (response && response.data && Array.isArray(response.data)) {
        console.log('Dữ liệu cảnh báo từ API thành công:', response.data);
        
        if (response.data.length === 0) {
          console.log('Không có dữ liệu cảnh báo từ DB');
          return [];
        }
        
        // Xử lý dữ liệu cảnh báo từ API theo tiêu chuẩn IQAir
        const alerts = response.data.map((alert: AlertItem) => {
          // Xác định mức độ cảnh báo dựa trên AQI theo chuẩn IQAir chính xác
          let level = 'good';
          const aqi = alert.aqi || 0;
          
          if (aqi > 300) level = 'hazardous';
          else if (aqi > 200) level = 'very-unhealthy';
          else if (aqi > 150) level = 'unhealthy';
          else if (aqi > 100) level = 'unhealthy-sensitive';
          else if (aqi > 50) level = 'moderate';
          
          // Tạo thông tin cảnh báo
          const alertInfo: Alert = {
            city: alert.cityName,
            aqi: aqi,
            level: level, // Luôn sử dụng level được tính toán theo IQAir
            time: this.getTimeAgo(alert.time),
            createdAt: new Date(alert.time)
          };
          
          // Thêm các thông tin bổ sung nếu có
          if (alert.temperature !== undefined) {
            alertInfo.temperature = alert.temperature;
          }
          
          if (alert.humidity !== undefined) {
            alertInfo.humidity = alert.humidity;
          }
          
          if (alert.pollutant) {
            alertInfo.pollutant = alert.pollutant;
          }
          
          if (alert.recommendation) {
            alertInfo.recommendation = alert.recommendation;
          }
          
          return alertInfo;
        });
        
        // Sắp xếp theo thời gian gần nhất
        alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        // Trả về số lượng cảnh báo theo limit nếu limit > 0
        return limit > 0 ? alerts.slice(0, limit) : alerts;
      }
      
      console.log('Không nhận được dữ liệu hợp lệ từ API cảnh báo');
      return [];
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu cảnh báo:', error);
      return [];
    }
  }

  /**
   * Lấy bảng xếp hạng thành phố theo chất lượng không khí - chỉ sử dụng dữ liệu thật
   * @param limit Số lượng thành phố cần lấy, mặc định là 0 (lấy tất cả)
   */
  async getCityRanking(limit: number = 0): Promise<CityRanking[]> {
    try {
      console.log(`Đang lấy danh sách tất cả thành phố từ DB`);
      
      // Gọi API để lấy danh sách tất cả thành phố thực tế trong DB
      const citiesResponse = await this.fetchWithErrorHandling(`${API_URL}/weather/cities`, 3, 60000);
      
      if (!citiesResponse || !citiesResponse.data || !Array.isArray(citiesResponse.data)) {
        console.warn('Không thể lấy danh sách thành phố từ DB');
        return [];
      }
      
      // Số lượng thành phố thực tế trong DB
      const totalCities = citiesResponse.data.length;
      console.log(`Tổng số thành phố trong DB: ${totalCities}`);
      
      // Nếu limit <= 0, gửi yêu cầu lấy tất cả thành phố
      // Nếu limit > 0 nhưng lớn hơn tổng số thành phố, lấy tất cả thành phố
      const apiLimit = (limit <= 0 || limit > totalCities) ? totalCities : limit;
      
      console.log(`Đang lấy dữ liệu xếp hạng AQI từ DB với limit: ${apiLimit}`);
      
      // Gọi API ranking với đúng số lượng thành phố từ DB
      const response = await axios.get(`${API_URL}/weather/ranking`, {
        params: { limit: apiLimit },
        timeout: 60000
      });
      
      if (response.data && Array.isArray(response.data)) {
        if (response.data.length === 0) {
          console.warn('Không có dữ liệu xếp hạng từ DB');
          return [];
        }
        
        console.log(`Đã nhận được dữ liệu của ${response.data.length} thành phố từ API`);
        
        // Sắp xếp thành phố theo AQI giảm dần
        const sortedData = [...response.data].sort((a, b) => b.aqi - a.aqi);
        
        // Tạo danh sách xếp hạng với các thông tin bổ sung theo tiêu chuẩn IQAir
        const results = sortedData.map((item) => {
          try {
            const aqi = Math.round(item.aqi || 0);
            
            // Xác định xu hướng (up/down) dựa trên sự thay đổi AQI
            let change = 'flat';
            
            if (item.previousAqi && item.aqi) {
              const diff = item.aqi - item.previousAqi;
              if (diff > 5) change = 'up';
              else if (diff < -5) change = 'down';
            }
            
            return {
              name: item.cityName,
              aqi: aqi,
              status: this.getAQIStatus(aqi),
              change
            };
          } catch (e) {
            console.warn(`Lỗi khi tính toán giá trị thay đổi cho ${item.cityName}:`, e);
            return {
              name: item.cityName,
              aqi: Math.round(item.aqi || 0),
              status: this.getAQIStatus(item.aqi || 0),
              change: 'flat'
            };
          }
        });
        
        // Trả về số lượng thành phố đúng với số trong DB
        return results;
      } else {
        console.warn('Định dạng dữ liệu không hợp lệ từ API');
        return [];
      }
    } catch (error) {
      console.error('Lỗi khi lấy xếp hạng thành phố:', error);
      return [];
    }
  }
}

export const dashboardService = new DashboardService(); 