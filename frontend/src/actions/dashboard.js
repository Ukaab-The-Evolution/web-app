import axios from 'axios';
import {
  DASHBOARD_OVERVIEW_SUCCESS,
  DASHBOARD_OVERVIEW_FAIL,
  DASHBOARD_PIECHART_SUCCESS,
  DASHBOARD_PIECHART_FAIL,
  DASHBOARD_LOADS_SUCCESS,
  DASHBOARD_LOADS_FAIL,
  DASHBOARD_SHIPMENTS_SUCCESS,
  DASHBOARD_SHIPMENTS_FAIL,
  DASHBOARD_LOAD_DETAILS_SUCCESS,
  DASHBOARD_LOAD_DETAILS_FAIL,
  DASHBOARD_SHIPMENT_DETAILS_SUCCESS,
  DASHBOARD_SHIPMENT_DETAILS_FAIL,
  DASHBOARD_BID_SUCCESS,
  DASHBOARD_BID_FAIL,
  DASHBOARD_ACCEPT_LOAD_SUCCESS,
  DASHBOARD_ACCEPT_LOAD_FAIL,
  DASHBOARD_SEARCH_SUCCESS,
  DASHBOARD_SEARCH_FAIL,
} from './types';

// Overview stats
export const getDashboardOverview = () => async (dispatch) => {
  try {
    const res = await axios.get(`${process.env.API_URL}/api/v1/dashboard/overview`);
    dispatch({
      type: DASHBOARD_OVERVIEW_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_OVERVIEW_FAIL,
      payload: error.response?.data?.message || 'Failed to load dashboard overview',
    });
  }
};

// Pie chart stats
export const getDashboardPieChart = () => async (dispatch) => {
  try {
    const res = await axios.get(`${process.env.API_URL}/api/v1/dashboard/pie-chart`);
    dispatch({
      type: DASHBOARD_PIECHART_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_PIECHART_FAIL,
      payload: error.response?.data?.message || 'Failed to load pie chart data',
    });
  }
};

// Available loads (for drivers)
export const getAvailableLoads = () => async (dispatch) => {
  try {
    const res = await axios.get(`${process.env.API_URL}/api/v1/dashboard/loads/available`);
    dispatch({
      type: DASHBOARD_LOADS_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_LOADS_FAIL,
      payload: error.response?.data?.message || 'Failed to load available loads',
    });
  }
};

// Shipper shipments (for shippers)
export const getShipperShipments = () => async (dispatch) => {
  try {
    const res = await axios.get(`${process.env.API_URL}/api/v1/dashboard/shipments`);
    dispatch({
      type: DASHBOARD_SHIPMENTS_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_SHIPMENTS_FAIL,
      payload: error.response?.data?.message || 'Failed to load shipments',
    });
  }
};

// Load details
export const getLoadDetails = (loadId) => async (dispatch) => {
  try {
    const res = await axios.get(`${process.env.API_URL}/api/v1/dashboard/loads/${loadId}`);
    dispatch({
      type: DASHBOARD_LOAD_DETAILS_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_LOAD_DETAILS_FAIL,
      payload: error.response?.data?.message || 'Failed to load load details',
    });
  }
};

// Shipment details
export const getShipmentDetails = (loadId) => async (dispatch) => {
  try {
    const res = await axios.get(`${process.env.API_URL}/api/v1/dashboard/shipments/${loadId}`);
    dispatch({
      type: DASHBOARD_SHIPMENT_DETAILS_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_SHIPMENT_DETAILS_FAIL,
      payload: error.response?.data?.message || 'Failed to load shipment details',
    });
  }
};

// Submit bid
export const submitBid = (bidData) => async (dispatch) => {
  try {
    const res = await axios.post(`${process.env.API_URL}/api/v1/dashboard/bids`, bidData);
    dispatch({
      type: DASHBOARD_BID_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_BID_FAIL,
      payload: error.response?.data?.message || 'Failed to submit bid',
    });
  }
};

// Accept load
export const acceptLoad = (loadData) => async (dispatch) => {
  try {
    const res = await axios.post(`${process.env.API_URL}/api/v1/dashboard/accept-load`, loadData);
    dispatch({
      type: DASHBOARD_ACCEPT_LOAD_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_ACCEPT_LOAD_FAIL,
      payload: error.response?.data?.message || 'Failed to accept load',
    });
  }
};

// Search loads/shipments
export const searchLoads = (params) => async (dispatch) => {
  try {
    const res = await axios.get(`${process.env.API_URL}/api/v1/dashboard/search`, { params });
    dispatch({
      type: DASHBOARD_SEARCH_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_SEARCH_FAIL,
      payload: error.response?.data?.message || 'Failed to search loads/shipments',
    });
  }
};