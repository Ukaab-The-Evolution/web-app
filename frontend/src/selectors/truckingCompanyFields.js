export const truckingCompanyFields = (state) => {
  const overview = state.dashboard.overview || {};
  const pieChart = state.dashboard.pieChart || {};
  const shipments = state.dashboard.shipments || [];

  const total = (pieChart.active || 0) + (pieChart.completed || 0) + (pieChart.cancelled || 0);
  const averagePerformance = total ? Math.round((pieChart.completed / total) * 100) : 0;

  return {
    totalLoadsThisMonth: overview.total_shipments || 0,
    pendingRequests: shipments.filter(s => s.status === 'pending').length,
    averagePerformance,
    weeklyShipments: overview.weeklyShipments || [0,0,0,0,0,0,0],
    deliveries: {
      ontime: pieChart.completed || 0,
      inProgress: pieChart.active || 0,
      delayed: pieChart.cancelled || 0,
    },
    incomingRequests: shipments.map(s => ({
      id: s.shipment_id,
      origin: s.origin,
      destination: s.destination,
      trucks: s.weight,
    })),
  };
};