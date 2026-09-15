import {
  buildCanonicalUser,
  buildSignupInput,
  validatePasswordStrength,
} from './authService.js';

describe('auth service contracts', () => {
  test('builds a Supabase phone signup without sending an undefined email', () => {
    expect(buildSignupInput({
      phone: '+923001234567',
      password: 'Secure!123',
      user_type: 'truckDriver',
      full_name: 'Driver One',
    })).toEqual({
      phone: '+923001234567',
      password: 'Secure!123',
      options: {
        data: {
          user_type: 'driver',
          full_name: 'Driver One',
          phone: '+923001234567',
        },
      },
    });
  });

  test('rejects weak passwords with a stable validation error', () => {
    expect(() => validatePasswordStrength('password')).toThrow('strong');
  });

  test('preserves a driver company code in signup metadata', () => {
    expect(buildSignupInput({
      email: 'driver@example.com',
      password: 'Secure!123',
      user_type: 'driver',
      full_name: 'A Driver',
      company_code: 'company-invite-code',
    }).options.data.company_code).toBe('company-invite-code');
  });

  test('returns a canonical user shape with organization membership', () => {
    expect(buildCanonicalUser(
      {
        user_id: 'profile-1',
        auth_user_id: 'auth-1',
        full_name: 'A Driver',
        user_type: 'driver',
        email: 'driver@example.com',
      },
      [{ organization_id: 'org-1', member_role: 'member' }],
    )).toEqual({
      id: 'profile-1',
      auth_user_id: 'auth-1',
      full_name: 'A Driver',
      user_type: 'driver',
      email: 'driver@example.com',
      phone: null,
      organizations: [{ organization_id: 'org-1', member_role: 'member' }],
    });
  });
});
