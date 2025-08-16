export const truckingCompanyFields = (state) => {
  const overview = state.dashboard.overview || {};
  const pieChart = state.dashboard.pieChart || {};

  // Calculate average performance (completed/total * 100)
  const total = (pieChart.active || 0) + (pieChart.completed || 0) + (pieChart.cancelled || 0);
  const averagePerformance = total ? Math.round((pieChart.completed / total) * 100) : 0;

  return {
    overview,
    pieChart,
    totalLoadsThisMonth: overview.total_shipments || 0,
    pendingRequests: overview.active_shipments || 0,
    averagePerformance,
    weeklyShipments: [
      pieChart.active || 0,
      pieChart.completed || 0,
      pieChart.cancelled || 0,
      0, 0, 0, 0
    ],
    deliveries: {
      ontime: pieChart.completed || 0,
      inProgress: pieChart.active || 0,
      delayed: pieChart.cancelled || 0,
    },
  };
};