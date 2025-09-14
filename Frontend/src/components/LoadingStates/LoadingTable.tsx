import React from 'react';

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

const LoadingTable: React.FC<LoadingTableProps> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="animate-pulse">
        {/* Table header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="h-4 bg-gray-300 rounded flex-1"></div>
            ))}
          </div>
        </div>
        
        {/* Table rows */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-4">
              <div className="flex space-x-4">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div 
                    key={colIndex} 
                    className={`h-4 bg-gray-200 rounded flex-1 ${
                      colIndex === 0 ? 'bg-gray-300' : ''
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingTable;