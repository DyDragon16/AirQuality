import React from 'react';

const VietnamFlag = () => {
  return (
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
    >
      {/* Nền đỏ */}
      <rect width="35" height="25" fill="#DA251D" />
      
      {/* Ngôi sao vàng */}
      <path
        d="M8 3L9.163 5.97279H12.3012L9.76589 7.80442L10.7725 10.7772L8 9.1L5.22752 10.7772L6.23411 7.80442L3.69876 5.97279H6.83697L8 3Z"
        fill="#FFFF00"
      />
    </svg>
  );
};

export default VietnamFlag; 