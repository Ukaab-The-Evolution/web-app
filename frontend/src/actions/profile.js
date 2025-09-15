import axios from 'axios';
import {
  PROFILE_GET_SUCCESS,
  PROFILE_GET_FAIL,
  PROFILE_UPDATE_SUCCESS,
  PROFILE_UPDATE_FAIL,
  PROFILE_JOIN_COMPANY_SUCCESS,
  PROFILE_JOIN_COMPANY_FAIL,
  PROFILE_GENERATE_INVITE_SUCCESS,
  PROFILE_GENERATE_INVITE_FAIL,
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

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/profile`;

// 1. Get Profile
export const getProfile = () => async (dispatch) => {
  try {
    const res = await axios.get(
      `${API_URL}`,
      getAuthConfig()
    );
    console.log('Profile fetched:', res.data);
    dispatch({
      type: PROFILE_GET_SUCCESS,
      payload: res.data.data.user,
    });
  } catch (error) {
    dispatch({
      type: PROFILE_GET_FAIL,
      payload: error.response?.data?.message || 'Failed to fetch profile',
    });
    dispatch(setAlert(error.response?.data?.message || 'Failed to fetch profile', 'danger'));
  }
};

// 2. Update Profile
export const updateProfile = (formData) => async (dispatch) => {
  try {
    const res = await axios.put(
      `${API_URL}`,
      formData,
      getAuthConfig()
    );
    dispatch({
      type: PROFILE_UPDATE_SUCCESS,
      payload: res.data.data.user,
    });
    dispatch(setAlert('Profile updated successfully', 'success'));
  } catch (error) {
    dispatch({
      type: PROFILE_UPDATE_FAIL,
      payload: error.response?.data?.message || 'Failed to update profile',
    });
    dispatch(setAlert(error.response?.data?.message || 'Failed to update profile', 'danger'));
  }
};

// 3. Join Company (Drivers only)
export const joinCompany = (inviteCode) => async (dispatch) => {
  try {
    const res = await axios.post(
      `${API_URL}/join-company`,
      { invite_code: inviteCode },
      getAuthConfig()
    );
    dispatch({
      type: PROFILE_JOIN_COMPANY_SUCCESS,
      payload: res.data.message,
    });
    dispatch(setAlert(res.data.message, 'success'));
    // Refresh profile after joining
    dispatch(getProfile());
  } catch (error) {
    dispatch({
      type: PROFILE_JOIN_COMPANY_FAIL,
      payload: error.response?.data?.message || 'Failed to join company',
    });
    dispatch(setAlert(error.response?.data?.message || 'Failed to join company', 'danger'));
  }
};

// 4. Generate Invite Code (Company Owners/Admins)
export const generateInvite = (companyId = null) => async (dispatch) => {
  try {
    const body = companyId ? { company_id: companyId } : {};
    const res = await axios.post(
      `${API_URL}/generate-invite`,
      body,
      getAuthConfig()
    );
    dispatch({
      type: PROFILE_GENERATE_INVITE_SUCCESS,
      payload: res.data.data.invite_code,
    });
    dispatch(setAlert('Invite code generated successfully', 'success'));
  } catch (error) {
    dispatch({
      type: PROFILE_GENERATE_INVITE_FAIL,
      payload: error.response?.data?.message || 'Failed to generate invite code',
    });
    dispatch(setAlert(error.response?.data?.message || 'Failed to generate invite code', 'danger'));
  }
};