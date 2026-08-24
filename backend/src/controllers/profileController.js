import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { buildProfileUpdate } from '../services/profileService.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

const getProfileAggregate = async (userId) => {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (profileError) throw profileError;

  const { data: organizations, error: organizationError } = await supabaseAdmin
    .from('organization_members')
    .select('organization_id, member_role, organizations(id, name, kind, invite_code)')
    .eq('user_id', userId);
  if (organizationError) throw organizationError;

  const { data: driver, error: driverError } = await supabaseAdmin
    .from('drivers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (driverError) throw driverError;

  return {
    ...profile,
    organizations: organizations || [],
    driver: driver || null,
  };
};

export const getProfile = catchAsync(async (req, res) => {
  const user = await getProfileAggregate(req.user.id);
  res.status(200).json({ status: 'success', data: { user } });
});

export const updateProfile = catchAsync(async (req, res, next) => {
  const profileUpdate = buildProfileUpdate(req.body);
  const userId = req.user.id;

  if (profileUpdate.email && profileUpdate.email !== req.user.email) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.auth_user_id,
      { email: profileUpdate.email },
    );
    if (authError) return next(new AppError(authError.message, 400));
  }

  if (Object.keys(profileUpdate).length) {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ ...profileUpdate, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    if (error) throw error;
  }

  if (req.user.user_type === 'driver') {
    const driverUpdate = {};
    for (const field of ['cnic', 'license_number', 'emergency_contact']) {
      if (req.body[field] !== undefined) driverUpdate[field] = String(req.body[field]).trim();
    }
    if (Object.keys(driverUpdate).length) {
      const { error } = await supabaseAdmin
        .from('drivers')
        .update({ ...driverUpdate, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      if (error) throw error;
    }
  }

  if (req.user.user_type === 'trucking_company' && req.user.organization_id) {
    const organizationUpdate = {};
    if (req.body.organization_name || req.body.company_name) {
      organizationUpdate.name = String(req.body.organization_name || req.body.company_name).trim();
    }
    if (Object.keys(organizationUpdate).length) {
      const { error } = await supabaseAdmin
        .from('organizations')
        .update({ ...organizationUpdate, updated_at: new Date().toISOString() })
        .eq('id', req.user.organization_id);
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

  const { data: organization, error: organizationError } = await supabaseAdmin
    .from('organizations')
    .select('id, kind')
    .eq('invite_code', inviteCode)
    .eq('kind', 'trucking_company')
    .maybeSingle();
  if (organizationError) throw organizationError;
  if (!organization) return next(new AppError('Invalid invite code', 400));

  const { error: driverError } = await supabaseAdmin
    .from('drivers')
    .update({ organization_id: organization.id, updated_at: new Date().toISOString() })
    .eq('id', req.user.driver_id)
    .is('organization_id', null);
  if (driverError) throw driverError;

  const { error: membershipError } = await supabaseAdmin
    .from('organization_members')
    .upsert({ organization_id: organization.id, user_id: req.user.id, member_role: 'member' });
  if (membershipError) throw membershipError;

  res.status(200).json({ status: 'success', message: 'Successfully joined the company' });
});

export const generateInviteCode = catchAsync(async (req, res, next) => {
  if (req.user.user_type !== 'trucking_company' || !req.user.organization_id) {
    return next(new AppError('Only trucking company owners can generate invite codes', 403));
  }

  const inviteCode = crypto.randomUUID();
  const { data: organization, error } = await supabaseAdmin
    .from('organizations')
    .update({ invite_code: inviteCode, updated_at: new Date().toISOString() })
    .eq('id', req.user.organization_id)
    .select('invite_code')
    .single();
  if (error) throw error;

  res.status(200).json({ status: 'success', data: { invite_code: organization.invite_code } });
});
