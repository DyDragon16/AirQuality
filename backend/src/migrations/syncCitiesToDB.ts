import mongoose from 'mongoose';
import { CITIES } from '../data/cities';
import dotenv from 'dotenv';
import { logError, logInfo } from '../utils/logger';

// Tải biến môi trường
dotenv.config();

// Lấy MongoDB URI từ biến môi trường
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/air-quality';

// Định nghĩa schema cho collection locations
const LocationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  aqi_station_id: { type: String, required: true },
  hidden: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Tạo hoặc lấy model
const Location = mongoose.model('Location', LocationSchema, 'locations');

/**
 * Đồng bộ dữ liệu từ cities.ts vào collection locations trong MongoDB
 */
async function syncCitiesToDB() {
  try {
    // Kết nối đến MongoDB
    await mongoose.connect(MONGODB_URI);
    logInfo('Đã kết nối đến MongoDB');

    logInfo(`Bắt đầu đồng bộ ${CITIES.length} thành phố vào database`);

    // Lấy danh sách các thành phố từ DB hiện tại để so sánh
    const existingCities = await Location.find({});
    logInfo(`Có ${existingCities.length} thành phố trong DB hiện tại`);

    // Đếm số lượng thành phố cần thêm và cập nhật
    let addedCount = 0;
    let updatedCount = 0;

    // Xử lý từng thành phố
    for (const city of CITIES) {
      // Kiểm tra xem thành phố đã tồn tại trong DB chưa
      const existingCity = await Location.findOne({ id: city.id });

      if (!existingCity) {
        // Thêm mới nếu chưa tồn tại
        const newCity = new Location({
          ...city,
          created_at: new Date(),
          updated_at: new Date()
        });
        await newCity.save();
        addedCount++;
        logInfo(`Đã thêm thành phố: ${city.name}`);
      } else {
        // Cập nhật nếu đã tồn tại
        await Location.updateOne(
          { id: city.id },
          {
            ...city,
            updated_at: new Date()
          }
        );
        updatedCount++;
        logInfo(`Đã cập nhật thành phố: ${city.name}`);
      }
    }

    logInfo(`Đồng bộ hoàn tất: Đã thêm ${addedCount} thành phố và cập nhật ${updatedCount} thành phố`);
    
    // Đóng kết nối
    await mongoose.disconnect();
    logInfo('Đã đóng kết nối MongoDB');
    
    return { added: addedCount, updated: updatedCount };
  } catch (error) {
    logError('Lỗi khi đồng bộ dữ liệu thành phố:', error);
    // Đảm bảo đóng kết nối ngay cả khi có lỗi
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    throw error;
  }
}

// Chạy migration nếu file được thực thi trực tiếp
if (require.main === module) {
  syncCitiesToDB()
    .then(result => {
      console.log(`Migration thành công! Đã thêm ${result.added} thành phố và cập nhật ${result.updated} thành phố`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration thất bại:', error);
      process.exit(1);
    });
}

export default syncCitiesToDB; 