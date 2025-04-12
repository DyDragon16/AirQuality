import mongoose, { Schema, Document } from "mongoose";
import env from "../config/env";

// Interface cho dữ liệu thời tiết
export interface IWeatherRecord extends Document {
	cityId: string;
	cityName: string;
	timestamp: Date;
	aqi: number;
	temperature: number;
	humidity: number;
	pressure: number;
	windSpeed: number;
	windDirection: number;
	condition: string;
	mainPollutant: string;
	pollutants: Array<{ name: string; value: number }>;
	coordinates: {
		latitude: number;
		longitude: number;
	};
	isCompressed?: boolean; // Đánh dấu bản ghi đã nén
	compressedFromCount?: number; // Số bản ghi gốc được nén thành bản ghi này
	isSyncedToTimescale?: boolean; // Đánh dấu đã đồng bộ sang TimescaleDB
	syncedAt?: Date; // Thời điểm đồng bộ
	createdAt: Date;
}

// Schema cho dữ liệu thời tiết
const weatherRecordSchema = new Schema<IWeatherRecord>(
	{
		cityId: {
			type: String,
			required: true,
			index: true,
		},
		cityName: {
			type: String,
			required: true,
		},
		timestamp: {
			type: Date,
			required: true,
			index: true,
		},
		aqi: {
			type: Number,
			default: 0,
		},
		temperature: {
			type: Number,
			default: 0,
		},
		humidity: {
			type: Number,
			default: 0,
		},
		pressure: {
			type: Number,
			default: 0,
		},
		windSpeed: {
			type: Number,
			default: 0,
		},
		windDirection: {
			type: Number,
			default: 0,
		},
		condition: {
			type: String,
			default: "",
		},
		mainPollutant: {
			type: String,
			default: "",
		},
		pollutants: [
			{
				name: String,
				value: Number,
			},
		],
		coordinates: {
			latitude: {
				type: Number,
				default: 0,
			},
			longitude: {
				type: Number,
				default: 0,
			},
		},
		isCompressed: {
			type: Boolean,
			default: false,
		},
		compressedFromCount: {
			type: Number,
		},
		isSyncedToTimescale: {
			type: Boolean,
			default: false,
			index: true, // Index cho truy vấn lọc bản ghi chưa được đồng bộ
		},
		syncedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

// Tạo index phức hợp cho cityId + timestamp
weatherRecordSchema.index({ cityId: 1, timestamp: -1 });

// Tạo index phức hợp cho truy vấn thống kê
weatherRecordSchema.index({ timestamp: -1, aqi: 1 });
weatherRecordSchema.index({ timestamp: -1, temperature: 1 });

// Tạo index TTL dựa trên createdAt để tự động xóa dữ liệu cũ
// Tính thời gian sống từ biến môi trường, mặc định là 30 ngày
const ttlDays = parseInt(process.env.MONGODB_WEATHER_TTL_DAYS || "30");
weatherRecordSchema.index({ createdAt: 1 }, { expireAfterSeconds: ttlDays * 24 * 60 * 60 });

// Tạo index theo timestamp và isCompressed cho việc nén dữ liệu
weatherRecordSchema.index({ timestamp: 1, isCompressed: 1 });

// Pre-save hook để đảm bảo timestamp luôn được làm tròn đến phút
weatherRecordSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('timestamp')) {
    // Làm tròn timestamp đến phút để giảm độ chính xác không cần thiết
    const timestamp = new Date(this.timestamp);
    timestamp.setSeconds(0);
    timestamp.setMilliseconds(0);
    this.timestamp = timestamp;
  }
  next();
});

// Export model
export const WeatherRecord = mongoose.model<IWeatherRecord>(
	"WeatherRecord",
	weatherRecordSchema
);
