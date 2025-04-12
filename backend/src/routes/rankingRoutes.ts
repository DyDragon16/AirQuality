import { Router } from "express";
import rankingController from "../controllers/rankingController";

const router = Router();

/**
 * @route   GET /api/ranking/aqi
 * @desc    Lấy ranking AQI của các thành phố
 * @access  Public
 */
router.get("/aqi", rankingController.getAQIRanking);

/**
 * @route   GET /api/ranking/temperature
 * @desc    Lấy ranking nhiệt độ của các thành phố
 * @access  Public
 */
router.get("/temperature", rankingController.getTemperatureRanking);

/**
 * @route   POST /api/ranking/update-data
 * @desc    Cập nhật dữ liệu thời tiết cho tất cả các thành phố
 * @access  Public (có thể thêm auth middleware nếu cần)
 */
router.post("/update-data", rankingController.updateAllWeatherData);

export default router;
