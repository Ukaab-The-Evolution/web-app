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
import { setAlert } from './alert';


// Helper to get auth header
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/dashboard`;

// 1. Overview stats
export const getDashboardOverview = () => async (dispatch) => {
  try {
    const res = await axios.get(
      `${API_URL}/overview`,
      getAuthConfig()
    );
    dispatch({
      type: DASHBOARD_OVERVIEW_SUCCESS,
      payload: res.data.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_OVERVIEW_FAIL,
      payload: error.response?.data?.message || 'Failed to load dashboard overview',
    });
  }
};

// 2. Pie chart stats
export const getDashboardPieChart = () => async (dispatch) => {
  try {
    const res = await axios.get(
      `${API_URL}/pie-chart`,
      getAuthConfig()
    );
    dispatch({
      type: DASHBOARD_PIECHART_SUCCESS,
      payload: res.data.data,
    });
    
  } catch (error) {
    dispatch({
      type: DASHBOARD_PIECHART_FAIL,
      payload: error.response?.data?.message || 'Failed to load pie chart data',
    });
    dispatch(setAlert(error.response?.data?.message || 'Failed to load pie chart data', 'danger'));
  }
};

// 3. Available loads (for drivers)
export const getAvailableLoads = (filters = {}) => async (dispatch) => {
  try {
    const res = await axios.get(
      `${API_URL}/loads/available`,
      {
        ...getAuthConfig(),
        params: filters,
      }
    );
    dispatch({
      type: DASHBOARD_LOADS_SUCCESS,
      payload: res.data.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_LOADS_FAIL,
      payload: error.response?.data?.message || 'Failed to load available loads',
    });
  }
};

// 4. Shipper shipments (for shippers)
export const getShipperShipments = (filters = {}) => async (dispatch) => {
  try {
    const res = await axios.get(
      `${API_URL}/shipments`,
      {
        ...getAuthConfig(),
        params: filters,
      }
    );
    console.log('Fetched shipments:', res.data.data);
    dispatch({
      type: DASHBOARD_SHIPMENTS_SUCCESS,
      payload: res.data.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_SHIPMENTS_FAIL,
      payload: error.response?.data?.message || 'Failed to load shipments',
    });
  }
};

// 5. Search loads/shipments
export const searchLoads = (params) => async (dispatch) => {
  try {
    const res = await axios.get(
      `${API_URL}/search`,
      {
        ...getAuthConfig(),
        params,
      }
    );
    dispatch({
      type: DASHBOARD_SEARCH_SUCCESS,
      payload: res.data.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_SEARCH_FAIL,
      payload: error.response?.data?.message || 'Failed to search loads/shipments',
    });
  }
};

// 6. Load details
export const getLoadDetails = (loadId) => async (dispatch) => {
  try {
    const res = await axios.get(
      `${API_URL}/loads/${loadId}`,
      getAuthConfig()
    );
    dispatch({
      type: DASHBOARD_LOAD_DETAILS_SUCCESS,
      payload: res.data.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_LOAD_DETAILS_FAIL,
      payload: error.response?.data?.message || 'Failed to load load details',
    });
  }
};

// 7. Shipment details
export const getShipmentDetails = (shipmentId) => async (dispatch) => {
  try {
    const res = await axios.get(
      `${API_URL}/shipments/${shipmentId}`,
      getAuthConfig()
    );
    dispatch({
      type: DASHBOARD_SHIPMENT_DETAILS_SUCCESS,
      payload: res.data.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_SHIPMENT_DETAILS_FAIL,
      payload: error.response?.data?.message || 'Failed to load shipment details',
    });
  }
};

// 8. Submit bid (drivers only)
export const submitBid = (bidData) => async (dispatch) => {
  try {
    const res = await axios.post(
      `${API_URL}/bids`,
      bidData,
      getAuthConfig()
    );
    dispatch({
      type: DASHBOARD_BID_SUCCESS,
      payload: res.data.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_BID_FAIL,
      payload: error.response?.data?.message || 'Failed to submit bid',
    });
  }
};

// 9. Accept load (drivers only)
export const acceptLoad = (loadData) => async (dispatch) => {
  try {
    const res = await axios.post(
      `${API_URL}/accept-load`,
      loadData,
      getAuthConfig()
    );
    dispatch({
      type: DASHBOARD_ACCEPT_LOAD_SUCCESS,
      payload: res.data.data,
    });
  } catch (error) {
    dispatch({
      type: DASHBOARD_ACCEPT_LOAD_FAIL,
      payload: error.response?.data?.message || 'Failed to accept load',
    });
  }
};