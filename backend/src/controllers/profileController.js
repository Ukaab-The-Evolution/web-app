// controllers/profileController.js
import crypto from 'crypto';
import supabase from '../config/supabase.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import validator from 'validator';

// Helper function to get user details with company info
const getUserWithCompany = async (user_id) => {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (userError) throw userError;

  let companyData = null;
  
  if (user.user_type === 'trucking_company') {
    const { data: company, error: companyError } = await supabase
      .from('trucking_companies')
      .select('*')
      .eq('user_id', user_id)
      .single();
    
    if (companyError && companyError.code !== 'PGRST116') throw companyError;
    companyData = company;
  } else if (user.user_type === 'shipper') {
    const { data: shipper, error: shipperError } = await supabase
      .from('shippers')
      .select('company_id')
      .eq('user_id', user_id)
      .single();
    
    if (shipperError && shipperError.code !== 'PGRST116') throw shipperError;
    
    if (shipper && shipper.company_id) {
      const { data: company, error: companyError } = await supabase
        .from('shipper_companies')
        .select('*')
        .eq('company_id', shipper.company_id)
        .single();
      
      if (companyError && companyError.code !== 'PGRST116') throw companyError;
      companyData = company;
    }
  } else if (user.user_type === 'driver') {
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('company_id')
      .eq('user_id', user_id)
      .single();
    
    if (driverError && driverError.code !== 'PGRST116') throw driverError;
    
    if (driver && driver.company_id) {
      const { data: company, error: companyError } = await supabase
        .from('trucking_companies')
        .select('*')
        .eq('company_id', driver.company_id)
        .single();
      
      if (companyError && companyError.code !== 'PGRST116') throw companyError;
      companyData = company;
    }
  }

  return { ...user, company: companyData };
};

// Get user profile
export const getProfile = catchAsync(async (req, res, next) => {
  const userWithCompany = await getUserWithCompany(req.user.user_id);
  
  res.status(200).json({
    status: 'success',
    data: {
      user: userWithCompany
    }
  });
});

// Update user profile
export const updateProfile = catchAsync(async (req, res, next) => {
  const { full_name, email, phone, company_name, company_address } = req.body;
  const user_id = req.user.user_id;
  
  // Validate inputs
  if (email && !validator.isEmail(email)) {
    return next(new AppError('Invalid email format', 400));
  }
  
  if (phone) {
  const cleanedPhone = phone.replace(/[\s\(\)\-]/g, '');
  if (cleanedPhone.startsWith('+')) {
    if (!validator.isMobilePhone(cleanedPhone, 'any', { strictMode: false })) {
      return next(new AppError('Invalid international phone number format', 400));
    }
  } else {
    if (!/^\d{10,15}$/.test(cleanedPhone)) {
      return next(new AppError('Phone number must be 10-15 digits', 400));
    }
  }
  req.body.phone = cleanedPhone;
}
  
  // Get current user details
  const { data: currentUser, error: userError } = await supabase
    .from('users')
    .select('user_type, email, phone')
    .eq('user_id', user_id)
    .single();
  
  if (userError) throw userError;
  
  // Check if email/phone already exists (excluding current user)
  if (email && email !== currentUser.email) {
    const { data: emailExists, error: emailError } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .neq('user_id', user_id)
      .maybeSingle();
    
    if (emailError) throw emailError;
    if (emailExists) {
      return next(new AppError('Email already in use', 400));
    }
  }
  
  if (phone && phone !== currentUser.phone) {
    const { data: phoneExists, error: phoneError } = await supabase
      .from('users')
      .select('user_id')
      .eq('phone', phone)
      .neq('user_id', user_id)
      .maybeSingle();
    
    if (phoneError) throw phoneError;
    if (phoneExists) {
      return next(new AppError('Phone number already in use', 400));
    }
  }
  
  // Update user basic info
  const updateData = {};
  if (full_name) updateData.full_name = full_name;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  
  if (Object.keys(updateData).length > 0) {
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', user_id);
    
    if (updateError) throw updateError;
  }
  
  // Handle company updates based on user type
  if (currentUser.user_type === 'trucking_company' && company_name) {
    const { error: companyError } = await supabase
      .from('trucking_companies')
      .update({ 
        company_name,
        ...(company_address && { company_address })
      })
      .eq('user_id', user_id);
    
    if (companyError) throw companyError;
  } else if (currentUser.user_type === 'shipper' && company_name) {
    // Check if shipper is associated with a company
    const { data: shipper, error: shipperError } = await supabase
      .from('shippers')
      .select('company_id')
      .eq('user_id', user_id)
      .single();
    
    if (shipperError && shipperError.code !== 'PGRST116') throw shipperError;
    
    if (shipper && shipper.company_id) {
      // Update existing company
      const { error: companyError } = await supabase
        .from('shipper_companies')
        .update({ 
          company_name,
          ...(company_address && { company_address })
        })
        .eq('company_id', shipper.company_id);
      
      if (companyError) throw companyError;
    } else {
      // Create new company for shipper
      const { data: newCompany, error: companyError } = await supabase
        .from('shipper_companies')
        .insert([{
          user_id,
          company_name,
          company_address: company_address || 'Address to be provided'
        }])
        .select()
        .single();
      
      if (companyError) throw companyError;
      
      // Associate shipper with the company
      const { error: shipperUpdateError } = await supabase
        .from('shippers')
        .update({ company_id: newCompany.company_id })
        .eq('user_id', user_id);
      
      if (shipperUpdateError) throw shipperUpdateError;
    }
  }
  
  // Return updated profile
  const updatedUser = await getUserWithCompany(user_id);
  
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Join company using invite code (for drivers) - SINGLE USE VERSION
export const joinCompany = catchAsync(async (req, res, next) => {
  const { invite_code } = req.body;
  const user_id = req.user.user_id;
  
  if (!invite_code) {
    return next(new AppError('Invite code is required', 400));
  }
  
  // Get user type
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('user_type')
    .eq('user_id', user_id)
    .single();
  
  if (userError) throw userError;
  
  if (user.user_type !== 'driver') {
    return next(new AppError('Only drivers can join companies', 400));
  }
  
  // Check if driver is already in a company
  const { data: driver, error: driverError } = await supabase
    .from('drivers')
    .select('company_id')
    .eq('user_id', user_id)
    .single();
  
  if (driverError && driverError.code !== 'PGRST116') throw driverError;
  
  if (driver && driver.company_id) {
    return next(new AppError('Driver is already associated with a company', 400));
  }
  
  // Use a transaction to ensure atomicity
  const { data: company, error: companyError } = await supabase
    .from('trucking_companies')
    .select('company_id, invite_code')
    .eq('invite_code', invite_code)
    .single();
  
  if (companyError) {
    if (companyError.code === 'PGRST116') {
      return next(new AppError('Invalid invite code', 400));
    }
    throw companyError;
  }
  
  // Associate driver with company
  const { error: updateError } = await supabase
    .from('drivers')
    .update({ company_id: company.company_id })
    .eq('user_id', user_id);
  
  if (updateError) throw updateError;
  
  // Generate new invite code to make old one invalid
  const { error: codeUpdateError } = await supabase
    .from('trucking_companies')
    .update({ invite_code: crypto.randomUUID() })
    .eq('company_id', company.company_id);
  
  if (codeUpdateError) throw codeUpdateError;
  
  res.status(200).json({
    status: 'success',
    message: 'Successfully joined the company'
  });
});

// Generate new invite code (for company owners/admins)
export const generateInviteCode = catchAsync(async (req, res, next) => {
  const user_id = req.user.user_id;
  
  // Check if user is a trucking company owner or admin
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('user_type')
    .eq('user_id', user_id)
    .single();
  
  if (userError) throw userError;
  
  if (user.user_type !== 'trucking_company' && user.user_type !== 'admin') {
    return next(new AppError('Only company owners or admins can generate invite codes', 403));
  }
  
  let company_id;
  
  if (user.user_type === 'trucking_company') {
    // Get the company owned by this user
    const { data: company, error: companyError } = await supabase
      .from('trucking_companies')
      .select('company_id')
      .eq('user_id', user_id)
      .single();
    
    if (companyError) throw companyError;
    company_id = company.company_id;
  } else {
    // Admin can specify which company to generate code for
    const { company_id: requestedCompanyId } = req.body;
    if (!requestedCompanyId) {
      return next(new AppError('Company ID is required for admin users', 400));
    }
    company_id = requestedCompanyId;
  }
  
  // Generate new invite code
  const { data: updatedCompany, error: updateError } = await supabase
    .from('trucking_companies')
    .update({ invite_code: crypto.randomUUID() })
    .eq('company_id', company_id)
    .select('invite_code')
    .single();
  
  if (updateError) throw updateError;
  
  res.status(200).json({
    status: 'success',
    data: {
      invite_code: updatedCompany.invite_code
    }
  });
});