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
import AuthCallback from './components/auth/AuthCallback';

// Providers
import SupabaseAuthProvider from './components/providers/SupabaseAuthProvider';




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
          <Route exact path='/role-selection' element={<RoleSelection />} />
          <Route exact path='/auth/callback' element={<AuthCallback />} />

        </Routes>
      </Router>
      </SupabaseAuthProvider>
    </Provider>
  </React.StrictMode>
);
