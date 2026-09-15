import validator from 'validator';
import { normalizeRole } from '../domain/validation.js';

export const validatePasswordStrength = (password) => {
  if (typeof password !== 'string' || !validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })) {
    throw new Error('Password must be strong and contain at least 8 characters, one lowercase letter, one uppercase letter, one number, and one symbol');
  }
  return true;
};

export const buildSignupInput = (input = {}) => {
  const userType = normalizeRole(input.user_type);
  if (!input.email && !input.phone) {
    throw new Error('Please provide either email or phone number');
  }

  validatePasswordStrength(input.password);

  const metadata = {
    user_type: userType,
    full_name: input.full_name?.trim() || '',
  };

  for (const key of ['phone', 'organization_name', 'owns_company', 'cnic', 'company_code']) {
    if (input[key] !== undefined && input[key] !== null && input[key] !== '') {
      metadata[key] = input[key];
    }
  }

  const payload = {
    password: input.password,
    options: { data: metadata },
  };

  if (input.email) payload.email = input.email.trim().toLowerCase();
  if (input.phone && !input.email) payload.phone = input.phone.trim();
  return payload;
};

export const buildCanonicalUser = (profile, organizations = []) => ({
  id: profile.user_id,
  auth_user_id: profile.auth_user_id,
  full_name: profile.full_name,
  user_type: normalizeRole(profile.user_type),
  email: profile.email || null,
  phone: profile.phone || null,
  organizations,
});
