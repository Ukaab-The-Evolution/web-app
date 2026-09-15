import api, { normalizeApiError, normalizeLoad } from '../api/client';
import {
  LOADS_FETCH_START,
  LOADS_FETCH_SUCCESS,
  LOADS_FETCH_FAIL,
  LOAD_CREATE_SUCCESS,
  LOAD_CREATE_FAIL,
  LOAD_SELECT_SUCCESS,
  LOAD_BIDS_SUCCESS,
  LOAD_BID_SUCCESS,
  LOAD_ACCEPT_BID_SUCCESS,
  LOAD_ACTION_FAIL,
} from './types';

export const getAvailableLoads = (params = {}) => async (dispatch) => {
  dispatch({ type: LOADS_FETCH_START });
  try {
    const response = await api.get('/api/v1/loads/available', { params });
    const loads = response.data?.data?.loads || [];
    dispatch({ type: LOADS_FETCH_SUCCESS, payload: loads.map(normalizeLoad) });
    return loads;
  } catch (error) {
    const message = normalizeApiError(error);
    dispatch({ type: LOADS_FETCH_FAIL, payload: message });
    throw error;
  }
};

export const getMyLoads = () => async (dispatch) => {
  dispatch({ type: LOADS_FETCH_START });
  try {
    const response = await api.get('/api/v1/loads');
    const loads = response.data?.data?.loads || [];
    dispatch({ type: LOADS_FETCH_SUCCESS, payload: loads.map(normalizeLoad) });
    return loads;
  } catch (error) {
    const message = normalizeApiError(error);
    dispatch({ type: LOADS_FETCH_FAIL, payload: message });
    throw error;
  }
};

export const createLoad = (payload) => async (dispatch) => {
  dispatch({ type: LOADS_FETCH_START });
  try {
    const response = await api.post('/api/v1/loads', payload);
    const load = response.data?.data?.load;
    dispatch({ type: LOAD_CREATE_SUCCESS, payload: load });
    return load;
  } catch (error) {
    const message = normalizeApiError(error);
    dispatch({ type: LOAD_CREATE_FAIL, payload: message });
    throw error;
  }
};

export const selectLoad = (load) => ({
  type: LOAD_SELECT_SUCCESS,
  payload: load,
});

export const getLoadBids = (loadId) => async (dispatch) => {
  try {
    const response = await api.get(`/api/v1/loads/${loadId}/bids`);
    const bids = response.data?.data?.bids || [];
    dispatch({ type: LOAD_BIDS_SUCCESS, payload: bids });
    return bids;
  } catch (error) {
    const message = normalizeApiError(error);
    dispatch({ type: LOAD_ACTION_FAIL, payload: message });
    throw error;
  }
};

export const submitBid = (loadId, payload) => async (dispatch) => {
  try {
    const response = await api.post(`/api/v1/loads/${loadId}/bids`, payload);
    const bid = response.data?.data?.bid;
    dispatch({ type: LOAD_BID_SUCCESS, payload: bid });
    return bid;
  } catch (error) {
    const message = normalizeApiError(error);
    dispatch({ type: LOAD_ACTION_FAIL, payload: message });
    throw error;
  }
};

export const acceptBid = (loadId, bidId) => async (dispatch) => {
  try {
    const response = await api.post(`/api/v1/loads/${loadId}/bids/${bidId}/accept`);
    const allocation = response.data?.data?.allocation;
    dispatch({ type: LOAD_ACCEPT_BID_SUCCESS, payload: allocation });
    return allocation;
  } catch (error) {
    const message = normalizeApiError(error);
    dispatch({ type: LOAD_ACTION_FAIL, payload: message });
    throw error;
  }
};

export const getLoadBookings = (loadId) => async () => {
  const response = await api.get(`/api/v1/loads/${loadId}/bookings`);
  return response.data?.data?.bookings || [];
};

export const getMyBookings = () => async () => {
  const response = await api.get('/api/v1/loads/bookings/mine');
  return response.data?.data?.bookings || [];
};

export const updateBookingStatus = (bookingId, status, confirmationCode = '') => async () => {
  const response = await api.patch(`/api/v1/loads/bookings/${bookingId}/status`, {
    status,
    confirmation_code: confirmationCode || undefined,
  });
  return response.data?.data?.booking;
};
