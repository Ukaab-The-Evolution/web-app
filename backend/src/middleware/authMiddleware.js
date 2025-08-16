import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Only used for admin operations
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export const protect = async (req, res, next) => {
  try {
    // 1. Get token from headers or cookies
    const token = req.headers.authorization?.startsWith('Bearer') 
      ? req.headers.authorization.split(' ')[1]
      : req.cookies.jwt;

    if (!token) {
      return next(new AppError('Authentication required', 401));
    }

    // 2. Verify your application JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Get user from database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('User not found', 401));
    }

    // 4. Ensure we have a valid Supabase auth user
    if (!currentUser.auth_user_id) {
      // Create auth user if doesn't exist
      const { data: authUser, error } = await supabaseAdmin.auth.admin.createUser({
        email: currentUser.email,
        user_metadata: { app_user_id: currentUser._id }
      });

      if (error) throw error;
      currentUser.auth_user_id = authUser.id;
      await currentUser.save();
    }

    // 5. Generate a short-lived Supabase token for this user
    const { data: { access_token }, error: tokenError } = 
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: currentUser.email,
        options: {
          redirectTo: process.env.SUPABASE_REDIRECT_URL || 'http://localhost:3001'
        }
      });

    if (tokenError) throw tokenError;

    // 6. Attach user data with both tokens
    req.user = {
      ...currentUser.toObject(),
      app_token: token, // Your application JWT
      supabase_token: access_token // Supabase-valid JWT
    };

    next();
  } catch (err) {
    next(new AppError('Authentication failed', 401));
  }
};
