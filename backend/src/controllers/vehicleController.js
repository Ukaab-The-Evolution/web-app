import { supabaseAdmin } from '../config/supabase.js';
import { USER_TYPES } from '../domain/constants.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { buildLegacyLocation, normalizeLegacyVehicle } from '../services/currentSchemaService.js';

const fail = (next, message, status = 400) => next(new AppError(message, status));
const failInternal = (next, status = 500) => next(new AppError('Request could not be completed', status, { expose: false }));
const VEHICLE_STATUSES = new Set(['available', 'in_transit', 'maintenance']);

export const getMyVehicles = catchAsync(async (req, res, next) => {
  const query = supabaseAdmin.from('vehicles').select('*').order('last_location_update', { ascending: false, nullsFirst: false });
  const scoped = req.user.user_type === USER_TYPES.DRIVER
    ? query.eq('driver_id', req.user.driver_id)
    : query.eq('company_id', req.user.company_id);
  const { data, error } = await scoped;
  if (error) return failInternal(next);
  return res.status(200).json({ status: 'success', data: { vehicles: (data || []).map(normalizeLegacyVehicle) } });
});

export const createVehicle = catchAsync(async (req, res, next) => {
  if (req.user.user_type !== USER_TYPES.TRUCKING_COMPANY || !req.user.company_id) {
    return fail(next, 'Only trucking company members can create vehicles', 403);
  }
  const licensePlate = String(req.body.registration_number || req.body.license_plate || '').trim();
  const capacityKg = Number(req.body.capacity ?? req.body.capacity_kg);
  const driverId = Number(req.body.driver_id);
  const vehicleType = String(req.body.vehicle_type || 'truck').trim();
  if (!licensePlate || !vehicleType || !Number.isInteger(driverId) || driverId <= 0 || !Number.isInteger(capacityKg) || capacityKg <= 0) {
    return fail(next, 'Registration number, driver_id, and positive whole-number capacity are required', 400);
  }
  const insert = {
    company_id: req.user.company_id,
    driver_id: driverId,
    license_plate: licensePlate,
    vehicle_type: vehicleType,
    capacity_kg: capacityKg,
    status: 'available',
  };
  const { data: driver, error: driverError } = await supabaseAdmin.from('drivers')
    .select('driver_id')
    .eq('driver_id', driverId)
    .eq('company_id', req.user.company_id)
    .maybeSingle();
  if (driverError) return failInternal(next);
  if (!driver) return fail(next, 'Driver does not belong to this company', 400);
  const { data, error } = await supabaseAdmin.from('vehicles').insert(insert).select('*').single();
  if (error) {
    if (error.code === '23505') return fail(next, 'A vehicle with this registration already exists', 409);
    return failInternal(next);
  }
  return res.status(201).json({ status: 'success', data: { vehicle: normalizeLegacyVehicle(data) } });
});

export const updateVehicle = catchAsync(async (req, res, next) => {
  if (req.user.user_type !== USER_TYPES.TRUCKING_COMPANY || !req.user.company_id) return fail(next, 'Only trucking company members can update vehicles', 403);
  const update = {};
  if (req.body.registration_number !== undefined || req.body.license_plate !== undefined) {
    const licensePlate = String(req.body.registration_number ?? req.body.license_plate).trim();
    if (!licensePlate) return fail(next, 'license_plate cannot be empty', 400);
    update.license_plate = licensePlate;
  }
  if (req.body.vehicle_type !== undefined) {
    const vehicleType = String(req.body.vehicle_type).trim();
    if (!vehicleType) return fail(next, 'vehicle_type cannot be empty', 400);
    update.vehicle_type = vehicleType;
  }
  if (req.body.status !== undefined) {
    if (!VEHICLE_STATUSES.has(req.body.status)) return fail(next, 'Invalid vehicle status', 400);
    update.status = req.body.status;
  }
  if (req.body.driver_id !== undefined) {
    const driverId = Number(req.body.driver_id);
    if (!Number.isInteger(driverId) || driverId <= 0) return fail(next, 'driver_id must be a positive integer', 400);
    update.driver_id = driverId;
  }
  if (req.body.capacity !== undefined || req.body.capacity_kg !== undefined) {
    const capacityKg = Number(req.body.capacity ?? req.body.capacity_kg);
    if (!Number.isInteger(capacityKg) || capacityKg <= 0) return fail(next, 'capacity must be a positive whole number', 400);
    update.capacity_kg = capacityKg;
  }
  if (update.driver_id !== undefined) {
    const { data: driver, error: driverError } = await supabaseAdmin.from('drivers').select('driver_id').eq('driver_id', update.driver_id).eq('company_id', req.user.company_id).maybeSingle();
    if (driverError) return failInternal(next);
    if (!driver) return fail(next, 'Driver does not belong to this company', 400);
  }
  if (!Object.keys(update).length) return fail(next, 'No vehicle changes supplied', 400);
  const { data, error } = await supabaseAdmin.from('vehicles').update(update).eq('vehicle_id', Number(req.params.id)).eq('company_id', req.user.company_id).select('*').single();
  if (error) return failInternal(next);
  return res.status(200).json({ status: 'success', data: { vehicle: normalizeLegacyVehicle(data) } });
});

export const updateVehicleLocation = catchAsync(async (req, res, next) => {
  if (req.user.user_type !== USER_TYPES.DRIVER || !req.user.driver_id) {
    return fail(next, 'Only drivers can update vehicle location', 403);
  }

  const vehicleId = Number(req.params.id);
  if (!Number.isInteger(vehicleId) || vehicleId <= 0) return fail(next, 'Invalid vehicle id', 400);

  let location;
  try {
    location = buildLegacyLocation({
      latitude: req.body.latitude ?? req.body.lat,
      longitude: req.body.longitude ?? req.body.lng ?? req.body.lon,
    }, 'location');
  } catch (error) {
    return fail(next, error.message, 400);
  }

  const bookingId = req.body.booking_id === undefined || req.body.booking_id === null || req.body.booking_id === ''
    ? null
    : Number(req.body.booking_id);
  if (bookingId !== null && (!Number.isInteger(bookingId) || bookingId <= 0)) {
    return fail(next, 'booking_id must be a positive integer', 400);
  }
  if (bookingId !== null) {
    const { data: booking, error: bookingError } = await supabaseAdmin.from('bookings')
      .select('booking_id').eq('booking_id', bookingId).eq('vehicle_id', vehicleId).maybeSingle();
    if (bookingError) return failInternal(next);
    if (!booking) return fail(next, 'Booking does not belong to this vehicle', 403);
  }

  const { data: vehicle, error: vehicleError } = await supabaseAdmin.from('vehicles')
    .select('vehicle_id, status').eq('vehicle_id', vehicleId).eq('driver_id', req.user.driver_id).maybeSingle();
  if (vehicleError) return failInternal(next);
  if (!vehicle) return fail(next, 'Vehicle is not assigned to your driver profile', 403);

  const update = { current_location: location, last_location_update: new Date().toISOString() };
  if (bookingId !== null) update.status = 'in_transit';
  const { data: updated, error: updateError } = await supabaseAdmin.from('vehicles')
    .update(update).eq('vehicle_id', vehicleId).select('*').single();
  if (updateError) return failInternal(next);

  const { error: logError } = await supabaseAdmin.from('vehicle_location_log').insert({
    vehicle_id: vehicleId,
    booking_id: bookingId,
    location,
  });
  if (logError) return failInternal(next);

  return res.status(200).json({ status: 'success', data: { vehicle: normalizeLegacyVehicle(updated) } });
});
