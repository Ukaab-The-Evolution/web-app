import AppError from '../utils/appError.js';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { buildLegacyUser } from '../services/currentSchemaService.js';
import { extractBearerToken } from './auth.js';

export const protect = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) return next(new AppError('Not logged in', 401));

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return next(new AppError('Invalid or expired token', 401));
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile) return next(new AppError('Application profile not found', 401));

    const [truckingCompanyResult, shipperCompanyResult, shipperResult, driverResult] = await Promise.all([
      supabaseAdmin.from('trucking_companies').select('*').eq('user_id', profile.user_id).maybeSingle(),
      supabaseAdmin.from('shipper_companies').select('*').eq('user_id', profile.user_id).maybeSingle(),
      supabaseAdmin.from('shippers').select('*').eq('user_id', profile.user_id).maybeSingle(),
      supabaseAdmin.from('drivers').select('*').eq('user_id', profile.user_id).maybeSingle(),
    ]);

    for (const result of [truckingCompanyResult, shipperCompanyResult, shipperResult, driverResult]) {
      if (result.error) throw result.error;
    }

    const truckingCompany = truckingCompanyResult.data;
    const shipperCompany = shipperCompanyResult.data;
    const shipper = shipperResult.data;
    const driver = driverResult.data;
    let company = truckingCompany || shipperCompany || null;
    if (!company && driver?.company_id) {
      const { data, error } = await supabaseAdmin.from('trucking_companies')
        .select('*').eq('company_id', driver.company_id).maybeSingle();
      if (error) throw error;
      company = data;
    }
    if (!company && shipper?.company_id) {
      const { data, error } = await supabaseAdmin.from('shipper_companies')
        .select('*').eq('company_id', shipper.company_id).maybeSingle();
      if (error) throw error;
      company = data;
    }
    const canonicalUser = buildLegacyUser(profile, {
      company_id: driver?.company_id || truckingCompany?.company_id || shipperCompany?.company_id || null,
      driver_id: driver?.driver_id || null,
      shipper_id: shipper?.shipper_id || null,
      company,
      organizations: company ? [{ company_id: company.company_id, company_name: company.company_name }] : [],
    });

    req.user = {
      ...canonicalUser,
      user_id: canonicalUser.id,
      auth_user_id: authData.user.id,
      driver_id: driver?.driver_id || null,
      shipper_id: shipper?.shipper_id || null,
      company_id: driver?.company_id || truckingCompany?.company_id || shipperCompany?.company_id || null,
    };
    req.accessToken = token;
    return next();
  } catch (error) {
    return next(new AppError(error.message || 'Authentication failed', 401));
  }
};

export default protect;
