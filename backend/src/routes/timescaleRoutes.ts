import express from "express";
import timescaleController from "../controllers/timescaleController";
import { authenticateUser, checkAdminRole } from "../middleware/authMiddleware";

const router = express.Router();

// Route kiểm tra kết nối
router.get(
	"/status",
	authenticateUser,
	checkAdminRole,
	timescaleController.checkConnection
);

// Route khởi tạo database
router.post(
	"/initialize",
	authenticateUser,
	checkAdminRole,
	timescaleController.initializeDatabase
);

// Route lấy lịch sử thời tiết
router.get(
	"/history/:cityId",
	authenticateUser,
	timescaleController.getWeatherHistory
);

// Route lấy xếp hạng AQI
router.get("/aqi-ranking", timescaleController.getAQIRanking);

export default router;
