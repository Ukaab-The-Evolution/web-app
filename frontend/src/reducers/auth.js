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
  token: localStorage.getItem('token'),
  isAuthenticated: null,
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
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: payload,
      };
    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
    case OTP_VERIFY_SUCCESS:
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
    case GOOGLE_AUTH_START:
      return {
        ...state,
        googleLoading: true,
      };
     
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
    

  case OTP_SEND_SUCCESS:
    return {
      ...state,
      otpEmail: payload.email,
      otpError: null,
    };
  case OTP_SEND_FAIL:
  case OTP_VERIFY_FAIL:
    return {
      ...state,
      otpError: payload,
    };
  case OTP_VERIFY_SUCCESS:
  case OTP_VERIFY_FAIL:
    return{
      ...state,
      otpEmail: null,
      otpError: null,
    }
  
    default:
      return state;
  
  }
}
