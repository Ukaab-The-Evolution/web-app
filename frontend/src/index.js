import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import './index.css';
import store from './store';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl= process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey= process.env.REACT_APP_SUPABASE_KEY;
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,{
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
}
);
//supabase.from('your_table').select('*').then(console.log).catch(console.error);

//components
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import RoleSelection from './components/layout/RoleSelection';
import OTPVerification from "./components/auth/OTPVerification";
import AuthCallback from './components/auth/AuthCallback';
import ResetPassword from "./components/auth/ResetPassword";

// Providers
import SupabaseAuthProvider from './components/providers/SupabaseAuthProvider';


import DashboardLayout from './components/layout/DashboardLayout';
import Shipments from './components/dashboard/shipments/Shipments';
import LoadRequest from './components/dashboard/loadRequest/LoadRequest';
import Profile from './components/dashboard/profile/Profile';
import Settings from './components/dashboard/settings/Settings';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <SupabaseAuthProvider>
      <Router>
        <Routes>
          <Route exact path='/' element={<Landing />} />
          <Route exact path='/login' element={<Login />} />
          <Route exact path='/register' element={<Register />} />
          <Route exact path='/forgot-password' element={<ForgotPassword />} />
          <Route exact path="/otp-verification" element={<OTPVerification />} />
          <Route exact path='/role-selection' element={<RoleSelection />} />
          <Route exact path='/auth/callback' element={<AuthCallback />} />
          <Route exact path="/reset-password" element={<ResetPassword />} />


            {/* Dashboard routes with shared layout */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            
            <Route path="shipments" element={<Shipments />} />
            <Route path="load-request" element={<LoadRequest />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

        </Routes>
      </Router>
      </SupabaseAuthProvider>
    </Provider>
  </React.StrictMode>
);
