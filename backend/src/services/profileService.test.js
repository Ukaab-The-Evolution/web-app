import { buildProfileUpdate } from './profileService.js';

describe('profile service contracts', () => {
  test('keeps profile updates within the canonical writable fields', () => {
    expect(buildProfileUpdate({
      full_name: 'Updated Name',
      email: 'updated@example.com',
      phone: '+923001234567',
      password: 'must-not-be-written-here',
      auth_user_id: 'must-not-change',
    })).toEqual({
      full_name: 'Updated Name',
      email: 'updated@example.com',
      phone: '+923001234567',
    });
  });

  test('rejects an invalid email update', () => {
    expect(() => buildProfileUpdate({ email: 'invalid' })).toThrow('email');
  });
});
