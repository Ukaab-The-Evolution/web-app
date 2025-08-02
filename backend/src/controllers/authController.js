import User from '../models/User.js';
import { signToken } from '../config/authUtils.js';
import AppError from '../utils/appError.js';
import jwt from 'jsonwebtoken';
import validator from 'validator';

export const signup = async (req, res, next) => {
  try {
    // Validate that either email or phone is provided
    if (!req.body.email && !req.body.phone) {
      return next(new AppError('Please provide either email or phone number', 400));
    }

    const newUser = await User.create(req.body);
    const token = signToken(newUser.user_id);
    
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          user_id: newUser.user_id,
          email: newUser.email,
          phone: newUser.phone, // Include phone in response
          user_type: newUser.user_type
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    // Check that either email or phone is provided with password
    if ((!email && !phone) || !password) {
      return next(new AppError('Please provide email/phone and password!', 400));
    }

    // Find user by email or phone
    const identifier = email || phone;
    const user = await User.findByEmailOrPhone(identifier);
    
    if (!user || !(await User.comparePassword(password, user.password_hash))) {
      return next(new AppError('Incorrect credentials', 401));
    }

    const token = signToken(user.user_id);
    
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          user_id: user.user_id,
          email: user.email,
          phone: user.phone, // Include phone in response
          user_type: user.user_type
        }
      }
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

    if (!token) {
      return next(new AppError('You are not logged in!', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return next(new AppError('User no longer exists!', 401));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
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
    const token = signToken(user.user_id);
    
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
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          user_id: user.user_id,
          email: user.email,
          user_type: user.user_type,
          full_name: user.full_name,
          phone: user.phone
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// export const forgotPassword = async (req, res, next) => {
//   try {
//     // 1. Get user based on email/username
//     const user = await User.findByEmailOrPhone(req.body.emailOrUsername);
//     if (!user) {
//       return next(new AppError('No user found with that email/username', 404));
//     }

//     // 2. Generate reset token
//     const resetToken = await User.createPasswordResetToken(user.user_id);

//     // 3. Send email with reset token (implementation depends on your email service)
//     // Example: await sendResetEmail(user.email, resetToken);
//     console.log(`Password reset token: ${resetToken}`); // For testing

//     res.status(200).json({
//       status: 'success',
//       message: 'Token sent to email!',
//       token: resetToken // Only for testing - remove in production
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// export const resetPassword = async (req, res, next) => {
//   try {
//     // 1. Get user based on token
//     const tokenDoc = await User.verifyPasswordResetToken(req.params.token);
//     if (!tokenDoc) {
//       return next(new AppError('Token is invalid or has expired', 400));
//     }

//     // 2. Get user
//     const user = await User.findById(tokenDoc.user_id);
//     if (!user) {
//       return next(new AppError('User no longer exists', 400));
//     }

//     // 3. Update password
//     await User.updatePassword(user.user_id, req.body.password);

//     // 4. Delete the token
//     await User.clearPasswordResetToken(tokenDoc.document_id);

//     // 5. Log the user in, send JWT
//     const token = signToken(user.user_id);
    
//     res.status(200).json({
//       status: 'success',
//       token
//     });
//   } catch (err) {
//     next(err);
//   }
// };