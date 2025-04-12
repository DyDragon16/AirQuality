export type CityType = "CITY" | "DISTRICT";

interface CityInfo {
	id: string;
	type: CityType;
	mapId?: string;
}

export const CITIES: Record<string, CityInfo> = {
	HANOI: {
		id: "ZPGtcusBx9JWBKYxm",
		type: "CITY",
	},
	HOCHIMINH: {
		id: "92iZQopYpL5uW7Tt7",
		type: "CITY",
	},
	DANANG: {
		id: "qCzTHAGRkQBNPdLDf",
		type: "CITY",
	},
	HAIPHONG: {
		id: "5b7a86036a15c1ae2d8a892d",
		type: "CITY",
	},
	CANTHO: {
		id: "5b7a86036a15c1ae2d8a892b",
		type: "CITY",
	},
	HUE: {
		id: "5b7a86026a15c1ae2d8a88ec",
		type: "CITY",
	},
	NHATRANG: {
		id: "5b7a86036a15c1ae2d8a8919",
		type: "CITY",
	},
	DALAT: {
		id: "5b7a86026a15c1ae2d8a8910",
		type: "CITY",
	},
	SAPA: {
		id: "5b7a86026a15c1ae2d8a88e7",
		type: "CITY",
	},
} as const;
