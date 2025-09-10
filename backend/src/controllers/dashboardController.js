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

    // Get bookings count through bids and vehicles
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

    // Get earnings through payments and bookings
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

    // Get total spending through payments and bookings
    let totalSpending = 0;
    if (totalShipments > 0) {
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .in('booking_id', 
          supabase.from('bookings')
            .select('booking_id')
            .in('load_id', 
              supabase.from('loads')
                .select('load_id')
                .eq('shipper_id', userDetails.shipper_id)
            )
        )
        .eq('status', 'completed');
      
      if (paymentsError) throw paymentsError;
      totalSpending = payments.reduce((acc, curr) => acc + curr.amount, 0);
    }

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

// 1. LOAD/SHIPMENT LISTING ENDPOINTS

// Get available loads for drivers
export const getAvailableLoads = catchAsync(async (req, res, next) => {
  const userDetails = await getUserTypeDetails(req.user.user_id);
  
  if (userDetails.user_type !== 'driver') {
    return next(new AppError('Only drivers can access available loads', 403));
  }

  const { page = 1, limit = 10, status = 'available', cargo_type } = req.query;
  const offset = (page - 1) * limit;

  // Build query - removed search on geography columns
  let query = supabase
    .from('loads')
    .select(`
      *,
      shipper:shipper_id (
        user_id,
        users:user_id (full_name, phone, email)
      )
    `, { count: 'exact' })
    .eq('status', status)
    .order('pickup_time', { ascending: false }); // Changed from created_at to pickup_time

  // Apply filters
  if (cargo_type) {
    query = query.eq('cargo_type', cargo_type);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: loads, error, count } = await query;

  if (error) throw error;

  res.status(200).json({
    status: 'success',
    results: count,
    data: { loads }
  });
});

// Get shipments for shippers
export const getShipperShipments = catchAsync(async (req, res, next) => {
  const userDetails = await getUserTypeDetails(req.user.user_id);
  
  if (userDetails.user_type !== 'shipper') {
    return next(new AppError('Only shippers can access shipments', 403));
  }

  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;

  // Build query - simplified to avoid complex joins
  let query = supabase
    .from('loads')
    .select(`
      *,
      bids (*,
        trucking_companies:company_id (company_name)
      )
    `, { count: 'exact' })
    .eq('shipper_id', userDetails.shipper_id)
    .order('pickup_time', { ascending: false }); // Changed from created_at to pickup_time

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: shipments, error, count } = await query;

  if (error) throw error;

  res.status(200).json({
    status: 'success',
    results: count,
    data: { shipments }
  });
});

// 2. DETAILED VIEWS ENDPOINTS

// Get load details
export const getLoadDetails = catchAsync(async (req, res, next) => {
  const { load_id } = req.params;

  const { data: load, error } = await supabase
    .from('loads')
    .select(`
      *,
      shipper:shipper_id (
        user_id,
        users:user_id (full_name, phone, email)
      ),
      bids (*,
        trucking_companies:company_id (company_name, company_address)
      )
    `)
    .eq('load_id', load_id)
    .single();

  if (error) throw error;

  res.status(200).json({
    status: 'success',
    data: { load }
  });
});

// Get shipment details with tracking
export const getShipmentDetails = catchAsync(async (req, res, next) => {
  const { load_id } = req.params;
  const userDetails = await getUserTypeDetails(req.user.user_id);

  // Verify user has access to this shipment
  let query = supabase
    .from('loads')
    .select(`
      *,
      shipper:shipper_id (
        user_id,
        users:user_id (full_name, phone, email)
      ),
      bids (*,
        trucking_companies:company_id (company_name)
      )
    `)
    .eq('load_id', load_id);

  if (userDetails.user_type === 'shipper') {
    query = query.eq('shipper_id', userDetails.shipper_id);
  }

  const { data: shipment, error } = await query.single();

  if (error) throw error;
  if (!shipment) {
    return next(new AppError('Shipment not found or access denied', 404));
  }

  // Get bookings separately since there's no direct relationship
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      vehicles:vehicle_id (
        license_plate,
        vehicle_type,
        driver_id,
        drivers:driver_id (user_id, users:user_id (full_name, phone))
      ),
      payments (*)
    `)
    .eq('bid_id', 
      supabase.from('bids')
        .select('bid_id')
        .eq('load_id', load_id)
    );

  // Get vehicle location logs
  const { data: locationLogs } = await supabase
    .from('vehicle_location_log')
    .select('*')
    .eq('booking_id', 
      supabase.from('bookings')
        .select('booking_id')
        .eq('bid_id', 
          supabase.from('bids')
            .select('bid_id')
            .eq('load_id', load_id)
        )
    );

  res.status(200).json({
    status: 'success',
    data: { 
      shipment: {
        ...shipment,
        bookings,
        location_logs: locationLogs
      }
    }
  });
});

// 3. BIDDING/ACCEPTANCE ENDPOINTS

// Submit bid on a load
export const submitBid = catchAsync(async (req, res, next) => {
  const userDetails = await getUserTypeDetails(req.user.user_id);
  
  if (userDetails.user_type !== 'driver') {
    return next(new AppError('Only drivers can submit bids', 403));
  }

  const { load_id, bid_amount } = req.body;

  // Get driver's company_id
  const { data: driver, error: driverError } = await supabase
    .from('drivers')
    .select('company_id')
    .eq('driver_id', userDetails.driver_id)
    .single();

  if (driverError || !driver || !driver.company_id) {
    return next(new AppError('Driver not associated with a company', 400));
  }

  // Verify load exists and is available
  const { data: load, error: loadError } = await supabase
    .from('loads')
    .select('*')
    .eq('load_id', load_id)
    .eq('status', 'available')
    .single();

  if (loadError || !load) {
    return next(new AppError('Load not available for bidding', 400));
  }

  // Submit bid
  const { data: bid, error } = await supabase
    .from('bids')
    .insert([{
      load_id,
      company_id: driver.company_id,
      bid_amount: parseFloat(bid_amount),
      bid_time: new Date().toISOString(),
      status: 'pending'
    }])
    .select()
    .single();

  if (error) throw error;

  res.status(201).json({
    status: 'success',
    data: { bid }
  });
});

// Accept a load (for pooling model)
export const acceptLoad = catchAsync(async (req, res, next) => {
  const userDetails = await getUserTypeDetails(req.user.user_id);
  
  if (userDetails.user_type !== 'driver') {
    return next(new AppError('Only drivers can accept loads', 403));
  }

  const { load_id, vehicle_id } = req.body;

  // Verify load exists and is available
  const { data: load, error: loadError } = await supabase
    .from('loads')
    .select('*')
    .eq('load_id', load_id)
    .eq('status', 'available')
    .single();

  if (loadError || !load) {
    return next(new AppError('Load not available', 400));
  }

  // Verify vehicle belongs to driver
  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .select('*')
    .eq('vehicle_id', vehicle_id)
    .eq('driver_id', userDetails.driver_id)
    .single();

  if (vehicleError || !vehicle) {
    return next(new AppError('Invalid vehicle', 400));
  }

  // First create a bid (required for booking)
  const { data: bid, error: bidError } = await supabase
    .from('bids')
    .insert([{
      load_id,
      company_id: vehicle.company_id,
      bid_amount: load.payment_offer,
      bid_time: new Date().toISOString(),
      status: 'accepted'
    }])
    .select()
    .single();

  if (bidError) throw bidError;

  // Create booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert([{
      bid_id: bid.bid_id,
      vehicle_id,
      booked_at: new Date().toISOString(),
      final_price: load.payment_offer,
      estimated_delivery_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'booked'
    }])
    .select()
    .single();

  if (error) throw error;

  // Update load status
  await supabase
    .from('loads')
    .update({ status: 'booked' })
    .eq('load_id', load_id);

  res.status(201).json({
    status: 'success',
    data: { booking }
  });
});

// Search loads/shipments with filters
export const searchLoads = catchAsync(async (req, res, next) => {
  const userDetails = await getUserTypeDetails(req.user.user_id);
  const { 
    status = 'available', 
    cargo_type, 
    min_weight, 
    max_weight, 
    min_payment, 
    max_payment,
    page = 1, 
    limit = 10 
  } = req.query;
  
  const offset = (page - 1) * limit;

  let query;
  if (userDetails.user_type === 'driver') {
    query = supabase
      .from('loads')
      .select('*', { count: 'exact' })
      .eq('status', status);
  } else if (userDetails.user_type === 'shipper') {
    query = supabase
      .from('loads')
      .select('*', { count: 'exact' })
      .eq('shipper_id', userDetails.shipper_id);
  } else {
    return next(new AppError('Invalid user type for this operation', 400));
  }

  // Apply filters (removed search on geography columns)
  if (cargo_type) {
    query = query.eq('cargo_type', cargo_type);
  }
  if (min_weight) {
    query = query.gte('weight_kg', min_weight);
  }
  if (max_weight) {
    query = query.lte('weight_kg', max_weight);
  }
  if (min_payment) {
    query = query.gte('payment_offer', min_payment);
  }
  if (max_payment) {
    query = query.lte('payment_offer', max_payment);
  }

  // Apply pagination and ordering
  const { data: results, error, count } = await query
    .order('pickup_time', { ascending: false }) // Changed from created_at to pickup_time
    .range(offset, offset + limit - 1);

  if (error) throw error;

  res.status(200).json({
    status: 'success',
    results: count,
    data: { loads: results }
  });
});