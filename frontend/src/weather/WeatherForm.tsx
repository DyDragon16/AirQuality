import { FC, FormEvent, useState } from "react";
import { Search } from 'lucide-react';

interface WeatherFormProps {
	defaultCityId: string;
	onSubmit: (cityId: string) => void;
	isLoading: boolean;
}

export const WeatherForm: FC<WeatherFormProps> = ({
	defaultCityId,
	onSubmit,
	isLoading,
}) => {
	const [cityId, setCityId] = useState<string>(defaultCityId);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (cityId.trim()) {
			onSubmit(cityId.trim());
		}
	};

	return (
		<form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
			<div className="relative">
				<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Search className="h-5 w-5 text-gray-400" />
				</div>
				<input
					type="text"
					id="cityId"
					value={cityId}
					onChange={(e) => setCityId(e.target.value)}
					placeholder="Tìm kiếm thành phố..."
					className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl 
                    text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-blue-500 text-lg
                    dark:bg-gray-800 dark:border-gray-600 dark:text-white"
					required
				/>
				<div className="absolute inset-y-0 right-0 flex items-center pr-3">
					<button
						type="submit"
						disabled={isLoading}
						className="inline-flex items-center px-6 py-2 border border-transparent 
                        text-base font-medium rounded-lg text-white bg-blue-600 
                        hover:bg-blue-700 focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-blue-500 transition-colors
                        disabled:opacity-70"
					>
						{isLoading ? (
							<>
								<svg
									className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
                                    aria-hidden="true"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Đang tìm...
							</>
						) : (
							"Tìm kiếm"
						)}
					</button>
				</div>
			</div>
		</form>
	);
};
