import React from 'react';

interface LoadingCardProps {
  count?: number;
  className?: string;
}

const LoadingCard: React.FC<LoadingCardProps> = ({ count = 1, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="flex items-start space-x-4">
            {/* Image placeholder */}
            <div className="w-20 h-20 bg-gray-300 rounded-lg flex-shrink-0"></div>
            
            <div className="flex-1 space-y-3">
              {/* Title */}
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              
              {/* Subtitle */}
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              
              {/* Description lines */}
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
              
              {/* Tags/badges */}
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingCard;