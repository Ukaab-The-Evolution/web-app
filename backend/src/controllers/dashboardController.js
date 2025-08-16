import supabase from '../config/supabase.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// Helper function to get user type details
const getUserTypeDetails = async (user_id) => {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('user_type')
    .eq('user_id', user_id)
    .single();

  if (userError) throw userError;

  let details = {};
  if (user.user_type === 'driver') {
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', user_id)
      .single();
    if (driverError) throw driverError;
    details = { ...driver };
  } else if (user.user_type === 'shipper') {
    const { data: shipper, error: shipperError } = await supabase
      .from('shippers')
      .select('*')
      .eq('user_id', user_id)
      .single();
    if (shipperError) throw shipperError;
    details = { ...shipper };
  }

  return { user_type: user.user_type, ...details };
};

// Get driver/shipper overview stats
export const getOverviewStats = catchAsync(async (req, res, next) => {
  const userDetails = await getUserTypeDetails(req.user.user_id);
  
  let stats;
  if (userDetails.user_type === 'driver') {
    // Get vehicle IDs for the driver
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('vehicle_id')
      .eq('driver_id', userDetails.driver_id);
    
    if (vehiclesError) throw vehiclesError;
    
    const vehicleIds = vehicles.map(v => v.vehicle_id);

    // Get bookings count
    const { count: totalJobs, error: bookingsError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .in('vehicle_id', vehicleIds);
    
    if (bookingsError) throw bookingsError;

    // Get completed jobs count
    const { count: completedJobs, error: completedError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .in('vehicle_id', vehicleIds)
      .eq('status', 'delivered');
    
    if (completedError) throw completedError;

    // Get ratings
    const { data: rating, error: ratingError } = await supabase
      .from('ratings')
      .select('score')
      .eq('rated_user_id', req.user.user_id);
    
    if (ratingError) throw ratingError;

    const avgRating = rating.length > 0 
      ? rating.reduce((acc, curr) => acc + curr.score, 0) / rating.length 
      : 0;

    // Get earnings
    let earnings = 0;
    if (totalJobs > 0) {
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .in('booking_id', 
          supabase.from('bookings')
            .select('booking_id')
            .in('vehicle_id', vehicleIds)
        )
        .eq('status', 'completed');
      
      if (paymentsError) throw paymentsError;
      earnings = payments.reduce((acc, curr) => acc + curr.amount, 0);
    }

    stats = {
      total_jobs: totalJobs || 0,
      completed_jobs: completedJobs || 0,
      average_rating: parseFloat(avgRating.toFixed(2)),
      earnings
    };

  } else if (userDetails.user_type === 'shipper') {
    // Get loads count
    const { count: totalShipments, error: loadsError } = await supabase
      .from('loads')
      .select('*', { count: 'exact', head: true })
      .eq('shipper_id', userDetails.shipper_id);
    
    if (loadsError) throw loadsError;

    // Get completed shipments count
    const { count: completedShipments, error: completedError } = await supabase
      .from('loads')
      .select('*', { count: 'exact', head: true })
      .eq('shipper_id', userDetails.shipper_id)
      .eq('status', 'delivered');
    
    if (completedError) throw completedError;

    // Get total spending (simplified query)
    let totalSpending = 0;
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed');
    
    if (paymentsError) throw paymentsError;
    totalSpending = payments.reduce((acc, curr) => acc + curr.amount, 0);

    // Get average rating
    let avgRating = 0;
    const { data: rating, error: ratingError } = await supabase
      .from('ratings')
      .select('score')
      .eq('rated_user_id', req.user.user_id);
    
    if (ratingError) throw ratingError;
    avgRating = rating.length > 0 
      ? parseFloat((rating.reduce((acc, curr) => acc + curr.score, 0) / rating.length).toFixed(2))
      : 0;

    stats = {
      total_shipments: totalShipments || 0,
      completed_shipments: completedShipments || 0,
      total_spending: totalSpending,
      average_rating: avgRating
    };
  } else {
    return next(new AppError('No dashboard available for this user type', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

// Get pie chart stats for dashboard
export const getPieChartStats = catchAsync(async (req, res, next) => {
  const userDetails = await getUserTypeDetails(req.user.user_id);
  
  let pieData;
  if (userDetails.user_type === 'driver') {
    // Get vehicle IDs for the driver
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('vehicle_id')
      .eq('driver_id', userDetails.driver_id);
    
    if (vehiclesError) throw vehiclesError;
    
    const vehicleIds = vehicles.map(v => v.vehicle_id);

    // Get all bookings and manually group
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('status')
      .in('vehicle_id', vehicleIds);
    
    if (bookingsError) throw bookingsError;

    // Manually group by status
    const statusCounts = bookings.reduce((acc, {status}) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    pieData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));

  } else if (userDetails.user_type === 'shipper') {
    // Get all loads and manually group
    const { data: loads, error: loadsError } = await supabase
      .from('loads')
      .select('status')
      .eq('shipper_id', userDetails.shipper_id);
    
    if (loadsError) throw loadsError;

    // Manually group by status
    const statusCounts = loads.reduce((acc, {status}) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    pieData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));

  } else {
    return next(new AppError('No dashboard available for this user type', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      pieData
    }
  });
});
