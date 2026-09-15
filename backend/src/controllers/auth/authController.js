import validator from 'validator';
import { supabase, supabaseAdmin, createUserClient } from '../../config/supabase.js';
import { loadEnv } from '../../config/env.js';
import { normalizeRole } from '../../domain/validation.js';
import {
  buildSignupInput,
  validatePasswordStrength,
} from '../../services/authService.js';
import { buildLegacyUser } from '../../services/currentSchemaService.js';
import { extractBearerToken, requireRole } from '../../middleware/auth.js';
import { protect } from '../../middleware/protect.js';
import AppError from '../../utils/appError.js';

const config = loadEnv();
const internalError = (message, status = 500) => new AppError(message, status, { expose: false });

const cleanupApplicationRecords = async (userId) => {
  if (!userId) return;
  // Signup only creates one profile and one role record. Remove those records
  // in dependency order when provisioning fails after Auth has succeeded.
  await supabaseAdmin.from('drivers').delete().eq('user_id', userId);
  await supabaseAdmin.from('shippers').delete().eq('user_id', userId);
  await supabaseAdmin.from('trucking_companies').delete().eq('user_id', userId);
  await supabaseAdmin.from('shipper_companies').delete().eq('user_id', userId);
  await supabaseAdmin.from('profiles').delete().eq('user_id', userId);
};

const anonymizeApplicationRecords = async (userId) => {
  const { data: documents, error: documentLookupError } = await supabaseAdmin
    .from('documents').select('storage_path').eq('user_id', userId);
  if (documentLookupError) throw documentLookupError;
  const paths = (documents || []).map((document) => document.storage_path).filter(Boolean);
  if (paths.length) {
    const { error: storageError } = await supabaseAdmin.storage.from('documents').remove(paths);
    if (storageError) throw storageError;
  }
  const { error: documentDeleteError } = await supabaseAdmin.from('documents').delete().eq('user_id', userId);
  if (documentDeleteError) throw documentDeleteError;

  const { error: driverError } = await supabaseAdmin.from('drivers').update({
    cnic: null,
    license_number: null,
    experience_years: null,
    current_company: null,
    emergency_contact: null,
    emergency_contact_name: null,
    address: null,
  }).eq('user_id', userId);
  if (driverError) throw driverError;

  const { error: profileError } = await supabaseAdmin.from('profiles').update({
    full_name: `Deleted user ${userId}`,
    email: null,
    phone: null,
    avatar_url: null,
  }).eq('user_id', userId);
  if (profileError) throw profileError;
};

const getProfileAggregate = async (authUserId) => {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) return null;

  const [truckingCompanyResult, shipperCompanyResult, shipperResult, driverResult] = await Promise.all([
    supabaseAdmin.from('trucking_companies').select('*').eq('user_id', profile.user_id).maybeSingle(),
    supabaseAdmin.from('shipper_companies').select('*').eq('user_id', profile.user_id).maybeSingle(),
    supabaseAdmin.from('shippers').select('*').eq('user_id', profile.user_id).maybeSingle(),
    supabaseAdmin.from('drivers').select('*').eq('user_id', profile.user_id).maybeSingle(),
  ]);
  for (const result of [truckingCompanyResult, shipperCompanyResult, shipperResult, driverResult]) {
    if (result.error) throw result.error;
  }

  let company = truckingCompanyResult.data || shipperCompanyResult.data || null;
  if (!company && driverResult.data?.company_id) {
    const { data, error } = await supabaseAdmin.from('trucking_companies')
      .select('*').eq('company_id', driverResult.data.company_id).maybeSingle();
    if (error) throw error;
    company = data;
  }
  if (!company && shipperResult.data?.company_id) {
    const { data, error } = await supabaseAdmin.from('shipper_companies')
      .select('*').eq('company_id', shipperResult.data.company_id).maybeSingle();
    if (error) throw error;
    company = data;
  }
  return buildLegacyUser(profile, {
    company_id: driverResult.data?.company_id || company?.company_id || null,
    driver_id: driverResult.data?.driver_id || null,
    shipper_id: shipperResult.data?.shipper_id || null,
    driver: driverResult.data || null,
    company,
    organizations: company ? [{ company_id: company.company_id, company_name: company.company_name }] : [],
  });
};

const createApplicationRecords = async ({ authUser, input, userType }) => {
  const profilePayload = {
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
    let companyId = null;
    if (input.company_code) {
      const { data: company, error: companyLookupError } = await supabaseAdmin
        .from('trucking_companies')
        .select('company_id')
        .eq('invite_code', String(input.company_code).trim())
        .maybeSingle();
      if (companyLookupError) throw companyLookupError;
      if (!company) throw new AppError('Invalid trucking company invite code', 400);
      companyId = company.company_id;
    }

    const driverPayload = { user_id: profile.user_id, company_id: companyId };
    if (input.cnic) {
      const cnic = String(input.cnic).replace(/\D/g, '');
      if (cnic) driverPayload.cnic = cnic;
    }
    if (input.license_number) driverPayload.license_number = String(input.license_number).trim();
    const { error: driverError } = await supabaseAdmin
      .from('drivers')
      .insert(driverPayload);
    if (driverError) throw driverError;
    return profile;
  }

  const organizationName = input.organization_name?.trim()
    || `${profilePayload.full_name}'s Organization`;
  const companyPayload = {
    user_id: profile.user_id,
    company_name: organizationName,
    company_address: String(input.company_address || input.address || 'Not provided').trim(),
  };
  if (userType === 'trucking_company') {
    const fleetSize = Number(input.fleet_size || 1);
    if (!Number.isInteger(fleetSize) || fleetSize < 1) {
      throw new AppError('fleet_size must be a positive whole number', 400);
    }
    const { error: companyError } = await supabaseAdmin
      .from('trucking_companies')
      .insert({ ...companyPayload, fleet_size: fleetSize });
    if (companyError) throw companyError;
  } else {
    const { data: company, error: companyError } = await supabaseAdmin
      .from('shipper_companies')
      .insert({ ...companyPayload, tax_id: input.tax_id || null })
      .select('company_id')
      .single();
    if (companyError) throw companyError;

    const { error: shipperError } = await supabaseAdmin
      .from('shippers')
      .insert({ user_id: profile.user_id, company_id: company.company_id, is_primary: true });
    if (shipperError) throw shipperError;
  }
  return profile;
};

export const signup = async (req, res, next) => {
  let authUserId;
  let applicationUserId;
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

    const profile = await createApplicationRecords({ authUser: authData.user, input, userType: input.user_type });
    applicationUserId = profile.user_id;
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
    let cleanupUserId = applicationUserId;
    if (!cleanupUserId && authUserId) {
      const { data: createdProfile } = await supabaseAdmin.from('profiles')
        .select('user_id').eq('auth_user_id', authUserId).maybeSingle();
      cleanupUserId = createdProfile?.user_id;
    }
    try {
      await cleanupApplicationRecords(cleanupUserId);
    } catch {
      return next(internalError('Registration cleanup failed'));
    }
    if (authUserId) {
      await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(() => undefined);
    }
    if (error instanceof AppError && error.expose) return next(error);
    if (!authUserId && error instanceof Error) return next(new AppError(error.message, 400));
    return next(internalError('Registration failed'));
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
    return next(internalError('Login failed'));
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (token) {
      const { error } = await createUserClient(token).auth.signOut();
      if (error) return next(internalError('Logout failed'));
    }
    return res.status(200).json({ status: 'success', message: 'Signed out' });
  } catch (error) {
    return next(internalError('Logout failed'));
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
    if (error) return next(internalError('Failed to send reset link'));
    return res.status(200).json({ status: 'success', message: 'Password reset link sent' });
  } catch (error) {
    return next(internalError('Failed to send reset link'));
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) return next(new AppError('Recovery token is required', 401));
    try {
      validatePasswordStrength(req.body.newPassword);
    } catch (error) {
      return next(new AppError(error.message, 400));
    }

    const { error } = await createUserClient(token).auth.updateUser({
      password: req.body.newPassword,
    });
    if (error) return next(internalError('Failed to reset password'));
    return res.status(200).json({ status: 'success', message: 'Password updated successfully' });
  } catch (error) {
    return next(internalError('Failed to reset password'));
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    if (!req.body.currentPassword) {
      return next(new AppError('Current password is required', 400));
    }
    try {
      validatePasswordStrength(req.body.newPassword);
    } catch (error) {
      return next(new AppError(error.message, 400));
    }

    const identity = req.user.email
      ? { email: req.user.email, password: req.body.currentPassword }
      : { phone: req.user.phone, password: req.body.currentPassword };
    const { error: verifyError } = await supabase.auth.signInWithPassword(identity);
    if (verifyError) return next(new AppError('Current password is incorrect', 401));

    const token = extractBearerToken(req);
    const { error } = await createUserClient(token).auth.updateUser({ password: req.body.newPassword });
    if (error) return next(internalError('Failed to change password'));
    return res.status(200).json({ status: 'success', message: 'Password changed successfully' });
  } catch (error) {
    return next(internalError('Failed to change password'));
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    if (!req.body.currentPassword) return next(new AppError('Current password is required', 400));
    const identity = req.user.email
      ? { email: req.user.email, password: req.body.currentPassword }
      : { phone: req.user.phone, password: req.body.currentPassword };
    const { error: verifyError } = await supabase.auth.signInWithPassword(identity);
    if (verifyError) return next(new AppError('Current password is incorrect', 401));

    await anonymizeApplicationRecords(req.user.user_id);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(req.user.auth_user_id);
    if (error) return next(internalError('Failed to delete account'));
    return res.status(204).send();
  } catch (error) {
    return next(internalError('Failed to delete account'));
  }
};

export const restrictTo = (...roles) => requireRole(...roles);
export { protect };
