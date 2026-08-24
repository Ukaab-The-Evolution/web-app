import validator from 'validator';
import { supabase, supabaseAdmin, createUserClient } from '../../config/supabase.js';
import { loadEnv } from '../../config/env.js';
import { normalizeRole } from '../../domain/validation.js';
import {
  buildCanonicalUser,
  buildSignupInput,
  validatePasswordStrength,
} from '../../services/authService.js';
import { extractBearerToken, requireRole } from '../../middleware/auth.js';
import { protect } from '../../middleware/protect.js';
import AppError from '../../utils/appError.js';

const config = loadEnv();

const getProfileAggregate = async (authUserId) => {
  let { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (!profile && !profileError) {
    const fallback = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', authUserId)
      .maybeSingle();
    profile = fallback.data;
    profileError = fallback.error;
  }

  if (profileError) throw profileError;
  if (!profile) return null;

  const { data: organizations, error: organizationError } = await supabaseAdmin
    .from('organization_members')
    .select('organization_id, member_role, organizations(id, name, kind)')
    .eq('user_id', profile.user_id);

  if (organizationError) throw organizationError;
  return buildCanonicalUser(profile, organizations || []);
};

const createApplicationRecords = async ({ authUser, input, userType }) => {
  const profilePayload = {
    user_id: authUser.id,
    auth_user_id: authUser.id,
    email: authUser.email || input.email || null,
    phone: authUser.phone || input.phone || null,
    full_name: input.full_name?.trim() || authUser.user_metadata?.full_name || 'User',
    user_type: userType,
  };

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert(profilePayload)
    .select('*')
    .single();

  if (profileError) throw profileError;

  if (userType === 'driver') {
    const { error: driverError } = await supabaseAdmin
      .from('drivers')
      .insert({ user_id: profile.user_id });
    if (driverError) throw driverError;
    return profile;
  }

  const organizationName = input.organization_name?.trim()
    || `${profilePayload.full_name}'s Organization`;
  const { data: organization, error: organizationError } = await supabaseAdmin
    .from('organizations')
    .insert({
      name: organizationName,
      kind: userType,
      owner_user_id: profile.user_id,
    })
    .select('*')
    .single();

  if (organizationError) throw organizationError;

  const { error: membershipError } = await supabaseAdmin
    .from('organization_members')
    .insert({
      organization_id: organization.id,
      user_id: profile.user_id,
      member_role: 'owner',
    });

  if (membershipError) throw membershipError;
  return profile;
};

export const signup = async (req, res, next) => {
  let authUserId;
  try {
    const input = {
      ...req.body,
      user_type: normalizeRole(req.body.user_type),
      organization_name: req.body.organization_name || req.body.company_name || req.body.companyname,
    };
    const signupInput = buildSignupInput(input);

    const { data: authData, error: authError } = await supabase.auth.signUp(signupInput);
    if (authError || !authData.user) {
      return next(new AppError(authError?.message || 'Failed to create authentication user', 400));
    }
    authUserId = authData.user.id;

    await createApplicationRecords({ authUser: authData.user, input, userType: input.user_type });
    const user = await getProfileAggregate(authUserId);

    return res.status(201).json({
      status: 'success',
      message: 'Account created. Verify your email before signing in.',
      data: {
        user,
        session: authData.session,
        needs_verification: !authData.session,
      },
    });
  } catch (error) {
    if (authUserId) {
      await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(() => undefined);
    }
    return next(new AppError(error.message || 'Registration failed', 400));
  }
};

export const login = async (req, res, next) => {
  try {
    const identifier = req.body.email || req.body.phone || req.body.identifier;
    const password = req.body.password;
    if (!identifier || !password) {
      return next(new AppError('Email/phone and password are required', 400));
    }

    const credentials = validator.isEmail(identifier)
      ? { email: identifier.trim().toLowerCase(), password }
      : { phone: identifier.trim(), password };
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword(credentials);
    if (authError || !authData.user) {
      return next(new AppError(authError?.message || 'Login failed', 401));
    }

    const user = await getProfileAggregate(authData.user.id);
    if (!user) return next(new AppError('Application profile not found', 401));

    return res.status(200).json({
      status: 'success',
      token: authData.session?.access_token,
      data: user,
    });
  } catch (error) {
    return next(new AppError(error.message || 'Login failed', 401));
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (token) {
      const { error } = await createUserClient(token).auth.signOut();
      if (error) return next(new AppError(error.message, 400));
    }
    return res.status(200).json({ status: 'success', message: 'Signed out' });
  } catch (error) {
    return next(new AppError(error.message || 'Logout failed', 400));
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email || !validator.isEmail(email)) {
      return next(new AppError('A valid email is required', 400));
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${config.frontendUrl}/reset-password`,
    });
    if (error) return next(new AppError(error.message, 400));
    return res.status(200).json({ status: 'success', message: 'Password reset link sent' });
  } catch (error) {
    return next(new AppError(error.message || 'Failed to send reset link', 400));
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) return next(new AppError('Recovery token is required', 401));
    validatePasswordStrength(req.body.newPassword);

    const { error } = await createUserClient(token).auth.updateUser({
      password: req.body.newPassword,
    });
    if (error) return next(new AppError(error.message, 400));
    return res.status(200).json({ status: 'success', message: 'Password updated successfully' });
  } catch (error) {
    return next(new AppError(error.message || 'Failed to reset password', 400));
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    if (!req.body.currentPassword) {
      return next(new AppError('Current password is required', 400));
    }
    validatePasswordStrength(req.body.newPassword);

    const identity = req.user.email
      ? { email: req.user.email, password: req.body.currentPassword }
      : { phone: req.user.phone, password: req.body.currentPassword };
    const { error: verifyError } = await supabase.auth.signInWithPassword(identity);
    if (verifyError) return next(new AppError('Current password is incorrect', 401));

    const token = extractBearerToken(req);
    const { error } = await createUserClient(token).auth.updateUser({ password: req.body.newPassword });
    if (error) return next(new AppError(error.message, 400));
    return res.status(200).json({ status: 'success', message: 'Password changed successfully' });
  } catch (error) {
    return next(new AppError(error.message || 'Failed to change password', 400));
  }
};

export const restrictTo = (...roles) => requireRole(...roles);
export { protect };
