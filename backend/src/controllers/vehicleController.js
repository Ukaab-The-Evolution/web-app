import { supabaseAdmin } from '../config/supabase.js';
import { USER_TYPES } from '../domain/constants.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { normalizeLegacyVehicle } from '../services/currentSchemaService.js';

const fail = (next, message, status = 400) => next(new AppError(message, status));

export const getMyVehicles = catchAsync(async (req, res, next) => {
  const query = supabaseAdmin.from('vehicles').select('*').order('last_location_update', { ascending: false, nullsFirst: false });
  const scoped = req.user.user_type === USER_TYPES.DRIVER
    ? query.eq('driver_id', req.user.driver_id)
    : query.eq('company_id', req.user.company_id);
  const { data, error } = await scoped;
  if (error) return fail(next, error.message, 400);
  return res.status(200).json({ status: 'success', data: { vehicles: (data || []).map(normalizeLegacyVehicle) } });
});

export const createVehicle = catchAsync(async (req, res, next) => {
  if (req.user.user_type !== USER_TYPES.TRUCKING_COMPANY || !req.user.company_id) {
    return fail(next, 'Only trucking company members can create vehicles', 403);
  }
  const licensePlate = String(req.body.registration_number || req.body.license_plate || '').trim();
  const capacityKg = Number(req.body.capacity ?? req.body.capacity_kg);
  const driverId = Number(req.body.driver_id);
  if (!licensePlate || !Number.isInteger(driverId) || driverId <= 0 || !Number.isInteger(capacityKg) || capacityKg <= 0) {
    return fail(next, 'Registration number, driver_id, and positive whole-number capacity are required', 400);
  }
  const insert = {
    company_id: req.user.company_id,
    driver_id: driverId,
    license_plate: licensePlate,
    vehicle_type: String(req.body.vehicle_type || 'truck').trim(),
    capacity_kg: capacityKg,
    status: 'available',
  };
  const { data: driver, error: driverError } = await supabaseAdmin.from('drivers')
    .select('driver_id')
    .eq('driver_id', driverId)
    .eq('company_id', req.user.company_id)
    .maybeSingle();
  if (driverError) return fail(next, driverError.message, 400);
  if (!driver) return fail(next, 'Driver does not belong to this company', 400);
  const { data, error } = await supabaseAdmin.from('vehicles').insert(insert).select('*').single();
  if (error) return fail(next, error.code === '23505' ? 'A vehicle with this registration already exists' : error.message, error.code === '23505' ? 409 : 400);
  return res.status(201).json({ status: 'success', data: { vehicle: normalizeLegacyVehicle(data) } });
});

export const updateVehicle = catchAsync(async (req, res, next) => {
  if (req.user.user_type !== USER_TYPES.TRUCKING_COMPANY || !req.user.company_id) return fail(next, 'Only trucking company members can update vehicles', 403);
  const update = {};
  if (req.body.registration_number !== undefined || req.body.license_plate !== undefined) {
    update.license_plate = String(req.body.registration_number || req.body.license_plate).trim();
  }
  if (req.body.vehicle_type !== undefined) update.vehicle_type = String(req.body.vehicle_type).trim();
  if (req.body.status !== undefined) update.status = req.body.status;
  if (req.body.driver_id !== undefined) update.driver_id = Number(req.body.driver_id);
  if (req.body.capacity !== undefined || req.body.capacity_kg !== undefined) update.capacity_kg = Number(req.body.capacity ?? req.body.capacity_kg);
  if (update.driver_id) {
    const { data: driver, error: driverError } = await supabaseAdmin.from('drivers').select('driver_id').eq('driver_id', update.driver_id).eq('company_id', req.user.company_id).maybeSingle();
    if (driverError) return fail(next, driverError.message, 400);
    if (!driver) return fail(next, 'Driver does not belong to this company', 400);
  }
  if (!Object.keys(update).length) return fail(next, 'No vehicle changes supplied', 400);
  const { data, error } = await supabaseAdmin.from('vehicles').update(update).eq('vehicle_id', Number(req.params.id)).eq('company_id', req.user.company_id).select('*').single();
  if (error) return fail(next, error.message, 400);
  return res.status(200).json({ status: 'success', data: { vehicle: normalizeLegacyVehicle(data) } });
});
