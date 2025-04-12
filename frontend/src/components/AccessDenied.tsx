"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}

/**
 * Component hiển thị khi người dùng không có quyền truy cập
 */
export default function AccessDenied() {
  const [showContent, setShowContent] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [rotate, setRotate] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const lastRippleTime = useRef(0);
  const lastPosition = useRef({ x: 0, y: 0 });
  const isMouseInside = useRef(false);

  // Tạo màu ngẫu nhiên cho gợn sóng với gam màu nhẹ nhàng
  const getRandomColor = () => {
    const colors = [
      'rgba(100, 149, 237, 0.7)',  // Cornflower blue
      'rgba(176, 196, 222, 0.7)',  // Light steel blue
      'rgba(173, 216, 230, 0.7)',  // Light blue
      'rgba(135, 206, 235, 0.7)',  // Sky blue
      'rgba(176, 224, 230, 0.7)',  // Powder blue
      'rgba(175, 238, 238, 0.7)',  // Pale turquoise
      'rgba(143, 188, 143, 0.7)'   // Dark sea green
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Hàm tạo hiệu ứng gợn sóng với vị trí cụ thể
  const createRippleAt = (x: number, y: number, isAuto = false) => {
    if (!containerRef.current) return;
    
    // Tạo gợn sóng mới với ID duy nhất
    const rippleId = nextId.current++;
    const initialSize = Math.random() * 15 + 10; // Giảm kích thước ban đầu
    const maxSize = Math.random() * 150 + (isAuto ? 100 : 200); // Giảm kích thước tối đa
    
    const newRipple: Ripple = { 
      id: rippleId, 
      x, 
      y, 
      size: initialSize,
      opacity: isAuto ? 0.6 : 0.75, // Giảm độ đậm
      color: getRandomColor() 
    };
    
    // Thêm gợn sóng mới vào mảng
    setRipples(prevRipples => {
      // Giới hạn số lượng gợn sóng tối đa để tránh quá tải
      const maxRipples = 15;
      const updatedRipples = [...prevRipples, newRipple];
      // Nếu quá nhiều gợn sóng, loại bỏ các gợn sóng cũ nhất
      return updatedRipples.length > maxRipples 
        ? updatedRipples.slice(updatedRipples.length - maxRipples) 
        : updatedRipples;
    });
    
    // Tạo animation frame để làm mịn hiệu ứng
    const startTime = performance.now();
    const duration = Math.random() * 300 + (isAuto ? 600 : 800); // Giảm thời lượng
    
    const animateRipple = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Sử dụng hàm easeOutQuad để có hiệu ứng mượt mà hơn
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      
      setRipples(prevRipples => 
        prevRipples.map(ripple => 
          ripple.id === rippleId 
            ? { 
                ...ripple, 
                size: initialSize + easedProgress * maxSize, 
                opacity: (isAuto ? 0.6 : 0.75) * (1 - easedProgress * (isAuto ? 0.8 : 0.7))
              } 
            : ripple
        )
      );
      
      if (progress < 1) {
        requestAnimationFrame(animateRipple);
      } else {
        // Xóa gợn sóng khi kết thúc hiệu ứng
        setRipples(prevRipples => prevRipples.filter(ripple => ripple.id !== rippleId));
      }
    };
    
    requestAnimationFrame(animateRipple);
  };

  // Hàm tạo hiệu ứng gợn sóng tại vị trí chuột
  const createRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const now = Date.now();
    // Giảm tần suất tạo gợn sóng (25ms thay vì 15ms)
    if (now - lastRippleTime.current < 25) return;
    lastRippleTime.current = now;
    
    // Tính toán vị trí chuột tương đối so với container
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Lưu vị trí cuối cùng để tạo hiệu ứng tự động
    lastPosition.current = { x, y };
    
    // Tạo hiệu ứng gợn sóng tại vị trí chuột
    createRippleAt(x, y);
  };

  // Xử lý khi chuột vào/ra container
  const handleMouseEnter = () => {
    isMouseInside.current = true;
  };

  const handleMouseLeave = () => {
    isMouseInside.current = false;
  };

  useEffect(() => {
    // Hiệu ứng fade-in khi component mount
    const timer1 = setTimeout(() => setShowContent(true), 100);
    
    // Hiệu ứng bounce định kỳ
    const timer2 = setInterval(() => {
      setBounce(true);
      setTimeout(() => setBounce(false), 500);
    }, 3000);
    
    // Hiệu ứng xoay định kỳ
    const timer3 = setInterval(() => {
      setRotate(true);
      setTimeout(() => setRotate(false), 1000);
    }, 5000);

    // Tạo hiệu ứng gợn sóng ngẫu nhiên với tần suất thấp hơn
    const autoRippleInterval = setInterval(() => {
      if (!containerRef.current) return;
      
      // 70% cơ hội không tạo gợn sóng để giảm mật độ
      if (Math.random() < 0.7) return;
      
      // Nếu chuột đang trong container, sử dụng vị trí chuột làm trung tâm
      if (isMouseInside.current) {
        const baseX = lastPosition.current.x;
        const baseY = lastPosition.current.y;
        
        // Giảm số lượng gợn sóng (chỉ tạo 1 hoặc 2)
        const numRipples = Math.random() > 0.7 ? 2 : 1;
        for (let i = 0; i < numRipples; i++) {
          // Giảm phạm vi phân tán (chỉ còn 80px)
          const offsetX = (Math.random() - 0.5) * 80;
          const offsetY = (Math.random() - 0.5) * 80;
          createRippleAt(baseX + offsetX, baseY + offsetY, true);
        }
      } 
      // Nếu không có chuột, chỉ đôi khi tạo gợn sóng ngẫu nhiên
      else if (Math.random() > 0.5) {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const randomX = Math.random() * rect.width;
        const randomY = Math.random() * rect.height;
        createRippleAt(randomX, randomY, true);
      }
    }, 350); // Tăng thời gian chờ lên 350ms
    
    return () => {
      clearTimeout(timer1);
      clearInterval(timer2);
      clearInterval(timer3);
      clearInterval(autoRippleInterval);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-800 to-slate-900 px-6 py-8"
      onMouseMove={createRipple}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Hiệu ứng gợn sóng */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="pointer-events-none absolute blur-[2px] rounded-full z-10"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: `${ripple.size}px`,
            height: `${ripple.size}px`,
            background: `radial-gradient(circle, ${ripple.color.replace(/[\d.]+\)$/, '0.8)')} 0%, ${ripple.color.replace(/[\d.]+\)$/, '0.5)')} 60%, transparent 85%)`,
            opacity: ripple.opacity,
            boxShadow: `0 0 25px 6px ${ripple.color}, inset 0 0 15px 3px ${ripple.color.replace(/[\d.]+\)$/, '0.6)')}`,
            border: `1.5px solid ${ripple.color.replace(/[\d.]+\)$/, '0.8)')}`,
            transition: 'all 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            transform: 'translateZ(0)',
            mixBlendMode: 'screen',
          }}
        />
      ))}
      
      {/* Lớp nền tạo hiệu ứng sáng tối */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_0%,_rgba(0,0,0,0.7)_80%)] z-0"></div>
      
      <div 
        className={`relative z-20 w-full max-w-md overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm p-8 shadow-2xl border border-white/20 transition-all duration-700 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="relative mb-8 flex justify-center">
          <div className="absolute -z-10 h-24 w-24 animate-pulse rounded-full bg-red-400/50"></div>
          <div 
            className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/50 transition-transform duration-500 ${
              bounce ? "animate-bounce" : ""
            } ${rotate ? "animate-spin" : ""}`}
          >
            <ShieldAlert className="h-10 w-10 drop-shadow-lg" />
          </div>
        </div>
        
        <h1 className="mb-4 text-center text-3xl font-bold text-red-400 shadow-red-500/50 drop-shadow-lg">
          <span className="animate-pulse">Truy cập bị từ chối</span>
        </h1>
        
        <div className="relative mb-6 overflow-hidden rounded-lg bg-white/5 p-4 backdrop-blur-sm shadow-inner">
          <div className="absolute -left-2 top-0 h-full w-1 animate-pulse bg-red-500"></div>
          <p className="text-center text-white drop-shadow-md">
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên hoặc quay lại trang chủ.
          </p>
        </div>
        
        <div className="flex justify-center">
          <Link 
            href="/"
            className="group relative flex items-center overflow-hidden rounded-lg bg-blue-600 px-8 py-3 transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/50"
          >
            <span className="absolute left-0 h-full w-0 bg-white/30 transition-all duration-300 group-hover:w-full"></span>
            <ArrowLeft className="mr-2 h-5 w-5 text-white transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="relative z-10 text-white font-semibold">Quay lại trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 