import { useEffect, useState } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Đợi animation hoàn tất
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = 
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-blue-500';

  const icon = 
    type === 'success' ? <Check className="h-5 w-5" /> : 
    type === 'error' ? <AlertCircle className="h-5 w-5" /> : 
    <AlertCircle className="h-5 w-5" />;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 flex items-center rounded-md shadow-lg transition-all duration-300 ${bgColor} text-white p-3 pr-8 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
    >
      <div className="mr-2 flex-shrink-0">
        {icon}
      </div>
      <div className="mr-2">{message}</div>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }} 
        className="absolute right-2 top-2 text-white hover:text-gray-200"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast; 