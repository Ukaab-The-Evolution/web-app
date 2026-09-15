import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import './index.css';
import store from './store';

//components
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import RoleSelection from './components/layout/RoleSelection';
import ResetPassword from "./components/auth/ResetPassword";
import SignupConfirmation from './components/auth/SignupConfirmation';

// Providers
import SupabaseAuthProvider from './components/providers/SupabaseAuthProvider';

import DashboardLayout from './components/layout/DashboardLayout';
import Shipments from './components/dashboard/shipments/Shipments';
import ShipmentDetails from './components/dashboard/shipments/ShipmentDetails';
import LoadRequest from './components/dashboard/loadRequest/LoadRequest';
import TruckingCompanyDashboard from './components/dashboard/dashboard/TruckingCompanyDashboard';
import ProfileLayout from './components/layout/ProfileLayout';
import Settings from './components/dashboard/settings/Settings';
import ChangePassword from './components/dashboard/settings/ChangePassword';
import Toast from './components/ui/Toast';

export { supabase } from './lib/supabase';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <SupabaseAuthProvider>
      <Router>
        <Toast />
        <Routes>
          <Route exact path='/' element={<Landing />} />
          <Route exact path='/login' element={<Login />} />
          <Route exact path='/register' element={<Register />} />
          <Route exact path="/signup-confirmation" element={<SignupConfirmation />} />
          <Route exact path='/forgot-password' element={<ForgotPassword />} />
          <Route exact path='/role-selection' element={<RoleSelection />} />
          <Route exact path="/reset-password" element={<ResetPassword />} />


            {/* Dashboard routes with shared layout */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            
            <Route path="shipments" element={<Shipments />} />
            <Route path="load-requests" element={<Shipments />} />
            <Route path="accepted-loads" element={<Shipments />} />
            <Route path="orders" element={<Shipments />} />
            <Route path="fleet" element={<TruckingCompanyDashboard />} />
            <Route path="shipment-details/:id" element={<ShipmentDetails />} />
            <Route path="load-request" element={<LoadRequest />} />
            <Route path="profile" element={<ProfileLayout />} />
            <Route path="settings" element={<Settings />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

        </Routes>
      </Router>
      </SupabaseAuthProvider>
    </Provider>
  </React.StrictMode>
);
