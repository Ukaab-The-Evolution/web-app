import {
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
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
};

function authReducer(state = initialState, action) {
  const { type, payload } = action;

  const persistAuth = (nextPayload = {}) => {
    if (nextPayload.token) localStorage.setItem('token', nextPayload.token);
    const role = nextPayload.user?.user_type;
    if (role) localStorage.setItem('userRole', role);
  };

  switch (type) {
    // User loaded (after token check)
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        supabaseUser: payload,
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
      };

    // Login and Supabase session: authenticate and store token
    case LOGIN_SUCCESS:
    case SUPABASE_SESSION_LOADED:
      persistAuth(payload);

      return {
        ...state,
        ...payload,
        supabaseUser: payload.user || state.supabaseUser,
        token: payload.token || state.token,
        isAuthenticated: true,
        loading: false,
        user: payload.user || state.user,
      };

    // Auth errors and failures: clear token and user
    case AUTH_ERROR:
    case LOGIN_FAIL:
    case REGISTER_FAIL:
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        supabaseUser: null,
      };

    // Logout and Supabase signout: clear everything
    case SUPABASE_SIGNOUT:
    case LOGOUT:
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        supabaseUser: null,
      };

    // Default: return current state
    default:
      return state;
  }
}

export default authReducer;
