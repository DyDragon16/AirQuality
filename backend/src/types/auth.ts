export interface RegisterUserDto {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

export interface LoginUserDto {
	email: string;
	password: string;
}

export interface AuthResponse {
	token: string;
	user: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		role: string;
		favorites: string[];
		isEmailVerified?: boolean;
		status?: "active" | "inactive" | "pending";
	};
}

export interface JwtPayload {
	userId: string;
	email: string;
	role: string;
}

export interface EmailVerificationDto {
	email: string;
	token: string;
}
