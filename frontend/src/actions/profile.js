import api, { normalizeApiError } from '../api/client';
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

const API_URL = '/api/v1/profile';

// 1. Get Profile
export const getProfile = () => async (dispatch) => {
  try {
    const res = await api.get(API_URL);
    dispatch({
      type: PROFILE_GET_SUCCESS,
      payload: res.data.data.user,
    });
  } catch (error) {
    dispatch({
      type: PROFILE_GET_FAIL,
      payload: error.response?.data?.message || 'Failed to fetch profile',
    });
    const message = normalizeApiError(error);
    dispatch(setAlert(message, 'danger'));
    throw error;
  }
};

// 2. Update Profile
export const updateProfile = (formData) => async (dispatch) => {
  try {
    const res = await api.patch(
      API_URL,
      formData,
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
    const message = normalizeApiError(error);
    dispatch(setAlert(message, 'danger'));
    throw error;
  }
};

// 3. Join Company (Drivers only)
export const joinCompany = (inviteCode) => async (dispatch) => {
  try {
    const res = await api.post(
      `${API_URL}/join-company`,
      { invite_code: inviteCode },
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
    const message = normalizeApiError(error);
    dispatch(setAlert(message, 'danger'));
    throw error;
  }
};

// 4. Generate Invite Code (Company Owners/Admins)
export const generateInvite = (companyId = null) => async (dispatch) => {
  try {
    const body = companyId ? { company_id: companyId } : {};
    const res = await api.post(
      `${API_URL}/generate-invite-code`,
      body,
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
    const message = normalizeApiError(error);
    dispatch(setAlert(message, 'danger'));
    throw error;
  }
};
