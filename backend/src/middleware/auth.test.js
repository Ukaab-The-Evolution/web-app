import { extractBearerToken } from './auth.js';

describe('auth middleware helpers', () => {
  test('extracts only a bearer token', () => {
    expect(extractBearerToken({ headers: { authorization: 'Bearer token-123' } })).toBe('token-123');
    expect(extractBearerToken({ headers: { authorization: 'Basic token-123' } })).toBeNull();
    expect(extractBearerToken({ headers: {} })).toBeNull();
  });
});
