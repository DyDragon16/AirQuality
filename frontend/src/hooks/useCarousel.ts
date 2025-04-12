import { useState, useEffect } from "react";

export type SwipeDirection = "left" | "right" | null;

interface UseCarouselProps {
	totalItems: number;
	autoplayInterval?: number;
	isItemLoading?: (index: number) => boolean;
}

export const useCarousel = ({
	totalItems,
	autoplayInterval = 5000,
	isItemLoading = () => false,
}: UseCarouselProps) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
	const [isPaused, setIsPaused] = useState(false);

	// Chuyển đến item tiếp theo
	const goToNext = () => {
		// Tránh chuyển slide khi đang loading
		if (isItemLoading(activeIndex)) return;

		setSwipeDirection("left");
		// Đảm bảo không vượt quá giới hạn số lượng item
		setActiveIndex((prev) => (prev >= totalItems - 1 ? 0 : prev + 1));
	};

	// Quay lại item trước đó
	const goToPrev = () => {
		// Tránh chuyển slide khi đang loading
		if (isItemLoading(activeIndex)) return;

		setSwipeDirection("right");
		// Đảm bảo không vượt quá giới hạn số lượng item
		setActiveIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1));
	};

	// Chuyển tới item cụ thể
	const goToIndex = (index: number) => {
		if (isItemLoading(activeIndex)) return;

		// Đảm bảo index nằm trong phạm vi hợp lệ
		if (index < 0 || index >= totalItems) return;

		setSwipeDirection(index > activeIndex ? "right" : "left");
		setActiveIndex(index);
	};

	// Auto slide và pause khi hover
	useEffect(() => {
		if (isPaused) return; // Không tạo interval nếu đang tạm dừng

		const interval = setInterval(() => {
			goToNext();
		}, autoplayInterval);

		return () => clearInterval(interval);
	}, [isPaused, activeIndex, autoplayInterval]);

	return {
		activeIndex,
		swipeDirection,
		isPaused,
		setIsPaused,
		goToNext,
		goToPrev,
		goToIndex,
	};
};
