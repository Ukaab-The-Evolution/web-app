import supabase from '../../config/supabase.js';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import AppError from '../../utils/appError.js';
import validator from 'validator';
import { supabaseAdmin } from '../../config/supabase.js';
import catchAsync from '../../utils/catchAsync.js';
import { sendPasswordResetEmail } from '../../services/emailService.js';

export const signToken = (user_id, auth_user_id) => {
  return jwt.sign(
    { id: user_id, auth_user_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

export const signup = async (req, res, next) => {
  try {
    if (!req.body.email && !req.body.phone) {
      return next(new AppError('Please provide either email or phone number', 400));
    }

    // For trucking_company type, validate owns_company field
    if (req.body.user_type === 'trucking_company') {
      if (typeof req.body.owns_company !== 'boolean') {
        return next(new AppError('Please specify if you own the company or are an individual driver', 400));
      }
    }

    // Remove company-related fields that shouldn't be in users table
    const { company_name, company_address, fleet_size, ...userData } = req.body;

    // Create user with the enhanced User.create method
    const newUser = await User.create({
      ...userData
    });

    // Create auth user but don't activate yet (only for email users)
    if (req.body.email) {
      try {
        const { data: authUser, error } = await supabaseAdmin.auth.admin.createUser({
          email: req.body.email,
          user_metadata: { 
            app_user_id: newUser.user_id,
            user_type: newUser.user_type
          },
          email_confirm: false
        });

        if (!error && authUser) {
          await supabase
            .from('users')
            .update({ auth_user_id: authUser.id })
            .eq('user_id', newUser.user_id);
          newUser.auth_user_id = authUser.id;
        }
      } catch (authError) {
        console.error('Auth user creation failed:', authError);
      }
    }

    const token = signToken(newUser.user_id, newUser.auth_user_id);
    
    let message = 'User created. You can request OTP now.';
    
    // Special message for individual drivers in trucking company
    if (req.body.user_type === 'trucking_company' && !req.body.owns_company) {
      message = 'Driver account created. Please complete your profile with CNIC and join a company.';
    }
    
    res.status(201).json({
      status: 'success',
      message,
      data: { 
        user_id: newUser.user_id,
        user_type: newUser.user_type,
        needs_verification: true
      }
    });
  } catch (err) {
    next(err);
  }
};

// ... rest of the authController functions remain the same
export const login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return next(new AppError('Please provide email/phone and password!', 400));
    }

    const identifier = email || phone;
    const user = await User.findByEmailOrPhone(identifier);
    
    if (!user || !(await User.comparePassword(password, user.password_hash))) {
      return next(new AppError('Incorrect credentials', 401));
    }

    // Check if user is verified
    if (!user.is_verified) {
      return next(new AppError('Please verify your account before logging in', 401));
    }

    const token = signToken(user.user_id, user.auth_user_id);
    
    res.status(200).json({
      status: 'success',
      token,
      data: { user }
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) return next(new AppError('User no longer exists!', 401));

    if (currentUser.email && !currentUser.auth_user_id) {
      const authUserId = await User.getAuthUserId(currentUser.email);
      if (authUserId) {
        await supabase
          .from('users')
          .update({ auth_user_id: authUserId })
          .eq('user_id', currentUser.user_id);
        currentUser.auth_user_id = authUserId;
      }
    }

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
    const user = await User.findById(req.user.user_id);
    if (!(await User.comparePassword(req.body.currentPassword, user.password_hash))) {
      return next(new AppError('Current password is incorrect', 401));
    }

    await User.updatePassword(user.user_id, req.body.newPassword);
    const token = signToken(user.user_id, user.auth_user_id);
    
    res.status(200).json({
      status: 'success',
      token
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

    const user = await User.findByEmailOrPhone(email);
    
    if (!user) {
      // Return success to prevent email enumeration
      return res.status(200).json({ 
        status: 'success',
        message: 'If the email exists, a reset link will be sent'
      });
    }

    const resetToken = await User.createPasswordResetToken(user.user_id);
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    // Send email and handle potential failures
    await sendPasswordResetEmail(user.email, resetUrl);
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email'
    });
  } catch (err) {
    console.error('Password reset error:', err);
    
    // Don't reveal specific errors to client for security
    if (err.message.includes('email') || err.message.includes('send')) {
      return next(new AppError('Failed to send reset email. Please try again later.', 500));
    }
    
    next(err);
  }
});

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    
    if (!token || !newPassword) {
      return next(new AppError('Token and new password are required', 400));
    }

    const tokenDoc = await User.verifyPasswordResetToken(token);
    if (!tokenDoc) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    await User.updatePassword(tokenDoc.user_id, newPassword);
    await User.invalidateResetToken(tokenDoc.token_id);

    const user = await User.findById(tokenDoc.user_id);
    const authToken = signToken(user.user_id, user.auth_user_id);
    
    res.status(200).json({
      status: 'success',
      token: authToken,
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

  const { email, phone, password, full_name } = req.body;

  // Validate inputs
  if (!email && !phone) {
    return next(new AppError('Please provide either email or phone number', 400));
  }

  // Create admin user
  const newUser = await User.create({ 
    email, 
    phone, 
    password, 
    user_type: 'admin', 
    full_name 
  });

  // Create auth user if email exists
  if (email) {
    try {
      const { data: authUser, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        user_metadata: { 
          app_user_id: newUser.user_id,
          user_type: 'admin'
        }
      });

      if (!error && authUser) {
        await supabase
          .from('users')
          .update({ auth_user_id: authUser.id })
          .eq('user_id', newUser.user_id);
        newUser.auth_user_id = authUser.id;
      }
    } catch (authError) {
      console.error('Auth user creation failed:', authError);
    }
  }

  const token = signToken(newUser.user_id, newUser.auth_user_id);
  
  res.status(201).json({
    status: 'success',
    token,
    data: { user: newUser }
  });
});