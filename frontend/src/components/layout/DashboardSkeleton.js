// Skeleton loading component
const DashboardSkeleton = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Chart/Graph Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-100 rounded-lg flex items-end justify-around p-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div 
                    key={i} 
                    className="bg-gray-200 rounded-t w-8" 
                    style={{ height: `${Math.random() * 150 + 50}px` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* List Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-200 rounded mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-gray-200 rounded mr-3"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-l-4 border-gray-200 pl-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-4/5 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="w-16 h-5 bg-gray-200 rounded-full mb-1"></div>
                        <div className="w-12 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-1/5 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;