import React from 'react';

interface LoadingStationCardProps {
  count?: number;
  className?: string;
}

const LoadingStationCard: React.FC<LoadingStationCardProps> = ({ count = 1, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="list-item animate-pulse">
          {/* Zdjęcie stanowiska - dokładnie jak w prawdziwej karcie */}
          <div className="mb-4">
            <div className="w-full h-48 bg-gray-300 rounded-lg"></div>
          </div>

          {/* Header z tytułem i typem */}
          <div className="list-item-header">
            <div className="flex-1">
              <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div> {/* Nazwa stanowiska */}
              <div className="h-4 bg-gray-200 rounded w-28"></div> {/* "Typ: X" */}
            </div>
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-200 rounded-full w-20"></div> {/* Badge typu */}
            </div>
          </div>

          {/* Content z danymi stanowiska */}
          <div className="list-item-content">
            <div className="grid grid-cols-1 gap-3 text-sm mb-3">
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div> {/* "Sala:" */}
                <div className="h-4 bg-gray-200 rounded w-24"></div> {/* "Sala X (Budynek Y)" */}
              </div>
            </div>
            
            <div className="mt-3">
              <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div> {/* "Opis:" */}
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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

export default LoadingStationCard;