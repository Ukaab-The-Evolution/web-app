import { supabaseAdmin } from '../config/supabase.js';
import { USER_TYPES } from '../domain/constants.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

const fail = (next, message, status = 400) => next(new AppError(message, status));

export const getMyVehicles = catchAsync(async (req, res, next) => {
  const query = supabaseAdmin.from('vehicles').select('*').order('created_at', { ascending: false });
  const scoped = req.user.user_type === USER_TYPES.DRIVER
    ? query.eq('driver_id', req.user.driver_id)
    : query.eq('organization_id', req.user.organization_id);
  const { data, error } = await scoped;
  if (error) return fail(next, error.message, 400);
  return res.status(200).json({ status: 'success', data: { vehicles: data || [] } });
});

export const createVehicle = catchAsync(async (req, res, next) => {
  if (req.user.user_type !== USER_TYPES.TRUCKING_COMPANY || !req.user.organization_id) {
    return fail(next, 'Only trucking company members can create vehicles', 403);
  }
  const registrationNumber = String(req.body.registration_number || '').trim();
  const capacity = Number(req.body.capacity);
  if (!registrationNumber || !Number.isFinite(capacity) || capacity <= 0) {
    return fail(next, 'Registration number and positive capacity are required', 400);
  }
  const insert = {
    organization_id: req.user.organization_id,
    registration_number: registrationNumber,
    vehicle_type: String(req.body.vehicle_type || 'truck').trim(),
    capacity,
    status: 'available',
  };
  if (req.body.driver_id) {
    const { data: driver, error: driverError } = await supabaseAdmin.from('drivers').select('id').eq('id', req.body.driver_id).eq('organization_id', req.user.organization_id).maybeSingle();
    if (driverError) return fail(next, driverError.message, 400);
    if (!driver) return fail(next, 'Driver does not belong to this company', 400);
    insert.driver_id = req.body.driver_id;
  }
  const { data, error } = await supabaseAdmin.from('vehicles').insert(insert).select('*').single();
  if (error) return fail(next, error.code === '23505' ? 'A vehicle with this registration already exists' : error.message, error.code === '23505' ? 409 : 400);
  return res.status(201).json({ status: 'success', data: { vehicle: data } });
});

export const updateVehicle = catchAsync(async (req, res, next) => {
  if (req.user.user_type !== USER_TYPES.TRUCKING_COMPANY || !req.user.organization_id) return fail(next, 'Only trucking company members can update vehicles', 403);
  const update = {};
  for (const field of ['registration_number', 'vehicle_type', 'status', 'driver_id']) {
    if (req.body[field] !== undefined) update[field] = req.body[field] || null;
  }
  if (req.body.capacity !== undefined) update.capacity = Number(req.body.capacity);
  if (update.driver_id) {
    const { data: driver, error: driverError } = await supabaseAdmin.from('drivers').select('id').eq('id', update.driver_id).eq('organization_id', req.user.organization_id).maybeSingle();
    if (driverError) return fail(next, driverError.message, 400);
    if (!driver) return fail(next, 'Driver does not belong to this company', 400);
  }
  if (!Object.keys(update).length) return fail(next, 'No vehicle changes supplied', 400);
  const { data, error } = await supabaseAdmin.from('vehicles').update({ ...update, updated_at: new Date().toISOString() }).eq('id', req.params.id).eq('organization_id', req.user.organization_id).select('*').single();
  if (error) return fail(next, error.message, 400);
  return res.status(200).json({ status: 'success', data: { vehicle: data } });
});
