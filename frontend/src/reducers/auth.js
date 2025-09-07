import {
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  OTP_SEND_SUCCESS,
  OTP_SEND_FAIL,
  OTP_VERIFY_SUCCESS,
  OTP_VERIFY_FAIL,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAIL,
  OTP_RESEND_SUCCESS,
  OTP_RESEND_FAIL,
  GOOGLE_AUTH_START,
  GOOGLE_AUTH_SUCCESS,
  GOOGLE_AUTH_FAIL,
  SUPABASE_SESSION_LOADED,
  SUPABASE_SIGNOUT,
} from '../actions/types';

const initialState = {
  token: null,
  isAuthenticated: null,
  registered: false,
  loading: true,
  user: null,
  supabaseUser: null,
  googleLoading: false,
  otpEmail: null,
  otpError: null,
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    // User loaded (after token check)
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: payload,
      };

    // Registration: user is created but not verified yet
    case REGISTER_SUCCESS:
      // Do NOT authenticate or store token yet
      return {
        ...state,
        loading: false,
        registered: true,
        isAuthenticated: false,
        user: null,
        token: null,
        otpEmail: payload?.email || null,
        otpError: null,
      };

    // OTP verification: user is now verified and authenticated
    case OTP_VERIFY_SUCCESS:
            localStorage.setItem('token', payload.token);
      return {
        ...state,
        ...payload,
        token: payload.token,
        isAuthenticated: true,
        registered: false,
        loading: false,
        otpEmail: null,
        otpError: null,
      };

    // Login, Google Auth, Supabase session: authenticate and store token
    case LOGIN_SUCCESS:
    case GOOGLE_AUTH_SUCCESS:
    case SUPABASE_SESSION_LOADED:
      localStorage.setItem('token', payload.token);
      return {
        ...state,
        ...payload,
        supabaseUser: payload.user,
        token: payload.token,
        isAuthenticated: true,
        loading: false,
        googleLoading: false,
      };

    // Google Auth loading
    case GOOGLE_AUTH_START:
      return {
        ...state,
        googleLoading: true,
      };

    // OTP send: store email for verification step
    case OTP_SEND_SUCCESS:
      return {
        ...state,
        otpEmail: payload.email,
        otpError: null,
      };

    // OTP send fail: store error
    case OTP_SEND_FAIL:
      return {
        ...state,
        otpError: payload,
      };

    // OTP verify fail: show error, keep email for retry
    case OTP_VERIFY_FAIL:
      return {
        ...state,
        otpError: payload,
      };

    // Auth errors and failures: clear token and user
    case AUTH_ERROR:
    case LOGIN_FAIL:
    case REGISTER_FAIL:
    case GOOGLE_AUTH_FAIL:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        supabaseUser: null,
        googleLoading: false,
      };

    // Logout and Supabase signout: clear everything
    case SUPABASE_SIGNOUT:
    case LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        supabaseUser: null,
        googleLoading: false,
      };

    // Default: return current state
    default:
      return state;
  }
}
