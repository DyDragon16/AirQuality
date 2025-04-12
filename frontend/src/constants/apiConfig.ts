/**
 * Cấu hình API URLs tập trung
 * File này lưu tất cả các cấu hình liên quan đến API
 */

// URL cơ sở của API backend
export const API_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// URL frontend
export const FRONTEND_URL =
	process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

// Các endpoints của API
export const API_ENDPOINTS = {
	// Auth endpoints
	AUTH: {
		LOGIN: `${API_URL}/auth/login`,
		REGISTER: `${API_URL}/auth/register`,
		ME: `${API_URL}/auth/me`,
		PROFILE: `${API_URL}/auth/profile`,
		CHECK_ACCOUNT: `${API_URL}/auth/check-account`,
		VERIFY_EMAIL: `${API_URL}/auth/verify-email`,
		FORGOT_PASSWORD: `${API_URL}/auth/forgot-password`,
		RESET_PASSWORD: `${API_URL}/auth/reset-password`,
		CHECK_RESET_TOKEN: `${API_URL}/auth/check-reset-token`,
		FAVORITES: (cityId: string) => `${API_URL}/auth/favorites/${cityId}`,
		USERS: `${API_URL}/auth/users`,
		USER: (userId: string) => `${API_URL}/auth/users/${userId}`,
		USER_ROLE: (userId: string) => `${API_URL}/auth/users/${userId}/role`,
		USER_STATUS: (userId: string) => `${API_URL}/auth/users/${userId}/status`,
		INVITE_USER: `${API_URL}/auth/invite-user`,
	},

	// Weather endpoints
	WEATHER: {
		CITIES: `${API_URL}/weather/cities`,
		CITY: (cityId: string) => `${API_URL}/weather/${cityId}`,
		HISTORY: (cityId: string, days: number) =>
			`${API_URL}/weather/history/${cityId}?days=${days}`,
		STATS: `${API_URL}/weather/stats`,
		ALERTS: (limit: number = 5) => `${API_URL}/weather/alerts?limit=${limit}`,
		RANKING: `${API_URL}/weather/ranking`,
	},

	// Cities endpoints
	CITIES: {
		ALL: `${API_URL}/cities`,
		BY_ID: (id: string) => `${API_URL}/cities/${id}`,
		BY_SLUG: (slug: string) => `${API_URL}/cities/by-slug/${slug}`,
		SEARCH: (query: string) => `${API_URL}/cities/search/${query}`,
	},

	// Ranking endpoints
	RANKING: {
		AQI: (limit: number = 10) => `${API_URL}/ranking/aqi?limit=${limit}`,
		TEMPERATURE: (limit: number = 10, sort: string = "desc") =>
			`${API_URL}/ranking/temperature?limit=${limit}&sort=${sort}`,
		UPDATE_DATA: `${API_URL}/ranking/update-data`,
	},
};
