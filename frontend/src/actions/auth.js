import axios from 'axios';

import {
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  RESET_PASSWORD,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
} from './types';
import { setAlert } from './alert';

export const loadUser = () => async (dispatch) => {
  if (localStorage.token) {
    axios.defaults.headers.common['Authorization'] = localStorage.token;
  }

  try {
    const res = await axios.get('/api/auth');
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
