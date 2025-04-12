import { Router } from "express";
import weatherController from "../controllers/weatherController";

const router = Router();

/**
 * @route   GET /api/weather/stats
 * @desc    Lấy thống kê tổng quan về dữ liệu thời tiết
 * @access  Public
 */
router.get("/stats", weatherController.getWeatherStats);

/**
 * @route   GET /api/weather/ranking
 * @desc    Lấy bảng xếp hạng thành phố theo chất lượng không khí
 * @access  Public
 * @param   limit Số lượng thành phố trả về (mặc định 10)
 * @param   sort Sắp xếp theo thứ tự tăng/giảm (asc/desc)
 */
router.get("/ranking", weatherController.getAQIRanking);

/**
 * @route   GET /api/weather/alerts
 * @desc    Lấy danh sách cảnh báo chất lượng không khí
 * @access  Public
 * @param   limit Số lượng cảnh báo trả về (mặc định 5)
 */
router.get("/alerts", weatherController.getAirQualityAlerts);

/**
 * @route   GET /api/weather/cities
 * @desc    Lấy danh sách tất cả các thành phố
 * @access  Public
 */
router.get("/cities", weatherController.getAllCities);

/**
 * @route   GET /api/weather/cities/:cityId
 * @desc    Lấy thông tin thời tiết dựa trên ID thành phố
 * @access  Public
 */
router.get("/cities/:cityId", weatherController.getWeatherByCityId);

/**
 * @route   GET /api/weather/history/:cityId
 * @desc    Lấy lịch sử thời tiết của một thành phố
 * @access  Public
 * @param   days Số ngày lấy dữ liệu (mặc định 7, tối đa 30)
 */
router.get("/history/:cityId", weatherController.getWeatherHistory);

/**
 * @route   POST /api/weather/update
 * @desc    Cập nhật dữ liệu thời tiết cho tất cả các thành phố
 * @access  Public
 */
router.post("/update", weatherController.updateAllCitiesData);

/**
 * @route   POST /api/weather/cleanup
 * @desc    Dọn dẹp dữ liệu thời tiết cũ
 * @access  Public
 * @param   days Số ngày dữ liệu sẽ được giữ lại (mặc định 30 ngày)
 */
router.post("/cleanup", weatherController.cleanupOldWeatherData);

/**
 * @route   POST /api/weather/compress
 * @desc    Nén dữ liệu thời tiết cũ để tiết kiệm dung lượng nhưng vẫn giữ lịch sử
 * @access  Public
 * @param   days Nén dữ liệu cũ hơn số ngày được chỉ định (mặc định 7 ngày)
 * @param   interval Khoảng thời gian để gộp dữ liệu, tính bằng giờ (mặc định 3 giờ)
 */
router.post("/compress", weatherController.compressWeatherData);

/**
 * @route   GET /api/hochiminh, /api/hanoi, /api/danang
 * @desc    Lấy thông tin thời tiết dựa trên ID thành phố
 * @access  Public
 */
router.get("/:cityId", weatherController.getWeatherByCityId);

export default router;
