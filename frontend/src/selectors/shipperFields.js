export const shipperFields = (state) => {
  const overview = state.dashboard.overview || {};
  const pieChart = state.dashboard.pieChart || {};
  const shipments = state.dashboard.shipments || [];

  return {
    totalShipments: overview.total_shipments || 0,
    activeShipments: overview.active_shipments || 0,
    completedShipments: overview.completed_shipments || 0,
    weeklyShipments: overview.weeklyShipments || [0,0,0,0,0,0,0],
    deliveries: {
      completed: pieChart.completed || 0,
      active: pieChart.active || 0,
      cancelled: pieChart.cancelled || 0,
    },
  };
};