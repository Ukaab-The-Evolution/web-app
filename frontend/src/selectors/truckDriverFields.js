export const truckDriverFields = (state) => {
  const overview = state.dashboard.overview || {};
  const pieChart = state.dashboard.pieChart || {};
  const availableLoads = state.dashboard.availableLoads || [];

  return {
    totalActiveOrders: overview.active_shipments || 0,
    deliveredThisMonth: overview.completed_shipments || 0,
    upcomingOrders: availableLoads.length,
    currentLoad: availableLoads[0] || null,
    donutOntime: pieChart.completed || 0,
    donutInProgress: pieChart.active || 0,
    donutDelayed: pieChart.cancelled || 0,
    upcomingOrdersList: availableLoads,
  };
};