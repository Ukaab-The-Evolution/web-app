import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { buildProfileUpdate } from '../services/profileService.js';
import { buildLegacyUser } from '../services/currentSchemaService.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

const getProfileAggregate = async (userId) => {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles').select('*').eq('user_id', userId).single();
  if (profileError) throw profileError;

  const [driverResult, shipperResult, truckingOwnedResult, shipperOwnedResult] = await Promise.all([
    supabaseAdmin.from('drivers').select('*').eq('user_id', userId).maybeSingle(),
    supabaseAdmin.from('shippers').select('*').eq('user_id', userId).maybeSingle(),
    supabaseAdmin.from('trucking_companies').select('*').eq('user_id', userId).maybeSingle(),
    supabaseAdmin.from('shipper_companies').select('*').eq('user_id', userId).maybeSingle(),
  ]);
  for (const result of [driverResult, shipperResult, truckingOwnedResult, shipperOwnedResult]) {
    if (result.error) throw result.error;
  }

  let company = truckingOwnedResult.data || shipperOwnedResult.data || null;
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

  const user = buildLegacyUser(profile, {
    company_id: driverResult.data?.company_id || company?.company_id || null,
    driver_id: driverResult.data?.driver_id || null,
    shipper_id: shipperResult.data?.shipper_id || null,
    driver: driverResult.data || null,
    company,
    organizations: company ? [{ company_id: company.company_id, company_name: company.company_name }] : [],
  });
  return { ...user, driver: driverResult.data || null, shipper: shipperResult.data || null };
};

export const getProfile = catchAsync(async (req, res) => {
  const user = await getProfileAggregate(req.user.id);
  res.status(200).json({ status: 'success', data: { user } });
});

export const updateProfile = catchAsync(async (req, res, next) => {
  let profileUpdate;
  try {
    profileUpdate = buildProfileUpdate(req.body);
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
  const userId = req.user.id;

  if (profileUpdate.email && profileUpdate.email !== req.user.email) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.auth_user_id, { email: profileUpdate.email },
    );
    if (authError) return next(new AppError('Unable to update email address', 400));
  }
  if (Object.keys(profileUpdate).length) {
    const { error } = await supabaseAdmin.from('profiles').update(profileUpdate).eq('user_id', userId);
    if (error) throw error;
  }

  if (req.user.user_type === 'driver' && req.user.driver_id) {
    const driverUpdate = {};
    if (req.body.cnic !== undefined) {
      const cnic = String(req.body.cnic).replace(/\D/g, '');
      if (!cnic) return next(new AppError('cnic must contain digits', 400));
      driverUpdate.cnic = cnic;
    }
    if (req.body.license_number !== undefined) driverUpdate.license_number = String(req.body.license_number).trim();
    if (req.body.experience_years !== undefined) {
      const experienceYears = Number(req.body.experience_years);
      if (!Number.isInteger(experienceYears) || experienceYears < 0) return next(new AppError('experience_years must be a non-negative whole number', 400));
      driverUpdate.experience_years = experienceYears;
    }
    for (const [inputKey, column] of [['current_company', 'current_company'], ['emergency_contact', 'emergency_contact'], ['emergency_contactName', 'emergency_contact_name'], ['address', 'address']]) {
      if (req.body[inputKey] !== undefined) driverUpdate[column] = String(req.body[inputKey]).trim();
    }
    if (Object.keys(driverUpdate).length) {
      const { error } = await supabaseAdmin.from('drivers').update(driverUpdate).eq('driver_id', req.user.driver_id);
      if (error) throw error;
    }
  }

  if (['trucking_company', 'shipper'].includes(req.user.user_type) && req.user.company_id) {
    const companyUpdate = {};
    if (req.body.company_name || req.body.organization_name) {
      companyUpdate.company_name = String(req.body.company_name || req.body.organization_name).trim();
    }
    if (req.body.address !== undefined || req.body.company_address !== undefined) {
      companyUpdate.company_address = String(req.body.company_address || req.body.address).trim();
    }
    if (req.body.contact_person !== undefined) companyUpdate.contact_person = String(req.body.contact_person).trim();
    if (req.user.user_type === 'trucking_company' && req.body.fleet_size !== undefined) {
      const fleetSize = Number(req.body.fleet_size);
      if (!Number.isInteger(fleetSize) || fleetSize < 1) return next(new AppError('fleet_size must be a positive whole number', 400));
      companyUpdate.fleet_size = fleetSize;
    }
    if (Object.keys(companyUpdate).length) {
      const table = req.user.user_type === 'trucking_company' ? 'trucking_companies' : 'shipper_companies';
      const { error } = await supabaseAdmin.from(table).update(companyUpdate).eq('company_id', req.user.company_id);
      if (error) throw error;
    }
  }

  const user = await getProfileAggregate(userId);
  res.status(200).json({ status: 'success', data: { user } });
});

export const joinCompany = catchAsync(async (req, res, next) => {
  if (req.user.user_type !== 'driver' || !req.user.driver_id) {
    return next(new AppError('Only drivers can join a trucking company', 403));
  }
  const inviteCode = String(req.body.invite_code || '').trim();
  if (!inviteCode) return next(new AppError('Invite code is required', 400));

  const { data: company, error: companyError } = await supabaseAdmin
    .from('trucking_companies').select('company_id').eq('invite_code', inviteCode).maybeSingle();
  if (companyError) throw companyError;
  if (!company) return next(new AppError('Invalid invite code', 400));

  const { data: updatedDriver, error: driverError } = await supabaseAdmin.from('drivers')
    .update({ company_id: company.company_id }).eq('driver_id', req.user.driver_id)
    .is('company_id', null).select('driver_id').maybeSingle();
  if (driverError) throw driverError;
  if (!updatedDriver) return next(new AppError('Driver is already assigned to a company', 409));
  res.status(200).json({ status: 'success', message: 'Successfully joined the company' });
});

export const generateInviteCode = catchAsync(async (req, res, next) => {
  if (req.user.user_type !== 'trucking_company' || !req.user.company_id) {
    return next(new AppError('Only trucking company owners can generate invite codes', 403));
  }
  const inviteCode = crypto.randomUUID();
  const { data: company, error } = await supabaseAdmin.from('trucking_companies')
    .update({ invite_code: inviteCode }).eq('company_id', req.user.company_id)
    .select('invite_code').single();
  if (error) throw error;
  res.status(200).json({ status: 'success', data: { invite_code: company.invite_code } });
});

export const getCompanyDrivers = catchAsync(async (req, res, next) => {
  if (req.user.user_type !== 'trucking_company' || !req.user.company_id) {
    return next(new AppError('Only trucking company members can view company drivers', 403));
  }

  const { data: drivers, error: driverError } = await supabaseAdmin
    .from('drivers')
    .select('driver_id, user_id, company_id')
    .eq('company_id', req.user.company_id)
    .order('driver_id', { ascending: true });
  if (driverError) throw driverError;

  const userIds = (drivers || []).map((driver) => driver.user_id).filter(Boolean);
  const { data: profiles, error: profileError } = userIds.length
    ? await supabaseAdmin.from('profiles').select('user_id, full_name').in('user_id', userIds)
    : { data: [], error: null };
  if (profileError) throw profileError;
  const names = new Map((profiles || []).map((profile) => [profile.user_id, profile.full_name]));

  return res.status(200).json({
    status: 'success',
    data: {
      drivers: (drivers || []).map((driver) => ({
        ...driver,
        full_name: names.get(driver.user_id) || `Driver ${driver.driver_id}`,
      })),
    },
  });
});
