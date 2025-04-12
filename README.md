# AirQuality - Hệ Thống Theo Dõi Chất Lượng Không Khí

AirQuality là một hệ thống web giúp theo dõi thông tin về chất lượng không khí của các thành phố lớn tại Việt Nam theo thời gian thực. Dự án được xây dựng bằng Node.js với kiến trúc Full Stack hiện đại.

## 🌟 Tính Năng Chính

- Theo dõi chất lượng không khí theo thời gian thực
- Hiển thị chỉ số AQI và các thông số môi trường
- Cảnh báo khi chất lượng không khí ở mức nguy hiểm
- Dashboard quản trị với các thống kê chi tiết
- Quản lý người dùng và thành phố
- Giao diện responsive, thân thiện với người dùng

## 🏗️ Cấu Trúc Dự Án

```
airquality/
├── frontend/                 # Frontend Next.js
│   ├── src/                 # Mã nguồn frontend
│   │   ├── app/            # Các trang và routes
│   │   ├── components/     # Các component tái sử dụng
│   │   ├── services/       # Các service API
│   │   └── context/        # React context
│   ├── public/             # Tài nguyên tĩnh
│   └── tests/              # Test frontend
│
├── backend/                 # Backend Node.js
│   ├── src/                # Mã nguồn backend
│   │   ├── controllers/    # Xử lý request
│   │   ├── models/         # Schema database
│   │   ├── routes/         # API routes
│   │   └── services/       # Business logic
│   ├── logs/               # Log files
│   └── data/               # Dữ liệu tĩnh
│
└── test-results/           # Kết quả test
```

## 🚀 Cài Đặt và Chạy

### Yêu Cầu Hệ Thống

- Node.js >= 16.x
- MongoDB >= 4.x
- npm hoặc yarn

### Cài Đặt

1. Clone repository:
```bash
git clone https://github.com/your-username/airquality.git
cd airquality
```

2. Cài đặt dependencies cho backend:
```bash
cd backend
npm install
```

3. Cài đặt dependencies cho frontend:
```bash
cd ../frontend
npm install
```

4. Tạo file .env cho backend (dựa vào .env.example):
```bash
cp .env.example .env
```

5. Tạo file .env cho frontend (dựa vào .env.example):
```bash
cp .env.example .env
```

### Chạy Ứng Dụng

1. Khởi động backend:
```bash
cd backend
npm start
```

2. Khởi động frontend:
```bash
cd frontend
npm run dev
```

3. Truy cập ứng dụng:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 📊 Dashboard Admin

### Quản Lý Người Dùng
- Xem danh sách người dùng
- Thêm/sửa/xóa người dùng
- Phân quyền người dùng
- Quản lý trạng thái tài khoản

### Quản Lý Thành Phố
- Thêm/sửa/xóa thành phố
- Cập nhật thông tin chất lượng không khí
- Quản lý trạm đo
- Xem lịch sử dữ liệu

### Thống Kê
- Tổng số người dùng
- Tổng số thành phố
- Số lượng cảnh báo
- Biểu đồ và báo cáo

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- React Query
- Chart.js

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

## 🤝 Đóng Góp

Chúng tôi rất hoan nghênh các đóng góp từ cộng đồng. Để đóng góp:

1. Fork repository
2. Tạo branch mới:
```bash
git checkout -b feature/your-feature-name
```

3. Commit các thay đổi:
```bash
git commit -m 'Add some feature'
```

4. Push lên branch:
```bash
git push origin feature/your-feature-name
```

5. Tạo Pull Request

## 📝 Giấy Phép

Dự án được phát triển dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Liên Hệ

- Email: your-email@example.com
- Website: https://airquality.example.com 