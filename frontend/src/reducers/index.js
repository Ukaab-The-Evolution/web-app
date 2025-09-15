import { combineReducers } from 'redux';
import auth from './auth';
import alert from './alert';
import dashboardReducer from './dashboard';
import profile from './profile';
export default combineReducers({
  auth,
  alert,
  dashboard: dashboardReducer,
  profile
});
