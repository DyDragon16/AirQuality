import { Router } from 'express';
import { cityDataService } from '../services/cityDataService';

const router = Router();

// SSE endpoint để nhận updates realtime
router.get('/updates', (req, res) => {
  // Thiết lập headers cho SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Gửi heartbeat để giữ kết nối
  const heartbeat = setInterval(() => {
    res.write('event: heartbeat\ndata: ping\n\n');
  }, 30000);

  // Xử lý khi có dữ liệu mới
  const onDataUpdated = (data: any) => {
    res.write(`event: update\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Xử lý khi một thành phố được cập nhật
  const onCityUpdated = (data: any) => {
    res.write(`event: cityUpdate\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Đăng ký listeners
  cityDataService.on('dataUpdated', onDataUpdated);
  cityDataService.on('cityUpdated', onCityUpdated);

  // Gửi dữ liệu hiện tại ngay khi kết nối
  cityDataService.getCities().then(cities => {
    res.write(`event: initial\ndata: ${JSON.stringify(cities)}\n\n`);
  });

  // Cleanup khi client ngắt kết nối
  req.on('close', () => {
    clearInterval(heartbeat);
    cityDataService.removeListener('dataUpdated', onDataUpdated);
    cityDataService.removeListener('cityUpdated', onCityUpdated);
  });
});

export default router; 