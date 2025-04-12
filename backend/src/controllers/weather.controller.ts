import { Request, Response } from "express";
import { CITIES, CityType } from "../constants/cities";
import { cityDataService } from "../services/cityDataService";
import env from "../config/env";

export const getWeatherByCity = async (req: Request, res: Response) => {
	try {
		const { city } = req.params;
		const cityInfo = CITIES[city.toUpperCase() as keyof typeof CITIES];

		if (!cityInfo) {
			return res.status(404).json({ error: "City not found" });
		}

		// Cập nhật dữ liệu mới nhất trước khi trả về response
		await cityDataService.updateData();

		let endpoint: string;
		switch (cityInfo.type) {
			case "CITY":
				endpoint = `${env.airvisualApiUrl}/cities/${cityInfo.id}`;
				break;
			case "DISTRICT":
				endpoint = `${env.airvisualApiUrl}/stations/by/cityID/${cityInfo.id}`;
				break;
			default:
				throw new Error("Invalid city type");
		}

		const response = await fetch(endpoint);

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const data = await response.json();
		const lastUpdated = new Date().toISOString();

		// Nếu thành phố có mapId, thêm URL map vào response
		if (cityInfo.mapId) {
			return res.json({
				...data,
				lastUpdated,
				mapUrl: `${env.mapImageBaseUrl}/${cityInfo.mapId}.webp`,
			});
		}

		return res.json({
			...data,
			lastUpdated,
		});
	} catch (error) {
		console.error("Error fetching weather data:", error);
		return res.status(500).json({
			error: "Failed to fetch weather data",
		});
	}
};
