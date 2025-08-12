import {
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAIL,
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
      localStorage.setItem('token', payload.token);
      return {
        ...state,
        ...payload,
        isAuthenticated: true,
        loading: false,
      };
    case GOOGLE_AUTH_START:
      return {
        ...state,
        googleLoading: true,
      };
    case GOOGLE_AUTH_SUCCESS:
    case SUPABASE_SESSION_LOADED:
      return {
        ...state,
        supabaseUser: payload.user,
        token: payload.token,
        isAuthenticated: true,
        loading: false,
        googleLoading: false,
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
    default:
      return state;
  }
}
