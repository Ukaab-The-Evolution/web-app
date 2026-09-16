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
import { logAuthError, logAuthEvent } from '../../utils/authLogger.js';

const config = loadEnv();
const internalError = (message, status = 500) => new AppError(message, status, { expose: false });

const cleanupApplicationRecords = async (userId) => {
  if (!userId) {
    logAuthEvent('signup.rollback.skipped', {
      phase: 'cleanup',
      operation: 'application_records',
    });
    return;
  }

  logAuthEvent('signup.rollback.started', { applicationUserId: userId });
  // Signup only creates one profile and one role record. Remove those records
  // in dependency order when provisioning fails after Auth has succeeded.
  for (const table of ['drivers', 'shippers', 'trucking_companies', 'shipper_companies', 'profiles']) {
    logAuthEvent('signup.rollback.delete_started', { table, applicationUserId: userId });
    const { error } = await supabaseAdmin.from(table).delete().eq('user_id', userId);
    if (error) {
      logAuthError('signup.rollback.delete_failed', error, { table, applicationUserId: userId });
      throw error;
    }
    logAuthEvent('signup.rollback.delete_succeeded', { table, applicationUserId: userId });
  }
  logAuthEvent('signup.rollback.completed', { applicationUserId: userId });
};

const anonymizeApplicationRecords = async (userId) => {
  logAuthEvent('account.anonymization.started', { applicationUserId: userId });
  const { data: documents, error: documentLookupError } = await supabaseAdmin
    .from('documents').select('storage_path').eq('user_id', userId);
  if (documentLookupError) {
    logAuthError('account.anonymization.documents_lookup_failed', documentLookupError, {
      table: 'documents',
      applicationUserId: userId,
    });
    throw documentLookupError;
  }
  const paths = (documents || []).map((document) => document.storage_path).filter(Boolean);
  if (paths.length) {
    const { error: storageError } = await supabaseAdmin.storage.from('documents').remove(paths);
    if (storageError) {
      logAuthError('account.anonymization.storage_delete_failed', storageError, {
        operation: 'storage.remove',
        applicationUserId: userId,
      });
      throw storageError;
    }
    logAuthEvent('account.anonymization.storage_deleted', {
      operation: 'storage.remove',
      applicationUserId: userId,
      resultCount: paths.length,
    });
  }
  const { error: documentDeleteError } = await supabaseAdmin.from('documents').delete().eq('user_id', userId);
  if (documentDeleteError) {
    logAuthError('account.anonymization.documents_delete_failed', documentDeleteError, {
      table: 'documents',
      applicationUserId: userId,
    });
    throw documentDeleteError;
  }
  logAuthEvent('account.anonymization.documents_deleted', {
    table: 'documents',
    applicationUserId: userId,
  });

  const { error: driverError } = await supabaseAdmin.from('drivers').update({
    cnic: null,
    license_number: null,
    experience_years: null,
    current_company: null,
    emergency_contact: null,
    emergency_contact_name: null,
    address: null,
  }).eq('user_id', userId);
  if (driverError) {
    logAuthError('account.anonymization.driver_update_failed', driverError, {
      table: 'drivers',
      applicationUserId: userId,
    });
    throw driverError;
  }
  logAuthEvent('account.anonymization.driver_updated', {
    table: 'drivers',
    applicationUserId: userId,
  });

  const { error: profileError } = await supabaseAdmin.from('profiles').update({
    full_name: `Deleted user ${userId}`,
    email: null,
    phone: null,
    avatar_url: null,
  }).eq('user_id', userId);
  if (profileError) {
    logAuthError('account.anonymization.profile_update_failed', profileError, {
      table: 'profiles',
      applicationUserId: userId,
    });
    throw profileError;
  }
  logAuthEvent('account.anonymization.completed', {
    table: 'profiles',
    applicationUserId: userId,
  });
};

const getProfileAggregate = async (authUserId) => {
  logAuthEvent('profile_aggregate.profile_lookup_started', { authUserId });
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();
  if (profileError) {
    logAuthError('profile_aggregate.profile_lookup_failed', profileError, {
      table: 'profiles',
      authUserId,
    });
    throw profileError;
  }
  if (!profile) {
    logAuthEvent('profile_aggregate.profile_not_found', { table: 'profiles', authUserId });
    return null;
  }
  logAuthEvent('profile_aggregate.profile_lookup_succeeded', {
    table: 'profiles',
    authUserId,
    applicationUserId: profile.user_id,
  });

  const relatedLookups = [
    ['trucking_companies', 'trucking_company', supabaseAdmin.from('trucking_companies').select('*').eq('user_id', profile.user_id).maybeSingle()],
    ['shipper_companies', 'shipper_company', supabaseAdmin.from('shipper_companies').select('*').eq('user_id', profile.user_id).maybeSingle()],
    ['shippers', 'shipper', supabaseAdmin.from('shippers').select('*').eq('user_id', profile.user_id).maybeSingle()],
    ['drivers', 'driver', supabaseAdmin.from('drivers').select('*').eq('user_id', profile.user_id).maybeSingle()],
  ];
  const relatedResults = await Promise.all(relatedLookups.map(async ([table, label, query]) => {
    const result = await query;
    if (result.error) {
      logAuthError(`profile_aggregate.${label}_lookup_failed`, result.error, {
        table,
        applicationUserId: profile.user_id,
      });
      throw result.error;
    }
    logAuthEvent(`profile_aggregate.${label}_lookup_succeeded`, {
      table,
      applicationUserId: profile.user_id,
      resultCount: result.data ? 1 : 0,
    });
    return result;
  }));
  const [truckingCompanyResult, shipperCompanyResult, shipperResult, driverResult] = relatedResults;

  let company = truckingCompanyResult.data || shipperCompanyResult.data || null;
  if (!company && driverResult.data?.company_id) {
    logAuthEvent('profile_aggregate.driver_company_lookup_started', {
      table: 'trucking_companies',
      applicationUserId: profile.user_id,
    });
    const { data, error } = await supabaseAdmin.from('trucking_companies')
      .select('*').eq('company_id', driverResult.data.company_id).maybeSingle();
    if (error) {
      logAuthError('profile_aggregate.driver_company_lookup_failed', error, {
        table: 'trucking_companies',
        applicationUserId: profile.user_id,
      });
      throw error;
    }
    company = data;
    logAuthEvent('profile_aggregate.driver_company_lookup_succeeded', {
      table: 'trucking_companies',
      applicationUserId: profile.user_id,
      resultCount: data ? 1 : 0,
    });
  }
  if (!company && shipperResult.data?.company_id) {
    logAuthEvent('profile_aggregate.shipper_company_lookup_started', {
      table: 'shipper_companies',
      applicationUserId: profile.user_id,
    });
    const { data, error } = await supabaseAdmin.from('shipper_companies')
      .select('*').eq('company_id', shipperResult.data.company_id).maybeSingle();
    if (error) {
      logAuthError('profile_aggregate.shipper_company_lookup_failed', error, {
        table: 'shipper_companies',
        applicationUserId: profile.user_id,
      });
      throw error;
    }
    company = data;
    logAuthEvent('profile_aggregate.shipper_company_lookup_succeeded', {
      table: 'shipper_companies',
      applicationUserId: profile.user_id,
      resultCount: data ? 1 : 0,
    });
  }
  const aggregate = buildLegacyUser(profile, {
    company_id: driverResult.data?.company_id || company?.company_id || null,
    driver_id: driverResult.data?.driver_id || null,
    shipper_id: shipperResult.data?.shipper_id || null,
    driver: driverResult.data || null,
    company,
    organizations: company ? [{ company_id: company.company_id, company_name: company.company_name }] : [],
  });
  logAuthEvent('profile_aggregate.completed', {
    applicationUserId: profile.user_id,
    resultCount: aggregate ? 1 : 0,
  });
  return aggregate;
};

const createApplicationRecords = async ({ authUser, input, userType }) => {
  logAuthEvent('signup.application_records.started', {
    role: userType,
    authUserId: authUser.id,
    hasEmail: Boolean(authUser.email || input.email),
    hasPhone: Boolean(authUser.phone || input.phone),
  });
  const profilePayload = {
    auth_user_id: authUser.id,
    email: authUser.email || input.email || null,
    phone: authUser.phone || input.phone || null,
    full_name: input.full_name?.trim() || authUser.user_metadata?.full_name || 'User',
    user_type: userType,
  };

  logAuthEvent('signup.profile_insert_started', {
    table: 'profiles',
    role: userType,
    authUserId: authUser.id,
  });
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert(profilePayload)
    .select('*')
    .single();

  if (profileError) {
    logAuthError('signup.profile_insert_failed', profileError, {
      table: 'profiles',
      role: userType,
      authUserId: authUser.id,
    });
    throw profileError;
  }
  logAuthEvent('signup.profile_insert_succeeded', {
    table: 'profiles',
    role: userType,
    authUserId: authUser.id,
    applicationUserId: profile.user_id,
  });

  if (userType === 'driver') {
    let companyId = null;
    if (input.company_code) {
      logAuthEvent('signup.driver_company_lookup_started', {
        table: 'trucking_companies',
        role: userType,
        applicationUserId: profile.user_id,
      });
      const { data: company, error: companyLookupError } = await supabaseAdmin
        .from('trucking_companies')
        .select('company_id')
        .eq('invite_code', String(input.company_code).trim())
        .maybeSingle();
      if (companyLookupError) {
        logAuthError('signup.driver_company_lookup_failed', companyLookupError, {
          table: 'trucking_companies',
          role: userType,
          applicationUserId: profile.user_id,
        });
        throw companyLookupError;
      }
      if (!company) {
        const inviteCodeError = new AppError('Invalid trucking company invite code', 400);
        logAuthError('signup.driver_company_not_found', inviteCodeError, {
          table: 'trucking_companies',
          role: userType,
          applicationUserId: profile.user_id,
        });
        throw inviteCodeError;
      }
      companyId = company.company_id;
      logAuthEvent('signup.driver_company_lookup_succeeded', {
        table: 'trucking_companies',
        role: userType,
        applicationUserId: profile.user_id,
        resultCount: 1,
      });
    }

    const driverPayload = { user_id: profile.user_id, company_id: companyId };
    if (input.cnic) {
      const cnic = String(input.cnic).replace(/\D/g, '');
      if (cnic) driverPayload.cnic = cnic;
    }
    if (input.license_number) driverPayload.license_number = String(input.license_number).trim();
    logAuthEvent('signup.driver_insert_started', {
      table: 'drivers',
      role: userType,
      applicationUserId: profile.user_id,
    });
    const { error: driverError } = await supabaseAdmin
      .from('drivers')
      .insert(driverPayload);
    if (driverError) {
      logAuthError('signup.driver_insert_failed', driverError, {
        table: 'drivers',
        role: userType,
        applicationUserId: profile.user_id,
      });
      throw driverError;
    }
    logAuthEvent('signup.driver_insert_succeeded', {
      table: 'drivers',
      role: userType,
      applicationUserId: profile.user_id,
    });
    logAuthEvent('signup.application_records.completed', {
      role: userType,
      authUserId: authUser.id,
      applicationUserId: profile.user_id,
    });
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
      const fleetSizeError = new AppError('fleet_size must be a positive whole number', 400);
      logAuthError('signup.trucking_company_fleet_size_invalid', fleetSizeError, {
        role: userType,
        applicationUserId: profile.user_id,
      });
      throw fleetSizeError;
    }
    logAuthEvent('signup.trucking_company_insert_started', {
      table: 'trucking_companies',
      role: userType,
      applicationUserId: profile.user_id,
    });
    const { error: companyError } = await supabaseAdmin
      .from('trucking_companies')
      .insert({ ...companyPayload, fleet_size: fleetSize });
    if (companyError) {
      logAuthError('signup.trucking_company_insert_failed', companyError, {
        table: 'trucking_companies',
        role: userType,
        applicationUserId: profile.user_id,
      });
      throw companyError;
    }
    logAuthEvent('signup.trucking_company_insert_succeeded', {
      table: 'trucking_companies',
      role: userType,
      applicationUserId: profile.user_id,
    });
  } else {
    logAuthEvent('signup.shipper_company_insert_started', {
      table: 'shipper_companies',
      role: userType,
      applicationUserId: profile.user_id,
    });
    const { data: company, error: companyError } = await supabaseAdmin
      .from('shipper_companies')
      .insert({ ...companyPayload, tax_id: input.tax_id || null })
      .select('company_id')
      .single();
    if (companyError) {
      logAuthError('signup.shipper_company_insert_failed', companyError, {
        table: 'shipper_companies',
        role: userType,
        applicationUserId: profile.user_id,
      });
      throw companyError;
    }
    logAuthEvent('signup.shipper_company_insert_succeeded', {
      table: 'shipper_companies',
      role: userType,
      applicationUserId: profile.user_id,
    });

    logAuthEvent('signup.shipper_insert_started', {
      table: 'shippers',
      role: userType,
      applicationUserId: profile.user_id,
    });
    const { error: shipperError } = await supabaseAdmin
      .from('shippers')
      .insert({ user_id: profile.user_id, company_id: company.company_id, is_primary: true });
    if (shipperError) {
      logAuthError('signup.shipper_insert_failed', shipperError, {
        table: 'shippers',
        role: userType,
        applicationUserId: profile.user_id,
      });
      throw shipperError;
    }
    logAuthEvent('signup.shipper_insert_succeeded', {
      table: 'shippers',
      role: userType,
      applicationUserId: profile.user_id,
    });
  }
  logAuthEvent('signup.application_records.completed', {
    role: userType,
    authUserId: authUser.id,
    applicationUserId: profile.user_id,
  });
  return profile;
};

export const signup = async (req, res, next) => {
  let authUserId;
  let applicationUserId;
  let role;
  logAuthEvent('signup.started', {
    hasEmail: Boolean(req.body?.email),
    hasPhone: Boolean(req.body?.phone),
  });
  try {
    const input = {
      ...req.body,
      user_type: normalizeRole(req.body.user_type),
      organization_name: req.body.organization_name || req.body.company_name || req.body.companyname,
    };
    role = input.user_type;
    logAuthEvent('signup.input_normalized', {
      role,
      hasEmail: Boolean(input.email),
      hasPhone: Boolean(input.phone),
    });
    const signupInput = buildSignupInput(input);
    logAuthEvent('signup.input_validated', { role });

    logAuthEvent('signup.supabase_auth_started', { role });
    const { data: authData, error: authError } = await supabase.auth.signUp(signupInput);
    if (authError || !authData.user) {
      const authSignupError = new AppError(authError?.message || 'Failed to create authentication user', 400);
      logAuthError('signup.supabase_auth_failed', authError || authSignupError, { role });
      return next(authSignupError);
    }
    authUserId = authData.user.id;
    logAuthEvent('signup.supabase_auth_succeeded', {
      role,
      authUserId,
      hasSession: Boolean(authData.session),
    });

    logAuthEvent('signup.application_provisioning_started', { role, authUserId });
    const profile = await createApplicationRecords({ authUser: authData.user, input, userType: input.user_type });
    applicationUserId = profile.user_id;
    logAuthEvent('signup.application_provisioning_succeeded', {
      role,
      authUserId,
      applicationUserId,
    });
    logAuthEvent('signup.profile_aggregate_started', { role, authUserId, applicationUserId });
    const user = await getProfileAggregate(authUserId);
    logAuthEvent('signup.profile_aggregate_succeeded', {
      role,
      authUserId,
      applicationUserId,
      resultCount: user ? 1 : 0,
    });

    logAuthEvent('signup.completed', { role, authUserId, applicationUserId });
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
    logAuthError('signup.failed', error, { role, authUserId, applicationUserId });
    let cleanupUserId = applicationUserId;
    if (!cleanupUserId && authUserId) {
      logAuthEvent('signup.rollback.profile_lookup_started', { role, authUserId });
      const { data: createdProfile, error: profileLookupError } = await supabaseAdmin.from('profiles')
        .select('user_id').eq('auth_user_id', authUserId).maybeSingle();
      if (profileLookupError) {
        logAuthError('signup.rollback.profile_lookup_failed', profileLookupError, {
          table: 'profiles',
          role,
          authUserId,
        });
      } else {
        logAuthEvent('signup.rollback.profile_lookup_succeeded', {
          table: 'profiles',
          role,
          authUserId,
          resultCount: createdProfile ? 1 : 0,
        });
      }
      cleanupUserId = createdProfile?.user_id;
    }
    try {
      await cleanupApplicationRecords(cleanupUserId);
    } catch (cleanupError) {
      logAuthError('signup.rollback.failed', cleanupError, {
        role,
        authUserId,
        applicationUserId: cleanupUserId,
      });
      return next(internalError('Registration cleanup failed'));
    }
    if (authUserId) {
      logAuthEvent('signup.rollback.auth_user_delete_started', { role, authUserId });
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(authUserId);
      if (authDeleteError) {
        logAuthError('signup.rollback.auth_user_delete_failed', authDeleteError, { role, authUserId });
      } else {
        logAuthEvent('signup.rollback.auth_user_delete_succeeded', { role, authUserId });
      }
    }
    if (error instanceof AppError && error.expose) {
      logAuthEvent('signup.failed.client_error', { role, statusCode: error.statusCode });
      return next(error);
    }
    if (!authUserId && error instanceof Error) {
      logAuthEvent('signup.failed.validation_error', { role, statusCode: 400 });
      return next(new AppError(error.message, 400));
    }
    logAuthEvent('signup.failed.internal_error', { role, statusCode: 500 });
    return next(internalError('Registration failed'));
  }
};

export const login = async (req, res, next) => {
  let identifierType;
  try {
    const identifier = req.body.email || req.body.phone || req.body.identifier;
    const password = req.body.password;
    identifierType = identifier && validator.isEmail(identifier) ? 'email' : 'phone';
    logAuthEvent('login.started', {
      hasIdentifier: Boolean(identifier),
      hasPassword: Boolean(password),
      operation: identifierType,
    });
    if (!identifier || !password) {
      logAuthEvent('login.credentials_missing', { operation: identifierType, statusCode: 400 });
      return next(new AppError('Email/phone and password are required', 400));
    }

    const credentials = validator.isEmail(identifier)
      ? { email: identifier.trim().toLowerCase(), password }
      : { phone: identifier.trim(), password };
    logAuthEvent('login.supabase_auth_started', { operation: identifierType });
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword(credentials);
    if (authError || !authData.user) {
      logAuthError('login.supabase_auth_failed', authError || new AppError('Authentication user missing', 401), {
        operation: identifierType,
      });
      return next(new AppError(authError?.message || 'Login failed', 401));
    }
    logAuthEvent('login.supabase_auth_succeeded', {
      operation: identifierType,
      authUserId: authData.user.id,
      hasSession: Boolean(authData.session),
    });

    logAuthEvent('login.profile_aggregate_started', { authUserId: authData.user.id });
    const user = await getProfileAggregate(authData.user.id);
    if (!user) {
      const profileMissingError = new AppError('Application profile not found', 401);
      logAuthError('login.profile_aggregate_missing', profileMissingError, {
        authUserId: authData.user.id,
      });
      return next(profileMissingError);
    }
    logAuthEvent('login.profile_aggregate_succeeded', {
      authUserId: authData.user.id,
      resultCount: 1,
    });

    logAuthEvent('login.completed', { authUserId: authData.user.id });
    return res.status(200).json({
      status: 'success',
      token: authData.session?.access_token,
      data: user,
    });
  } catch (error) {
    logAuthError('login.failed', error, { operation: identifierType });
    return next(internalError('Login failed'));
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    logAuthEvent('logout.started', { hasToken: Boolean(token) });
    if (token) {
      const { error } = await createUserClient(token).auth.signOut();
      if (error) {
        logAuthError('logout.supabase_signout_failed', error);
        return next(internalError('Logout failed'));
      }
      logAuthEvent('logout.supabase_signout_succeeded');
    }
    logAuthEvent('logout.completed', { hasToken: Boolean(token) });
    return res.status(200).json({ status: 'success', message: 'Signed out' });
  } catch (error) {
    logAuthError('logout.failed', error);
    return next(internalError('Logout failed'));
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    logAuthEvent('forgot_password.started', { hasEmail: Boolean(email) });
    if (!email || !validator.isEmail(email)) {
      logAuthEvent('forgot_password.email_invalid', { hasEmail: Boolean(email), statusCode: 400 });
      return next(new AppError('A valid email is required', 400));
    }

    logAuthEvent('forgot_password.supabase_request_started');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${config.frontendUrl}/reset-password`,
    });
    if (error) {
      logAuthError('forgot_password.supabase_request_failed', error);
      return next(internalError('Failed to send reset link'));
    }
    logAuthEvent('forgot_password.supabase_request_succeeded');
    return res.status(200).json({ status: 'success', message: 'Password reset link sent' });
  } catch (error) {
    logAuthError('forgot_password.failed', error);
    return next(internalError('Failed to send reset link'));
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    logAuthEvent('reset_password.started', {
      hasRecoveryToken: Boolean(token),
      hasNewPassword: Boolean(req.body.newPassword),
    });
    if (!token) {
      logAuthEvent('reset_password.recovery_token_missing', { statusCode: 401 });
      return next(new AppError('Recovery token is required', 401));
    }
    try {
      validatePasswordStrength(req.body.newPassword);
    } catch (error) {
      logAuthError('reset_password.new_password_invalid', error, { statusCode: 400 });
      return next(new AppError(error.message, 400));
    }

    logAuthEvent('reset_password.supabase_update_started');
    const { error } = await createUserClient(token).auth.updateUser({
      password: req.body.newPassword,
    });
    if (error) {
      logAuthError('reset_password.supabase_update_failed', error);
      return next(internalError('Failed to reset password'));
    }
    logAuthEvent('reset_password.supabase_update_succeeded');
    return res.status(200).json({ status: 'success', message: 'Password updated successfully' });
  } catch (error) {
    logAuthError('reset_password.failed', error);
    return next(internalError('Failed to reset password'));
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    logAuthEvent('update_password.started', {
      authUserId: req.user?.auth_user_id,
      hasCurrentPassword: Boolean(req.body.currentPassword),
      hasNewPassword: Boolean(req.body.newPassword),
    });
    if (!req.body.currentPassword) {
      logAuthEvent('update_password.current_password_missing', { statusCode: 400 });
      return next(new AppError('Current password is required', 400));
    }
    try {
      validatePasswordStrength(req.body.newPassword);
    } catch (error) {
      logAuthError('update_password.new_password_invalid', error, { statusCode: 400 });
      return next(new AppError(error.message, 400));
    }

    logAuthEvent('update_password.identity_verification_started', {
      authUserId: req.user?.auth_user_id,
      operation: req.user.email ? 'email' : 'phone',
    });
    const identity = req.user.email
      ? { email: req.user.email, password: req.body.currentPassword }
      : { phone: req.user.phone, password: req.body.currentPassword };
    const { error: verifyError } = await supabase.auth.signInWithPassword(identity);
    if (verifyError) {
      logAuthError('update_password.identity_verification_failed', verifyError, {
        authUserId: req.user?.auth_user_id,
      });
      return next(new AppError('Current password is incorrect', 401));
    }
    logAuthEvent('update_password.identity_verification_succeeded', {
      authUserId: req.user?.auth_user_id,
    });

    const token = extractBearerToken(req);
    logAuthEvent('update_password.supabase_update_started', {
      authUserId: req.user?.auth_user_id,
      hasToken: Boolean(token),
    });
    const { error } = await createUserClient(token).auth.updateUser({ password: req.body.newPassword });
    if (error) {
      logAuthError('update_password.supabase_update_failed', error, {
        authUserId: req.user?.auth_user_id,
      });
      return next(internalError('Failed to change password'));
    }
    logAuthEvent('update_password.supabase_update_succeeded', {
      authUserId: req.user?.auth_user_id,
    });
    return res.status(200).json({ status: 'success', message: 'Password changed successfully' });
  } catch (error) {
    logAuthError('update_password.failed', error, { authUserId: req.user?.auth_user_id });
    return next(internalError('Failed to change password'));
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    logAuthEvent('delete_account.started', {
      authUserId: req.user?.auth_user_id,
      applicationUserId: req.user?.user_id,
      hasCurrentPassword: Boolean(req.body.currentPassword),
    });
    if (!req.body.currentPassword) {
      logAuthEvent('delete_account.current_password_missing', { statusCode: 400 });
      return next(new AppError('Current password is required', 400));
    }
    logAuthEvent('delete_account.identity_verification_started', {
      authUserId: req.user?.auth_user_id,
      operation: req.user.email ? 'email' : 'phone',
    });
    const identity = req.user.email
      ? { email: req.user.email, password: req.body.currentPassword }
      : { phone: req.user.phone, password: req.body.currentPassword };
    const { error: verifyError } = await supabase.auth.signInWithPassword(identity);
    if (verifyError) {
      logAuthError('delete_account.identity_verification_failed', verifyError, {
        authUserId: req.user?.auth_user_id,
      });
      return next(new AppError('Current password is incorrect', 401));
    }
    logAuthEvent('delete_account.identity_verification_succeeded', {
      authUserId: req.user?.auth_user_id,
    });

    logAuthEvent('delete_account.application_anonymization_started', {
      authUserId: req.user?.auth_user_id,
      applicationUserId: req.user?.user_id,
    });
    await anonymizeApplicationRecords(req.user.user_id);
    logAuthEvent('delete_account.application_anonymization_succeeded', {
      authUserId: req.user?.auth_user_id,
      applicationUserId: req.user?.user_id,
    });
    logAuthEvent('delete_account.auth_user_delete_started', { authUserId: req.user?.auth_user_id });
    const { error } = await supabaseAdmin.auth.admin.deleteUser(req.user.auth_user_id);
    if (error) {
      logAuthError('delete_account.auth_user_delete_failed', error, {
        authUserId: req.user?.auth_user_id,
      });
      return next(internalError('Failed to delete account'));
    }
    logAuthEvent('delete_account.auth_user_delete_succeeded', { authUserId: req.user?.auth_user_id });
    logAuthEvent('delete_account.completed', { authUserId: req.user?.auth_user_id });
    return res.status(204).send();
  } catch (error) {
    logAuthError('delete_account.failed', error, {
      authUserId: req.user?.auth_user_id,
      applicationUserId: req.user?.user_id,
    });
    return next(internalError('Failed to delete account'));
  }
};

export const restrictTo = (...roles) => requireRole(...roles);
export { protect };
