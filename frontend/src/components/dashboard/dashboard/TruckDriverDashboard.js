import React, { useState } from 'react';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';

const TruckDriverDashboard = () => {
  const { user } = useSupabaseAuth();
  const [dashboardData, setDashboardData] = useState({
    totalActiveOrders: 35,
    upcomingOrders: 3,
    deliveredThisMonth: 26,
    currentLoad: {
      shipmentId: 'SHP-1001',
      origin: 'Islamabad',
      destination: 'Karachi',
      currentLocation: 'Islamabad',
      status: 'in transit'
    },
    upcomingOrders: [
      { id: 'SHP-1004', origin: 'Karachi', destination: 'Gilgit', status: 'in transit' },
      { id: 'SHP-1003', origin: 'Lahore', destination: 'Peshawar', status: 'pending' },
      { id: 'SHP-1002', origin: 'Gilgit', destination: 'Lahore', status: 'pending' }
    ]
  });

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome Ahmed!</h1>
            <p className="text-gray-600 mt-1">Here is your main dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#578C7A] text-white p-6 rounded-xl">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm opacity-90">Total Active Orders</p>
                <p className="text-3xl font-bold">{dashboardData.totalActiveOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#578C7A] text-white p-6 rounded-xl">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                </svg>
              </div>
              <div>
                <p className="text-sm opacity-90">Upcoming Orders</p>
                <p className="text-3xl font-bold">{dashboardData.upcomingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#578C7A] text-white p-6 rounded-xl">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm opacity-90">Delivered This Month</p>
                <p className="text-3xl font-bold">{dashboardData.deliveredThisMonth}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Active Load and Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Current Active Load */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Current Active Load</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">in transit</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Shipment ID:</span>
                <span className="font-medium">{dashboardData.currentLoad.shipmentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Origin:</span>
                <span className="font-medium">{dashboardData.currentLoad.origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Destination:</span>
                <span className="font-medium">{dashboardData.currentLoad.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Location:</span>
                <span className="font-medium">{dashboardData.currentLoad.currentLocation}</span>
              </div>
            </div>
            <button className="w-full mt-6 bg-[#578C7A] text-white py-2 rounded-lg hover:bg-[#4a7a69] transition-colors">
              View More
            </button>
          </div>

          {/* Orders Donut Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Orders</h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">78%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#578C7A] rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Ontime</span>
                </div>
                <span className="text-sm font-medium">68%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">In Progress</span>
                </div>
                <span className="text-sm font-medium">20%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Delayed</span>
                </div>
                <span className="text-sm font-medium">12%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Your Upcoming Orders */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Your Upcoming Orders</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.upcomingOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.origin} → {order.destination}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'pending' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TruckDriverDashboard;