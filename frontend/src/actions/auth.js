import axios from 'axios';
import { supabase } from '../index';

import {
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  // LOGOUT,
  // RESET_PASSWORD_SUCCESS,
  // RESET_PASSWORD_FAILURE,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  GOOGLE_AUTH_START,
  GOOGLE_AUTH_SUCCESS,
  GOOGLE_AUTH_FAIL,
  SUPABASE_SESSION_LOADED,
  SUPABASE_SIGNOUT,

} from './types';
import { setAlert } from './alert';

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1/auth`;

export const loadUser = () => async (dispatch) => {
  if (localStorage.token) {
    axios.defaults.headers.common['Authorization'] = localStorage.token;
  }

  try {
    const res = await axios.get(API_URL);
    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

export const register =
  (formData, role) =>
  async (dispatch) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const body = JSON.stringify({ 
      email: formData.email, 
      phone: formData.phone, 
      password: formData.password,  
      full_name: formData.full_name,
      user_type: role
    });
    try {
      const res = await axios.post(`${API_URL}/signup`, body, config);
      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data,
      });
      dispatch(sendOTP(formData.email));
      
      
      // Load user after successful registration
    } catch (err) {
      const errors = err.response.data.errors;
      if (errors) {
        errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
      }
      dispatch({
        type: REGISTER_FAIL,
      });
    }
  };

// Login User
export const login = (email, password) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const body = JSON.stringify({ email, password });
  try {
    const res = await axios.post(`${API_URL}/login`, body, config);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });
    dispatch(loadUser()); 
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: LOGIN_FAIL,
    });
  }
};

//forgot password
export const forgotPassword = (email) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const body = JSON.stringify({ email });
  try {
    const res = await axios.post(
      `${API_URL}/forgotPassword`,
      body,
      config
    );
    dispatch(setAlert('Password reset link sent', 'success'));
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }
  }
};

// Load Supabase session on app start
export const loadSupabaseSession = () => async (dispatch) => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    if (session) {
      dispatch({
        type: SUPABASE_SESSION_LOADED,
        payload: {
          user: session.user,
          token: session.access_token,
        },
      });
    }
  } catch (error) {
    console.error('Error loading session:', error);
  }
};

// Google OAuth sign in
export const signInWithGoogle = () => async (dispatch) => {
  try {
    dispatch({ type: GOOGLE_AUTH_START });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;

    // OAuth redirect will handle the rest
  } catch (error) {
    console.error('Google OAuth error:', error);
    dispatch({
      type: GOOGLE_AUTH_FAIL,
      payload: error.message,
    });
    dispatch(setAlert('Google authentication failed', 'danger'));
  }
};

// Handle auth state changes
export const handleAuthStateChange = (event, session) => async (dispatch) => {
  try {
    if (event === 'SIGNED_IN' && session) {
      // Create or update user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profile && !profileError) {
        // Create new profile for first-time Google user
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: session.user.id,
              email: session.user.email,
              name:
                session.user.user_metadata.full_name ||
                session.user.user_metadata.name,
              avatar_url: session.user.user_metadata.avatar_url,
              provider: 'google',
              created_at: new Date().toISOString(),
            },
          ]);

        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }

      dispatch({
        type: GOOGLE_AUTH_SUCCESS,
        payload: {
          user: session.user,
          token: session.access_token,
        },
      });

      dispatch(setAlert('Successfully signed in with Google', 'success'));
    } else if (event === 'SIGNED_OUT') {
      dispatch({ type: SUPABASE_SIGNOUT });
    }
  } catch (error) {
    console.error('Auth state change error:', error);
    dispatch({
      type: GOOGLE_AUTH_FAIL,
      payload: error.message,
    });
  }
};

// Sign out
export const signOutUser = () => async (dispatch) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    dispatch({ type: SUPABASE_SIGNOUT });
    dispatch(setAlert('Successfully signed out', 'success'));
  } catch (error) {
    dispatch(setAlert('Error signing out', 'danger'));
  }
};

// Send OTP for registration
export const resendOTP = (email) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const body = JSON.stringify({
    email,
  });

  try {

    const res = await axios.post('/api/resendOtp', body, config);
    dispatch({
      type: OTP_SEND_SUCCESS,
      payload: res.data,
    });
    
    dispatch(setAlert('OTP sent to your email', 'success'));

  } catch (err) {
    const errors = err.response?.data?.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    } else {
      dispatch(setAlert(err.response?.data?.message || 'Failed to send OTP', 'danger'));
    }

    dispatch({
      type: OTP_SEND_FAIL,
      payload: err.response?.data?.message || 'Failed to send OTP',
    });

  }
};

// Verify OTP and complete registration
export const verifyOTP = (formdata, otp) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const body = JSON.stringify({ formdata, otp });

  try {

    const res = await axios.post('/api/verifyOtp', body, config);

    dispatch({
      type: OTP_VERIFY_SUCCESS,
      payload: res.data,
    });

    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });

    dispatch(setAlert('Registration completed successfully!', 'success'));
    dispatch(loadUser());


  } catch (err) {
    const errors = err.response?.data?.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    } else {
      dispatch(setAlert(err.response?.data?.message || 'Invalid or expired OTP', 'danger'));
    }

    dispatch({
      type: OTP_VERIFY_FAIL,
      payload: err.response?.data?.message || 'OTP verification failed',
    });

  }
};

