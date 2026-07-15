import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue-500' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`spinner ${sizeClasses[size]} border-${color} border-t-transparent rounded-full`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;