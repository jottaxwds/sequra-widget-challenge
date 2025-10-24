import React from "react";

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center">
    <div className="w-10 h-10 border-4 border-t-transparent border-gray-300 rounded-full animate-spin"></div>
  </div>
);

export default LoadingSpinner;
