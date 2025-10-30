export const SkeletonRoomCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col animate-pulse">
      {/* Szkielet zdjęcia */}
      <div className="h-56 bg-gray-200 relative">
        <div className="absolute top-4 right-4">
          <div className="bg-gray-300 rounded-full h-6 w-20"></div>
        </div>
      </div>

      {/* Szkielet treści */}
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>

        {/* Szkielet informacji */}
        <div className="flex-grow">
          <div className="space-y-3 mb-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-36"></div>
            </div>
          </div>

          {/* Szkielet opisu */}
          <div className="mb-6">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Szkielet przycisków */}
        <div className="flex space-x-3 mt-auto">
          <div className="flex-1 h-12 bg-gray-300 rounded-xl"></div>
          <div className="h-12 w-24 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonStationCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col animate-pulse">
      {/* Szkielet zdjęcia */}
      <div className="h-56 bg-gray-200 relative">
        <div className="absolute top-4 right-4">
          <div className="bg-gray-300 rounded-full h-6 w-16"></div>
        </div>
      </div>

      {/* Szkielet treści */}
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-40"></div>
          </div>
        </div>

        {/* Szkielet informacji */}
        <div className="flex-grow">
          <div className="space-y-3 mb-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-28"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-44"></div>
            </div>
          </div>

          {/* Szkielet opisu */}
          <div className="mb-6">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Szkielet przycisków */}
        <div className="flex space-x-3 mt-auto">
          <div className="flex-1 h-12 bg-gray-300 rounded-xl"></div>
          <div className="h-12 w-24 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 6, type = 'room' }: { count?: number; type?: 'room' | 'station' }) => {
  const SkeletonComponent = type === 'room' ? SkeletonRoomCard : SkeletonStationCard;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
};