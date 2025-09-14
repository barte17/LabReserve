import React from 'react';

interface LoadingRoomCardProps {
  count?: number;
  className?: string;
}

const LoadingRoomCard: React.FC<LoadingRoomCardProps> = ({ count = 1, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="list-item animate-pulse">
          {/* Zdjęcie sali - dokładnie jak w prawdziwej karcie */}
          <div className="mb-4">
            <div className="w-full h-48 bg-gray-300 rounded-lg"></div>
          </div>

          {/* Header z tytułem i badge */}
          <div className="list-item-header">
            <div className="flex-1">
              <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div> {/* "Sala X" */}
              <div className="h-4 bg-gray-200 rounded w-32"></div> {/* "Budynek: X" */}
            </div>
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-200 rounded-full w-24"></div> {/* Badge */}
            </div>
          </div>

          {/* Content z danymi */}
          <div className="list-item-content">
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-20"></div> {/* "Pojemność:" */}
                <div className="h-4 bg-gray-200 rounded w-16"></div> {/* "X osób" */}
              </div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-16"></div> {/* "Godziny:" */}
                <div className="h-4 bg-gray-200 rounded w-24"></div> {/* "XX:XX - XX:XX" */}
              </div>
            </div>
            
            <div className="mt-3">
              <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div> {/* "Opis:" */}
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>

          {/* Actions - przyciski */}
          <div className="list-item-actions">
            <div className="h-8 bg-gray-300 rounded w-24"></div> {/* Przycisk "Zarezerwuj" */}
            <div className="h-8 bg-gray-200 rounded w-20"></div> {/* Przycisk "Szczegóły" */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingRoomCard;