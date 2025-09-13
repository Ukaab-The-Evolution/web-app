import supabase from '../../config/supabase.js';
import User from '../../models/User.js';
import AppError from '../../utils/appError.js';
import validator from 'validator';
import { supabaseAdmin } from '../../config/supabase.js';
import catchAsync from '../../utils/catchAsync.js';

export const signup = async (req, res, next) => {
  try {
    const { email, password, user_type, full_name, phone, owns_company, cnic } = req.body;

    if (!email && !phone) {
      return next(new AppError('Please provide either email or phone number', 400));
    }

    // For trucking_company type, validate owns_company field
    if (user_type === 'trucking_company') {
      if (typeof owns_company !== 'boolean') {
        return next(new AppError('Please specify if you own the company or are an individual driver', 400));
      }
    }

    // Validate password strength
    if (!validator.isStrongPassword(password, { 
      minLength: 8, 
      minLowercase: 1, 
      minUppercase: 1, 
      minNumbers: 1, 
      minSymbols: 1 
    })) {
      return next(new AppError('Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol', 400));
    }

    // Use Supabase Auth for signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          user_type: user_type,
          full_name: full_name,
          phone: phone,
          owns_company: owns_company,
          cnic: cnic
        }
      }
    });

    if (authError) {
      return next(new AppError(authError.message, 400));
    }

    if (!authData.user) {
      return next(new AppError('Failed to create user', 500));
    }

    // Create user profile in our database
    const newUser = await User.create({
      email: email,
      phone: phone,
      user_type: user_type,
      full_name: full_name,
      owns_company: owns_company,
      cnic: cnic,
      auth_user_id: authData.user.id
    });

    let message = 'User created successfully. Please check your email to verify your account.';
    
    // Special message for individual drivers in trucking company
    if (user_type === 'trucking_company' && !owns_company) {
      message = 'Driver account created. Please check your email to verify your account and complete your profile with CNIC.';
    }
    
    res.status(201).json({
      status: 'success',
      message,
      data: { 
        user_id: newUser.user_id,
        user_type: newUser.user_type,
        needs_verification: true,
        session: authData.session
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    // Use Supabase Auth for login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (authError) {
      return next(new AppError(authError.message, 401));
    }

    if (!authData.user) {
      return next(new AppError('Login failed', 401));
    }

    // Get user from our database
    const user = await User.findByEmailOrPhone(email);
    
    if (!user) {
      return next(new AppError('User not found in database', 401));
    }
    
    res.status(200).json({
      status: 'success',
      token: authData.session.access_token,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next(new AppError('Not logged in!', 401));

    // Verify token with Supabase
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
    
    if (error || !authUser) {
      return next(new AppError('Invalid or expired token', 401));
    }

    // Get user from our database
    const currentUser = await User.findByEmailOrPhone(authUser.email);
    
    if (!currentUser) return next(new AppError('User not found in database!', 401));

    req.user = {
      _id: currentUser.user_id,
      user_id: currentUser.user_id,
      auth_user_id: currentUser.auth_user_id,
      email: currentUser.email,
      user_type: currentUser.user_type
    };

    // Add role-specific IDs
    if (currentUser.user_type === 'shipper') {
      const { data: shipper } = await supabase
        .from('shippers')
        .select('shipper_id')
        .eq('user_id', currentUser.user_id)
        .single();
      
      if (shipper) {
        req.user.shipper_id = shipper.shipper_id;
      }
    } else if (currentUser.user_type === 'driver') {
      const { data: driver } = await supabase
        .from('drivers')
        .select('driver_id, company_id')
        .eq('user_id', currentUser.user_id)
        .single();
      
      if (driver) {
        req.user.driver_id = driver.driver_id;
        req.user.company_id = driver.company_id;
      }
    } else if (currentUser.user_type === 'trucking_company') {
      const { data: company } = await supabase
        .from('trucking_companies')
        .select('company_id')
        .eq('user_id', currentUser.user_id)
        .single();
      
      if (company) {
        req.user.company_id = company.company_id;
      }
    }

    next();
  } catch (err) {
    next(new AppError('Authentication failed', 401));
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.user_type)) {
      return next(new AppError('Unauthorized action!', 403));
    }
    next();
  };
};

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new AppError('Authentication required', 401));
    }

    // Use Supabase Auth to update password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return next(new AppError(error.message, 400));
    }

    // Update password in our database as well
    await User.updatePassword(req.user.user_id, newPassword);
    
    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.user_id);
    
    let responseData = {
      user_id: user.user_id,
      email: user.email,
      user_type: user.user_type,
      full_name: user.full_name,
      phone: user.phone,
      auth_user_id: user.auth_user_id
    };

    // Add company details if trucking company
    if (user.user_type === 'trucking_company') {
      const { data: companyData } = await supabase
        .from('trucking_companies')
        .select('*')
        .eq('user_id', user.user_id)
        .single();
      responseData.company = companyData;
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: responseData
      }
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    // Use Supabase Auth for password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      return next(new AppError(error.message, 400));
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email'
    });
  } catch (err) {
    console.error('Password reset error:', err);
    next(err);
  }
});

export const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token || !newPassword) {
      return next(new AppError('Token and new password are required', 400));
    }

    // Use Supabase Auth to update password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return next(new AppError(error.message, 400));
    }

    // Update password in our database as well
    const user = await User.findByEmailOrPhone(data.user.email);
    if (user) {
      await User.updatePassword(user.user_id, newPassword);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

export const createAdmin = catchAsync(async (req, res, next) => {
  // Only allow existing admins to create new admins
  if (req.user?.user_type !== 'admin') {
    return next(new AppError('Unauthorized', 403));
  }

  const { email, password, full_name } = req.body;

  // Validate inputs
  if (!email) {
    return next(new AppError('Email is required for admin users', 400));
  }

  // Use Supabase Auth for admin creation
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    user_metadata: { 
      user_type: 'admin',
      full_name: full_name
    },
    email_confirm: true // Auto-confirm admin emails
  });

  if (authError) {
    return next(new AppError(authError.message, 400));
  }

  // Create admin user profile in our database
  const newUser = await User.create({ 
    email, 
    user_type: 'admin', 
    full_name,
    auth_user_id: authData.user.id
  });
  
  res.status(201).json({
    status: 'success',
    data: { user: newUser }
  });
});

// // New function to handle email verification
// export const verifyEmail = async (req, res, next) => {
//   try {
//     const { token_hash, type } = req.query;

//     if (!token_hash || !type) {
//       return next(new AppError('Token and type are required', 400));
//     }

//     // Use Supabase Auth to verify email
//     const { data, error } = await supabase.auth.verifyOtp({
//       token_hash,
//       type
//     });

//     if (error) {
//       return next(new AppError(error.message, 400));
//     }

//     // User verification is now handled by Supabase Auth
//     // No need to update verification status in our database

//     res.status(200).json({
//       status: 'success',
//       message: 'Email verified successfully',
//       session: data.session
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // New function to resend verification email
// export const resendVerification = async (req, res, next) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return next(new AppError('Email is required', 400));
//     }

//     // Use Supabase Auth to resend verification
//     const { error } = await supabase.auth.resend({
//       type: 'signup',
//       email: email
//     });

//     if (error) {
//       return next(new AppError(error.message, 400));
//     }

//     res.status(200).json({
//     status: 'success',
//       message: 'Verification email sent'
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// New function to logout
export const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      await supabase.auth.signOut();
    }

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (err) {
    next(err);
  }
};