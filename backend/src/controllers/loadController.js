import { supabaseAdmin } from '../config/supabase.js';
import { USER_TYPES } from '../domain/constants.js';
import AppError from '../utils/appError.js';
import { buildBidInsert, buildLoadInsert, normalizeLoadResponse } from '../services/loadService.js';

const fail = (next, message, status = 400) => next(new AppError(message, status));

const readSingle = async (query) => {
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const assertShipper = (req, next) => {
  if (req.user?.user_type !== USER_TYPES.SHIPPER || !req.user.organization_id) {
    fail(next, 'Only shipper organization members can perform this action', 403);
    return false;
  }
  return true;
};

export const createLoadController = ({ db = supabaseAdmin } = {}) => ({
  createLoad: async (req, res, next) => {
    try {
      if (!assertShipper(req, next)) return;
      const payload = buildLoadInsert(req.body, req.user);
      const { data, error } = await db.from('loads').insert(payload).select('*').single();
      if (error) return fail(next, error.message, 400);
      return res.status(201).json({ status: 'success', data: { load: normalizeLoadResponse(data) } });
    } catch (error) {
      return fail(next, error.message, 400);
    }
  },

  getMyLoads: async (req, res, next) => {
    try {
      if (!assertShipper(req, next)) return;
      const { data, error } = await db.from('loads')
        .select('*')
        .eq('shipper_organization_id', req.user.organization_id)
        .order('created_at', { ascending: false });
      if (error) return fail(next, error.message, 400);
      return res.status(200).json({
        status: 'success',
        data: { loads: (data || []).map(normalizeLoadResponse) },
      });
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
      const query = db.from('loads')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .range(from, to);
      const { data, error } = await query;
      if (error) return fail(next, error.message, 400);
      return res.status(200).json({
        status: 'success',
        data: { loads: (data || []).map(normalizeLoadResponse), page, limit },
      });
    } catch (error) {
      return fail(next, error.message, 400);
    }
  },

  getLoad: async (req, res, next) => {
    try {
      const load = await readSingle(db.from('loads').select('*').eq('id', req.params.id).maybeSingle());
      if (!load) return fail(next, 'Load not found', 404);
      const canView = load.status === 'open'
        || load.shipper_organization_id === req.user?.organization_id;
      if (!canView) return fail(next, 'You do not have access to this load', 403);
      return res.status(200).json({ status: 'success', data: { load: normalizeLoadResponse(load) } });
    } catch (error) {
      return fail(next, error.message, 400);
    }
  },

  submitBid: async (req, res, next) => {
    try {
      if (req.user?.user_type !== USER_TYPES.DRIVER || !req.user.driver_id) {
        return fail(next, 'Only drivers can submit bids', 403);
      }

      const load = await readSingle(db.from('loads').select('*').eq('id', req.params.id).maybeSingle());
      if (!load) return fail(next, 'Load not found', 404);
      if (load.status !== 'open') return fail(next, 'This load is no longer open', 409);

      const vehicle = await readSingle(db.from('vehicles')
        .select('id, capacity, organization_id, driver_id, status')
        .eq('id', req.body.vehicle_id)
        .eq('driver_id', req.user.driver_id)
        .eq('status', 'available')
        .maybeSingle());
      if (!vehicle) return fail(next, 'Vehicle is not available for this driver', 403);

      const payload = buildBidInsert({
        ...req.body,
        proposed_capacity: req.body.proposed_capacity ?? vehicle.capacity,
      }, req.user);
      const { data, error } = await db.from('load_bids')
        .insert({ ...payload, load_id: req.params.id })
        .select('*')
        .single();
      if (error) return fail(next, error.code === '23505' ? 'This vehicle already has a bid on the load' : error.message, error.code === '23505' ? 409 : 400);
      return res.status(201).json({ status: 'success', data: { bid: data } });
    } catch (error) {
      return fail(next, error.message, 400);
    }
  },

  getLoadBids: async (req, res, next) => {
    try {
      const load = await readSingle(db.from('loads').select('id, shipper_organization_id').eq('id', req.params.id).maybeSingle());
      if (!load) return fail(next, 'Load not found', 404);
      const isOwner = load.shipper_organization_id === req.user?.organization_id;
      const isDriver = req.user?.user_type === USER_TYPES.DRIVER;
      if (!isOwner && !isDriver) return fail(next, 'You do not have access to these bids', 403);

      let query = db.from('load_bids').select('*').eq('load_id', req.params.id).order('created_at', { ascending: true });
      if (isDriver && !isOwner) query = query.eq('driver_id', req.user.driver_id);
      const { data, error } = await query;
      if (error) return fail(next, error.message, 400);
      return res.status(200).json({ status: 'success', data: { bids: data || [] } });
    } catch (error) {
      return fail(next, error.message, 400);
    }
  },

  acceptBid: async (req, res, next) => {
    try {
      if (!assertShipper(req, next)) return;
      const { data, error } = await db.rpc('accept_load_bid', {
        p_load_id: req.params.id,
        p_bid_id: req.params.bidId,
        p_actor_user_id: req.user.id,
      });
      if (error) {
        const status = ['42501', '23505', '23514'].includes(error.code) ? 409 : 400;
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
