import AppError from '../utils/appError.js';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { buildCanonicalUser } from '../services/authService.js';
import { extractBearerToken } from './auth.js';

export const protect = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) return next(new AppError('Not logged in', 401));

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return next(new AppError('Invalid or expired token', 401));
    }

    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .maybeSingle();

    if (!profile && !profileError) {
      const fallback = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .maybeSingle();
      profile = fallback.data;
      profileError = fallback.error;
    }

    if (profileError) throw profileError;
    if (!profile) return next(new AppError('Application profile not found', 401));

    const { data: organizations, error: organizationError } = await supabaseAdmin
      .from('organization_members')
      .select('organization_id, member_role, organizations(id, name, kind)')
      .eq('user_id', profile.user_id);

    if (organizationError) throw organizationError;

    const canonicalUser = buildCanonicalUser(profile, organizations || []);
    const { data: driver, error: driverError } = await supabaseAdmin
      .from('drivers')
      .select('id, organization_id')
      .eq('user_id', profile.user_id)
      .maybeSingle();

    if (driverError) throw driverError;

    req.user = {
      ...canonicalUser,
      auth_user_id: authData.user.id,
      driver_id: driver?.id || null,
      organization_id: driver?.organization_id || organizations?.[0]?.organization_id || null,
    };
    req.accessToken = token;
    return next();
  } catch (error) {
    return next(new AppError(error.message || 'Authentication failed', 401));
  }
};

export default protect;
