import { combineReducers } from 'redux';
import auth from './auth';
import dashboardReducer from './dashboard';
export default combineReducers({
  auth,
  dashboard: dashboardReducer
});
