import Link from "next/link";

export const Footer = () => {
  return (
    <div className="bg-white border-t border-gray-200 py-1">
      <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Về Chúng Tôi
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Chúng tôi cung cấp thông tin chất lượng không khí và thời tiết
              chính xác cho các thành phố lớn trên cả nước.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Liên kết</h3>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/air-quality"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Chất lượng không khí
                </Link>
              </li>
              <li>
                <Link
                  href="/rankings"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Xếp hạng
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Liên hệ</h3>
            <div className="space-y-1.5">
              <p className="text-gray-600 text-sm">
                Địa chỉ: 123 Đường ABC, Thành phố XYZ
              </p>
              <p className="text-gray-600 text-sm">Email: info@example.com</p>
              <p className="text-gray-600 text-sm">Điện thoại: +123 456 7890</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} AirQuality. By Team Demo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer; 