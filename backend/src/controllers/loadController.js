import { supabaseAdmin } from '../config/supabase.js';
import { USER_TYPES } from '../domain/constants.js';
import AppError from '../utils/appError.js';
import {
  buildLegacyBidInsert,
  buildLegacyLoadInsert,
  normalizeLegacyBid,
  normalizeLegacyLoad,
  normalizeLegacyVehicle,
} from '../services/currentSchemaService.js';

const fail = (next, message, status = 400) => next(new AppError(message, status));
const failInternal = (next, status = 500) => next(new AppError('Request could not be completed', status, { expose: false }));

const readSingle = async (query) => {
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const readPools = async (db, loads) => {
  const ids = loads.map((load) => load.load_id).filter(Boolean);
  if (!ids.length) return new Map();
  const { data, error } = await db.from('pool_assignments').select('*').in('load_id', ids);
  if (error) throw error;
  return new Map((data || []).map((pool) => [pool.load_id, pool]));
};

const normalizeLoads = async (db, loads) => {
  const pools = await readPools(db, loads);
  return loads.map((load) => normalizeLegacyLoad(load, pools.get(load.load_id)));
};

const assertShipper = (req, next) => {
  if (req.user?.user_type !== USER_TYPES.SHIPPER || !req.user.shipper_id) {
    fail(next, 'Only shipper accounts can perform this action', 403);
    return false;
  }
  return true;
};

export const createLoadController = ({ db = supabaseAdmin } = {}) => ({
  createLoad: async (req, res, next) => {
    try {
      if (!assertShipper(req, next)) return;
      let payload;
      try {
        payload = buildLegacyLoadInsert(req.body, req.user);
      } catch (error) {
        return fail(next, error.message, 400);
      }
      const { data, error } = await db.rpc('create_load_with_pool', {
        p_shipper_id: payload.shipper_id,
        p_actor_user_id: Number(req.user.id),
        p_origin: payload.origin,
        p_destination: payload.destination,
        p_pickup_time: payload.pickup_time,
        p_cargo_type: payload.cargo_type,
        p_weight_kg: payload.weight_kg,
        p_special_requirements: payload.special_requirements,
        p_payment_offer: payload.payment_offer,
        p_trucks_required: payload.number_of_trucks_required,
        p_is_pooling: payload.is_pooling,
      });
      if (error?.code === 'PGRST202') {
        return fail(next, 'Database migration required before creating loads', 503);
      }
      if (error || !data?.load) return failInternal(next);
      return res.status(201).json({
        status: 'success',
        data: { load: normalizeLegacyLoad(data.load, data.pool) },
      });
    } catch (error) {
      return failInternal(next);
    }
  },

  getMyLoads: async (req, res, next) => {
    try {
      if (!assertShipper(req, next)) return;
      const { data, error } = await db.from('loads')
        .select('*')
        .eq('shipper_id', req.user.shipper_id)
        .order('pickup_time', { ascending: false });
      if (error) return failInternal(next);
      return res.status(200).json({ status: 'success', data: { loads: await normalizeLoads(db, data || []) } });
    } catch (error) {
      return failInternal(next);
    }
  },

  getAvailableLoads: async (req, res, next) => {
    try {
      const page = Math.max(Number.parseInt(req.query.page || '1', 10), 1);
      const limit = Math.min(Math.max(Number.parseInt(req.query.limit || '20', 10), 1), 100);
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error } = await db.from('loads')
        .select('*')
        .in('status', ['pending', 'available'])
        .order('pickup_time', { ascending: false })
        .range(from, to);
      if (error) return failInternal(next);
      return res.status(200).json({
        status: 'success',
        data: { loads: await normalizeLoads(db, data || []), page, limit },
      });
    } catch (error) {
      return failInternal(next);
    }
  },

  getLoad: async (req, res, next) => {
    try {
      const load = await readSingle(db.from('loads').select('*').eq('load_id', req.params.id).maybeSingle());
      if (!load) return fail(next, 'Load not found', 404);
      const isOpen = ['pending', 'available'].includes(load.status);
      const isOwner = load.shipper_id === req.user?.shipper_id;
      if ((!isOpen && !isOwner) || (isOpen && req.user?.user_type === USER_TYPES.SHIPPER && !isOwner)) {
        let participantQuery = db.from('bids').select('bid_id').eq('load_id', load.load_id).eq('status', 'accepted');
        if (req.user?.user_type === USER_TYPES.DRIVER) participantQuery = participantQuery.eq('driver_id', req.user.driver_id);
        else if (req.user?.user_type === USER_TYPES.TRUCKING_COMPANY) participantQuery = participantQuery.eq('company_id', req.user.company_id);
        else return fail(next, 'You do not have access to this load', 403);
        const { data: participant, error: participantError } = await participantQuery.limit(1).maybeSingle();
        if (participantError) return failInternal(next);
        if (!participant) return fail(next, 'You do not have access to this load', 403);
      }
      const pool = await readSingle(db.from('pool_assignments').select('*').eq('load_id', load.load_id).maybeSingle());
      return res.status(200).json({ status: 'success', data: { load: normalizeLegacyLoad(load, pool) } });
    } catch (error) {
      return failInternal(next);
    }
  },

  submitBid: async (req, res, next) => {
    try {
      if (req.user?.user_type !== USER_TYPES.DRIVER || !req.user.driver_id) {
        return fail(next, 'Only drivers can submit bids', 403);
      }
      const load = await readSingle(db.from('loads').select('*').eq('load_id', req.params.id).maybeSingle());
      if (!load) return fail(next, 'Load not found', 404);
      if (!['pending', 'available'].includes(load.status)) return fail(next, 'This load is no longer open', 409);

      const vehicleId = Number(req.body.vehicle_id);
      const vehicle = await readSingle(db.from('vehicles')
        .select('vehicle_id, capacity_kg, company_id, driver_id, status')
        .eq('vehicle_id', vehicleId)
        .eq('driver_id', req.user.driver_id)
        .eq('status', 'available')
        .maybeSingle());
      if (!vehicle) return fail(next, 'Vehicle is not available for this driver', 403);
      if (!vehicle.company_id) return fail(next, 'Vehicle must be assigned to a trucking company before bidding', 409);
      const proposedCapacity = Number(req.body.proposed_capacity ?? vehicle.capacity_kg);
      if (!Number.isFinite(proposedCapacity) || proposedCapacity <= 0 || proposedCapacity > Number(vehicle.capacity_kg)) {
        return fail(next, 'proposed_capacity must be positive and cannot exceed the vehicle capacity', 400);
      }

      let payload;
      try {
        payload = buildLegacyBidInsert({
          ...req.body,
          load_id: load.load_id,
          vehicle_id: vehicle.vehicle_id,
          proposed_capacity: proposedCapacity,
        }, { company_id: vehicle.company_id, driver_id: req.user.driver_id });
      } catch (error) {
        return fail(next, error.message, 400);
      }
      const { data, error } = await db.from('bids').insert(payload).select('*').single();
      if (error) {
        if (error.code === '23505') return fail(next, 'This vehicle already has a bid on the load', 409);
        return failInternal(next);
      }
      return res.status(201).json({ status: 'success', data: { bid: normalizeLegacyBid(data) } });
    } catch (error) {
      return failInternal(next);
    }
  },

  getLoadBids: async (req, res, next) => {
    try {
      const load = await readSingle(db.from('loads').select('load_id, shipper_id').eq('load_id', req.params.id).maybeSingle());
      if (!load) return fail(next, 'Load not found', 404);
      const isOwner = load.shipper_id === req.user?.shipper_id;
      const isDriver = req.user?.user_type === USER_TYPES.DRIVER;
      const isCompany = req.user?.user_type === USER_TYPES.TRUCKING_COMPANY;
      if (!isOwner && !isDriver && !isCompany) return fail(next, 'You do not have access to these bids', 403);

      let query = db.from('bids').select('*').eq('load_id', load.load_id).order('bid_time', { ascending: true });
      if (isDriver && !isOwner) query = query.eq('driver_id', req.user.driver_id);
      if (isCompany && !isOwner) query = query.eq('company_id', req.user.company_id);
      const { data, error } = await query;
      if (error) return failInternal(next);
      return res.status(200).json({ status: 'success', data: { bids: (data || []).map(normalizeLegacyBid) } });
    } catch (error) {
      return failInternal(next);
    }
  },

  getLoadBookings: async (req, res, next) => {
    try {
      const load = await readSingle(db.from('loads').select('load_id, shipper_id').eq('load_id', req.params.id).maybeSingle());
      if (!load) return fail(next, 'Load not found', 404);
      const isOwner = load.shipper_id === req.user?.shipper_id;
      if (!isOwner && ![USER_TYPES.DRIVER, USER_TYPES.TRUCKING_COMPANY].includes(req.user?.user_type)) {
        return fail(next, 'You do not have access to these bookings', 403);
      }

      let bidQuery = db.from('bids').select('*').eq('load_id', load.load_id).eq('status', 'accepted');
      if (req.user?.user_type === USER_TYPES.DRIVER && !isOwner) bidQuery = bidQuery.eq('driver_id', req.user.driver_id);
      if (req.user?.user_type === USER_TYPES.TRUCKING_COMPANY && !isOwner) bidQuery = bidQuery.eq('company_id', req.user.company_id);
      const { data: bids, error: bidError } = await bidQuery;
      if (bidError) return failInternal(next);
      const bidIds = (bids || []).map((bid) => bid.bid_id);
      if (!bidIds.length) return res.status(200).json({ status: 'success', data: { bookings: [] } });

      const { data: bookings, error: bookingError } = await db.from('bookings')
        .select('*').in('bid_id', bidIds).order('booked_at', { ascending: true });
      if (bookingError) return failInternal(next);
      const vehicleIds = (bookings || []).map((booking) => booking.vehicle_id).filter(Boolean);
      const { data: vehicles, error: vehicleError } = vehicleIds.length
        ? await db.from('vehicles').select('vehicle_id, license_plate, capacity_kg, status, current_location, last_location_update').in('vehicle_id', vehicleIds)
        : { data: [], error: null };
      if (vehicleError) return failInternal(next);
      const bidsById = new Map((bids || []).map((bid) => [bid.bid_id, normalizeLegacyBid(bid)]));
      const vehiclesById = new Map((vehicles || []).map((vehicle) => [vehicle.vehicle_id, normalizeLegacyVehicle(vehicle)]));
      return res.status(200).json({
        status: 'success',
        data: { bookings: (bookings || []).map((booking) => ({
          ...booking,
          bid: bidsById.get(booking.bid_id) || null,
          vehicle: vehiclesById.get(booking.vehicle_id) || null,
        })) },
      });
    } catch (error) {
      return failInternal(next);
    }
  },

  getMyBookings: async (req, res, next) => {
    try {
      if (![USER_TYPES.DRIVER, USER_TYPES.TRUCKING_COMPANY].includes(req.user?.user_type)) {
        return fail(next, 'Only drivers and trucking companies can view assigned bookings', 403);
      }
      let bidQuery = db.from('bids').select('*').eq('status', 'accepted');
      bidQuery = req.user.user_type === USER_TYPES.DRIVER
        ? bidQuery.eq('driver_id', req.user.driver_id)
        : bidQuery.eq('company_id', req.user.company_id);
      const { data: bids, error: bidError } = await bidQuery.order('bid_time', { ascending: false });
      if (bidError) return failInternal(next);
      const bidIds = (bids || []).map((bid) => bid.bid_id);
      if (!bidIds.length) return res.status(200).json({ status: 'success', data: { bookings: [] } });

      const { data: bookings, error: bookingError } = await db.from('bookings')
        .select('*').in('bid_id', bidIds).order('booked_at', { ascending: false });
      if (bookingError) return failInternal(next);
      const loadIds = (bids || []).map((bid) => bid.load_id).filter(Boolean);
      const { data: loads, error: loadError } = await db.from('loads').select('*').in('load_id', loadIds);
      if (loadError) return failInternal(next);
      const pools = await readPools(db, loads || []);
      const vehicleIds = (bookings || []).map((booking) => booking.vehicle_id).filter(Boolean);
      const { data: vehicles, error: vehicleError } = vehicleIds.length
        ? await db.from('vehicles').select('*').in('vehicle_id', vehicleIds)
        : { data: [], error: null };
      if (vehicleError) return failInternal(next);
      const bidsById = new Map((bids || []).map((bid) => [bid.bid_id, normalizeLegacyBid(bid)]));
      const loadsById = new Map((loads || []).map((load) => [load.load_id, normalizeLegacyLoad(load, pools.get(load.load_id))]));
      const vehiclesById = new Map((vehicles || []).map((vehicle) => [vehicle.vehicle_id, normalizeLegacyVehicle(vehicle)]));
      return res.status(200).json({
        status: 'success',
        data: {
          bookings: (bookings || []).map((booking) => ({
            ...booking,
            bid: bidsById.get(booking.bid_id) || null,
            load: loadsById.get(bidsById.get(booking.bid_id)?.load_id) || null,
            vehicle: vehiclesById.get(booking.vehicle_id) || null,
          })),
        },
      });
    } catch (error) {
      return failInternal(next);
    }
  },

  updateBookingStatus: async (req, res, next) => {
    try {
      if (![USER_TYPES.DRIVER, USER_TYPES.SHIPPER].includes(req.user?.user_type)) {
        return fail(next, 'Only the assigned driver or load owner can update a booking', 403);
      }
      const { data, error } = await db.rpc('update_booking_status', {
        p_booking_id: Number(req.params.id),
        p_actor_user_id: Number(req.user.id),
        p_status: req.body.status,
        p_confirmation_code: req.body.confirmation_code || null,
      });
      if (error?.code === 'PGRST202') return fail(next, 'Database migration required before updating bookings', 503);
      if (error) {
        const status = error.code === '42501' ? 403 : error.code === 'P0002' ? 404 : error.code === 'P0001' ? 409 : 400;
        return fail(next, status === 403 ? 'You do not have access to this booking' : error.message || 'Invalid booking transition', status);
      }
      return res.status(200).json({ status: 'success', data: { booking: data } });
    } catch (error) {
      return failInternal(next);
    }
  },

  acceptBid: async (req, res, next) => {
    try {
      if (!assertShipper(req, next)) return;
      const { data, error } = await db.rpc('accept_load_bid', {
        p_load_id: Number(req.params.id),
        p_bid_id: Number(req.params.bidId),
        p_actor_user_id: Number(req.user.id),
      });
      if (error) {
        const status = ['42501', '23505', '23514', 'P0001'].includes(error.code) ? 409 : 400;
        if (status === 409) return fail(next, 'This bid cannot be accepted in the current load state', status);
        return failInternal(next);
      }
      return res.status(200).json({ status: 'success', data: { allocation: data } });
    } catch (error) {
      return failInternal(next);
    }
  },
});

const controller = createLoadController();
export const {
  createLoad,
  getMyLoads,
  getAvailableLoads,
  getLoad,
  submitBid,
  getLoadBids,
  getLoadBookings,
  getMyBookings,
  updateBookingStatus,
  acceptBid,
} = controller;
