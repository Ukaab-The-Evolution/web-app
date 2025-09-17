import React, { useEffect, useState } from 'react';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';
import { connect } from 'react-redux';
import { truckingCompanyFields } from '../../../selectors/truckingCompanyFields';
import { getDashboardOverview, getDashboardPieChart } from '../../../actions/dashboard';

const TruckingCompanyDashboard = ({
  totalLoadsThisMonth,
  pendingRequests,
  averagePerformance,
  weeklyShipments,
  deliveries,
  getDashboardOverview,
  getDashboardPieChart
}) => {
  const { user } = useSupabaseAuth();

  useEffect(() => {
    getDashboardOverview();
    getDashboardPieChart();
  }, [getDashboardOverview, getDashboardPieChart]);

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome {user?.first_name || "Company"}!</h1>
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
                <p className="text-sm opacity-90">Total Loads This Month</p>
                <p className="text-3xl font-bold">{totalLoadsThisMonth}</p>
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
                <p className="text-sm opacity-90">Pending Requests</p>
                <p className="text-3xl font-bold">{pendingRequests}</p>
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
                <p className="text-sm opacity-90">Average Performance</p>
                <p className="text-3xl font-bold">{averagePerformance}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Weekly Shipments Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Weekly Shipments Chart</h3>
              <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
                <option>This Week</option>
              </select>
            </div>
            <div className="h-64 bg-gradient-to-t from-green-100 to-transparent rounded-lg flex items-end justify-between px-4 pb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="flex flex-col items-center">
                  <div 
                    className="bg-[#578C7A] rounded-t-lg w-8 mb-2"
                    style={{ height: `${(weeklyShipments[index] / 30) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deliveries Donut Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Deliveries</h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">{averagePerformance}%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#578C7A] rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Ontime</span>
                </div>
                <span className="text-sm font-medium">{deliveries.ontime}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">In Progress</span>
                </div>
                <span className="text-sm font-medium">{deliveries.inProgress}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Delayed</span>
                </div>
                <span className="text-sm font-medium">{deliveries.delayed}%</span>
              </div>
            </div>
            <button className="w-full mt-6 bg-[#578C7A] text-white py-2 rounded-lg hover:bg-[#4a7a69] transition-colors">
              Download Statistics
            </button>
          </div>
        </div>

        {/* Incoming Load Requests */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Incoming Load Requests</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="pb-3"># Shipment ID</th>
                    <th className="pb-3">📍 Origin</th>
                    <th className="pb-3">📍 Destination</th>
                    <th className="pb-3">🚛 Trucks</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomingRequests.length > 0 ? (
                    incomingRequests.map((req) => (
                      <tr className="border-b" key={req.id}>
                        <td className="py-4">{req.id}</td>
                        <td className="py-4">{req.origin}</td>
                        <td className="py-4">{req.destination}</td>
                        <td className="py-4">{req.trucks}</td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <button className="bg-[#578C7A] text-white px-3 py-1 rounded text-sm">Accept</button>
                            <button className="bg-red-500 text-white px-3 py-1 rounded text-sm">Decline</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-4 text-gray-500" colSpan={5}>No incoming requests</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => truckingCompanyFields(state);

export default connect(mapStateToProps, {
  getDashboardOverview,
  getDashboardPieChart,
  
})(TruckingCompanyDashboard);