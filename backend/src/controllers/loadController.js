import { supabaseAdmin } from '../config/supabase.js';
import { USER_TYPES } from '../domain/constants.js';
import AppError from '../utils/appError.js';
import {
  buildLegacyBidInsert,
  buildLegacyLoadInsert,
  normalizeLegacyBid,
  normalizeLegacyLoad,
} from '../services/currentSchemaService.js';

const fail = (next, message, status = 400) => next(new AppError(message, status));

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
      const payload = buildLegacyLoadInsert(req.body, req.user);
      const { data, error } = await db.from('loads').insert(payload).select('*').single();
      if (error) return fail(next, error.message, 400);

      const { data: pool, error: poolError } = await db.from('pool_assignments').insert({
        load_id: data.load_id,
        trucks_required: data.number_of_trucks_required,
        trucks_assigned: 0,
        accepted_capacity: 0,
        status: 'not_full',
      }).select('*').single();
      if (poolError) {
        await db.from('loads').delete().eq('load_id', data.load_id);
        return fail(next, poolError.message, 400);
      }
      return res.status(201).json({
        status: 'success',
        data: { load: normalizeLegacyLoad(data, pool) },
      });
    } catch (error) {
      return fail(next, error.message, 400);
    }
  },

  getMyLoads: async (req, res, next) => {
    try {
      if (!assertShipper(req, next)) return;
      const { data, error } = await db.from('loads')
        .select('*')
        .eq('shipper_id', req.user.shipper_id)
        .order('pickup_time', { ascending: false });
      if (error) return fail(next, error.message, 400);
      return res.status(200).json({ status: 'success', data: { loads: await normalizeLoads(db, data || []) } });
    } catch (error) {
      return fail(next, error.message, 400);
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
      if (error) return fail(next, error.message, 400);
      return res.status(200).json({
        status: 'success',
        data: { loads: await normalizeLoads(db, data || []), page, limit },
      });
    } catch (error) {
      return fail(next, error.message, 400);
    }
  },

  getLoad: async (req, res, next) => {
    try {
      const load = await readSingle(db.from('loads').select('*').eq('load_id', req.params.id).maybeSingle());
      if (!load) return fail(next, 'Load not found', 404);
      const isOpen = ['pending', 'available'].includes(load.status);
      const isOwner = load.shipper_id === req.user?.shipper_id;
      if (!isOpen && !isOwner) return fail(next, 'You do not have access to this load', 403);
      const pool = await readSingle(db.from('pool_assignments').select('*').eq('load_id', load.load_id).maybeSingle());
      return res.status(200).json({ status: 'success', data: { load: normalizeLegacyLoad(load, pool) } });
    } catch (error) {
      return fail(next, error.message, 400);
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

      const payload = buildLegacyBidInsert({
        ...req.body,
        load_id: load.load_id,
        vehicle_id: vehicle.vehicle_id,
        proposed_capacity: req.body.proposed_capacity ?? vehicle.capacity_kg,
      }, { company_id: vehicle.company_id, driver_id: req.user.driver_id });
      const { data, error } = await db.from('bids').insert(payload).select('*').single();
      if (error) {
        return fail(next, error.code === '23505' ? 'This vehicle already has a bid on the load' : error.message, error.code === '23505' ? 409 : 400);
      }
      return res.status(201).json({ status: 'success', data: { bid: normalizeLegacyBid(data) } });
    } catch (error) {
      return fail(next, error.message, 400);
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
      if (error) return fail(next, error.message, 400);
      return res.status(200).json({ status: 'success', data: { bids: (data || []).map(normalizeLegacyBid) } });
    } catch (error) {
      return fail(next, error.message, 400);
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
        return fail(next, error.message, status);
      }
      return res.status(200).json({ status: 'success', data: { allocation: data } });
    } catch (error) {
      return fail(next, error.message, 400);
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
  acceptBid,
} = controller;
