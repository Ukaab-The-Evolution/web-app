import { supabase } from '../lib/supabase';
import api, { buildAuthHeaders, normalizeApiError } from '../api/client';
import {
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  GOOGLE_AUTH_START,
  GOOGLE_AUTH_FAIL,
  SUPABASE_SESSION_LOADED,
  SUPABASE_SIGNOUT,
  OTP_SEND_FAIL,
  OTP_VERIFY_FAIL,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAIL,
} from './types';
import { setAlert } from './alert';

const authPath = '/api/v1/auth';

export const loadUser = () => async (dispatch) => {
  try {
    const response = await api.get(`${authPath}/me`);
    const user = response.data?.data?.user;
    dispatch({ type: USER_LOADED, payload: user });
    return user;
  } catch (error) {
    dispatch({ type: AUTH_ERROR });
    throw error;
  }
};

export const register = (formData, role) => async (dispatch) => {
  try {
    const response = await api.post(`${authPath}/signup`, {
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      password: formData.password,
      full_name: formData.name,
      user_type: role,
      organization_name: formData.companyname || formData.companyName || undefined,
      cnic: formData.cnic || undefined,
    });
    dispatch({ type: REGISTER_SUCCESS, payload: response.data?.data });
    dispatch(setAlert('Account created. Check your email to verify it.', 'success'));
    return response.data;
  } catch (error) {
    const message = normalizeApiError(error);
    dispatch({ type: REGISTER_FAIL, payload: message });
    dispatch(setAlert(message, 'danger'));
    throw error;
  }
};

export const login = (identifier, password) => async (dispatch) => {
  try {
    const response = await api.post(`${authPath}/login`, { identifier, password });
    const payload = {
      token: response.data?.token,
      user: response.data?.data,
    };
    dispatch({ type: LOGIN_SUCCESS, payload });
    dispatch(setAlert('Login successful!', 'success'));
    return payload.user;
  } catch (error) {
    const message = normalizeApiError(error);
    dispatch({ type: LOGIN_FAIL, payload: message });
    dispatch(setAlert(message, 'danger'));
    throw error;
  }
};

export const forgotPassword = (email) => async (dispatch) => {
  try {
    await api.post(`${authPath}/forgot-password`, { email });
    dispatch(setAlert('Password reset link sent', 'success'));
    return true;
  } catch (error) {
    const message = normalizeApiError(error);
    dispatch(setAlert(message, 'danger'));
    throw error;
  }
};

export const resetPassword = (token, newPassword, navigate) => async (dispatch) => {
  try {
    let accessToken = token || localStorage.getItem('token');
    if (!accessToken) {
      const { data } = await supabase.auth.getSession();
      accessToken = data.session?.access_token;
    }
    const response = await api.post(`${authPath}/reset-password`, { newPassword }, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    dispatch({ type: RESET_PASSWORD_SUCCESS, payload: response.data });
    dispatch(setAlert('Password updated successfully', 'success'));
    if (navigate) navigate('/login');
    return response.data;
  } catch (error) {
    const message = normalizeApiError(error);
    dispatch({ type: RESET_PASSWORD_FAIL, payload: message });
    dispatch(setAlert(message, 'danger'));
    throw error;
  }
};

export const loadSupabaseSession = () => async (dispatch) => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: AUTH_ERROR });
        return null;
      }
      return dispatch(loadUser());
    }

    localStorage.setItem('token', data.session.access_token);
    dispatch({
      type: SUPABASE_SESSION_LOADED,
      payload: { token: data.session.access_token },
    });
    return dispatch(loadUser());
  } catch (error) {
    dispatch({ type: AUTH_ERROR });
    return null;
  }
};

export const signInWithGoogle = () => async (dispatch) => {
  try {
    dispatch({ type: GOOGLE_AUTH_START });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  } catch (error) {
    dispatch({ type: GOOGLE_AUTH_FAIL, payload: error.message });
    dispatch(setAlert('Google authentication failed', 'danger'));
    throw error;
  }
};

export const handleAuthStateChange = (event, session) => async (dispatch) => {
  if (event === 'SIGNED_OUT') {
    dispatch({ type: SUPABASE_SIGNOUT });
    return;
  }
  if (!session) return;

  localStorage.setItem('token', session.access_token);
  dispatch({ type: SUPABASE_SESSION_LOADED, payload: { token: session.access_token } });
  try {
    await dispatch(loadUser());
  } catch (error) {
    dispatch({ type: AUTH_ERROR });
  }
};

export const signOutUser = () => async (dispatch) => {
  try {
    await api.post(`${authPath}/logout`, {}, { headers: buildAuthHeaders() });
    await supabase.auth.signOut();
    dispatch({ type: SUPABASE_SIGNOUT });
    dispatch(setAlert('Successfully signed out', 'success'));
  } catch (error) {
    dispatch(setAlert(normalizeApiError(error), 'danger'));
    throw error;
  }
};

export const sendOTP = () => async (dispatch) => {
  const message = 'Email verification is handled by Supabase. No OTP endpoint is configured.';
  dispatch({ type: OTP_SEND_FAIL, payload: message });
  throw new Error(message);
};

export const verifyOTP = () => async (dispatch) => {
  const message = 'Email verification is handled by Supabase. No OTP endpoint is configured.';
  dispatch({ type: OTP_VERIFY_FAIL, payload: message });
  throw new Error(message);
};
