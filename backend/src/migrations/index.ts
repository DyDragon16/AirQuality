import syncCitiesToDB from './syncCitiesToDB';

/**
 * Chạy tất cả các migrations
 */
async function runMigrations() {
  console.log('🚀 Bắt đầu chạy migrations...');
  
  try {
    // Đồng bộ thành phố vào MongoDB
    console.log('📍 Đồng bộ dữ liệu thành phố vào MongoDB...');
    const result = await syncCitiesToDB();
    console.log(`✅ Đồng bộ thành công: Đã thêm ${result.added} thành phố và cập nhật ${result.updated} thành phố`);
    
    console.log('✅ Tất cả migrations đã chạy thành công!');
  } catch (error) {
    console.error('❌ Migrations thất bại:', error);
    process.exit(1);
  }
}

// Chạy migrations nếu file được thực thi trực tiếp
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('👋 Hoàn tất migrations');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Lỗi khi chạy migrations:', error);
      process.exit(1);
    });
}

export default runMigrations; 