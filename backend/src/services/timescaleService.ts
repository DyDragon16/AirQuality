import pgPromise from "pg-promise";
import timescaleConfig from "../config/timescale";
import { logInfo, logError } from "../utils/logger";
import env from "../config/env";
import NodeCache from "node-cache";

/**
 * Khởi tạo pg-promise với các tùy chỉnh
 */
const pgp = pgPromise({
	// Sự kiện kết nối
	connect(client: any) {
		logInfo("Đã kết nối đến TimescaleDB", {
			host: client.connectionParameters?.host || "unknown",
		});
	},
	// Sự kiện ngắt kết nối
	disconnect(client: any) {
		logInfo("Đã ngắt kết nối TimescaleDB", {
			host: client.connectionParameters?.host || "unknown",
		});
	},
	// Xử lý lỗi
	error(err, e) {
		logError("Lỗi TimescaleDB", err);
	},
});

// Khởi tạo đối tượng DB với cấu hình
const db = pgp(timescaleConfig);

// Cache thời gian ngắn (5 phút)
const shortTermCache = new NodeCache({ stdTTL: 300 });

/**
 * Service để tương tác với TimescaleDB
 */
class TimescaleService {
	/**
	 * Kiểm tra kết nối đến DB
	 */
	async testConnection(): Promise<boolean> {
		try {
			const result = await db.one("SELECT NOW() as current_time");
			logInfo("Kết nối TimescaleDB thành công", { time: result.current_time });
			return true;
		} catch (error) {
			logError("Kiểm tra kết nối TimescaleDB thất bại", error);
			return false;
		}
	}

	/**
	 * Tạo bảng lưu dữ liệu thời tiết nếu chưa tồn tại
	 */
	async initializeWeatherTable(): Promise<void> {
		try {
			// Tạo bảng weather_data
			await db.none(`
        CREATE TABLE IF NOT EXISTS weather_data (
          time TIMESTAMPTZ NOT NULL,
          city_id TEXT NOT NULL,
          city_name TEXT NOT NULL,
          aqi NUMERIC,
          temperature NUMERIC,
          humidity NUMERIC,
          pressure NUMERIC,
          wind_speed NUMERIC,
          wind_direction NUMERIC,
          condition TEXT,
          main_pollutant TEXT
        );
      `);

			// Chuyển đổi bảng thành hypertable
			await db.none(`
        SELECT create_hypertable('weather_data', 'time', if_not_exists => TRUE);
      `);

			// Tạo chỉ mục để tăng tốc truy vấn
			await db.none(`
        CREATE INDEX IF NOT EXISTS idx_weather_city_id ON weather_data (city_id);
        CREATE INDEX IF NOT EXISTS idx_weather_aqi ON weather_data (aqi);
      `);

			// Thiết lập chính sách lưu giữ dữ liệu
			await db.none(`
        SELECT add_retention_policy('weather_data', INTERVAL '${env.timescaleRetentionDays} days', if_not_exists => TRUE);
      `);

			logInfo("Đã khởi tạo bảng weather_data trong TimescaleDB");
		} catch (error) {
			logError("Lỗi khi khởi tạo bảng trong TimescaleDB", error);
			throw error;
		}
	}

	/**
	 * Lưu dữ liệu thời tiết vào TimescaleDB
	 */
	async saveWeatherData(weatherData: any): Promise<void> {
		try {
			const query = `
        INSERT INTO weather_data(
          time, city_id, city_name, aqi, temperature, humidity, 
          pressure, wind_speed, wind_direction, condition, main_pollutant
        ) VALUES(
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        );
      `;

			await db.none(query, [
				new Date(), // time
				weatherData.cityId,
				weatherData.cityName,
				weatherData.aqi || 0,
				weatherData.temperature || 0,
				weatherData.humidity || 0,
				weatherData.pressure || 0,
				weatherData.windSpeed || 0,
				weatherData.windDirection || 0,
				weatherData.condition || "",
				weatherData.mainPollutant || "",
			]);

			logInfo("Đã lưu dữ liệu thời tiết vào TimescaleDB", {
				cityId: weatherData.cityId,
				time: new Date().toISOString(),
			});
		} catch (error) {
			logError("Lỗi khi lưu dữ liệu thời tiết vào TimescaleDB", error);
			throw error;
		}
	}

	/**
	 * Lấy lịch sử dữ liệu thời tiết theo ID thành phố và số ngày
	 */
	async getWeatherHistory(cityId: string, days: number = 7): Promise<any[]> {
		try {
			const query = `
        SELECT 
          time_bucket('1 hour', time) AS interval,
          city_id,
          city_name,
          AVG(aqi) AS avg_aqi,
          MAX(aqi) AS max_aqi,
          MIN(aqi) AS min_aqi,
          AVG(temperature) AS avg_temperature,
          MAX(temperature) AS max_temperature,
          MIN(temperature) AS min_temperature,
          AVG(humidity) AS avg_humidity,
          MAX(wind_speed) AS max_wind_speed,
          mode() WITHIN GROUP (ORDER BY condition) AS common_condition
        FROM weather_data
        WHERE 
          city_id = $1 
          AND time > NOW() - INTERVAL '${days} days'
        GROUP BY interval, city_id, city_name
        ORDER BY interval DESC;
      `;

			const data = await db.manyOrNone(query, [cityId]);

			return data.map((item) => ({
				timestamp: item.interval,
				cityId: item.city_id,
				cityName: item.city_name,
				aqi: {
					avg: parseFloat(item.avg_aqi) || 0,
					max: parseFloat(item.max_aqi) || 0,
					min: parseFloat(item.min_aqi) || 0,
				},
				temperature: {
					avg: parseFloat(item.avg_temperature) || 0,
					max: parseFloat(item.max_temperature) || 0,
					min: parseFloat(item.min_temperature) || 0,
				},
				humidity: parseFloat(item.avg_humidity) || 0,
				windSpeed: parseFloat(item.max_wind_speed) || 0,
				condition: item.common_condition || "Unknown",
			}));
		} catch (error) {
			logError("Lỗi khi lấy lịch sử thời tiết từ TimescaleDB", error);
			throw error;
		}
	}

	/**
	 * Lấy thống kê AQI của các thành phố
	 */
	async getAQIRanking(limit: number = 10): Promise<any[]> {
		const cacheKey = `aqi_ranking_${limit}`;

		// Kiểm tra cache trước
		const cachedData = shortTermCache.get(cacheKey);
		if (cachedData) {
			return cachedData as any[];
		}

		try {
			// Truy vấn database nếu không có trong cache
			const query = `
        WITH latest_data AS (
          SELECT DISTINCT ON (city_id)
            city_id,
            city_name,
            aqi,
            temperature,
            time
          FROM weather_data
          ORDER BY city_id, time DESC
        )
        SELECT * FROM latest_data
        WHERE aqi IS NOT NULL
        ORDER BY aqi DESC
        LIMIT $1;
      `;

			const result = await db.manyOrNone(query, [limit]);

			// Lưu vào cache
			shortTermCache.set(cacheKey, result);

			return result;
		} catch (error) {
			logError("Lỗi khi lấy xếp hạng AQI từ TimescaleDB", error);
			throw error;
		}
	}

	/**
	 * Đóng kết nối với TimescaleDB
	 */
	async close(): Promise<void> {
		try {
			pgp.end();
			logInfo("Đã đóng tất cả các kết nối đến TimescaleDB");
		} catch (error) {
			logError("Lỗi khi đóng kết nối TimescaleDB", error);
		}
	}

	/**
	 * Lưu một lô dữ liệu thời tiết vào TimescaleDB
	 * Hiệu quả hơn nhiều so với lưu từng bản ghi một
	 */
	async saveWeatherDataBatch(weatherDataBatch: any[]): Promise<void> {
		try {
			if (!weatherDataBatch || weatherDataBatch.length === 0) {
				return;
			}

			// Chuẩn bị các tham số cho truy vấn insert hàng loạt
			const columns = [
				"time",
				"city_id",
				"city_name",
				"aqi",
				"temperature",
				"humidity",
				"pressure",
				"wind_speed",
				"wind_direction",
				"condition",
				"main_pollutant",
			];

			// Sử dụng pg-promise helper để thực hiện insert hàng loạt
			const cs = new pgp.helpers.ColumnSet(
				[
					{ name: "time", prop: "timestamp" },
					{ name: "city_id", prop: "cityId" },
					{ name: "city_name", prop: "cityName" },
					{ name: "aqi", prop: "aqi", def: 0 },
					{ name: "temperature", prop: "temperature", def: 0 },
					{ name: "humidity", prop: "humidity", def: 0 },
					{ name: "pressure", prop: "pressure", def: 0 },
					{ name: "wind_speed", prop: "windSpeed", def: 0 },
					{ name: "wind_direction", prop: "windDirection", def: 0 },
					{ name: "condition", prop: "condition", def: "" },
					{ name: "main_pollutant", prop: "mainPollutant", def: "" },
				],
				{ table: "weather_data" }
			);

			// Tạo câu lệnh INSERT hàng loạt
			const query = pgp.helpers.insert(weatherDataBatch, cs);

			// Thực hiện câu lệnh
			await db.none(query);

			logInfo(
				`Đã lưu lô dữ liệu thời tiết với ${weatherDataBatch.length} bản ghi vào TimescaleDB`
			);
		} catch (error) {
			logError("Lỗi khi lưu lô dữ liệu thời tiết vào TimescaleDB", error);
			throw error;
		}
	}
}

// Tạo và export một instance duy nhất
export const timescaleService = new TimescaleService();
