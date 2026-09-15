import { buildAuthHeaders, normalizeApiError, normalizeLoad } from './client';

describe('frontend API client contracts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('adds a bearer token only when one exists', () => {
    expect(buildAuthHeaders()).toEqual({});
    localStorage.setItem('token', 'token-123');
    expect(buildAuthHeaders()).toEqual({ Authorization: 'Bearer token-123' });
  });

  test('normalizes a backend load into pool progress', () => {
    expect(normalizeLoad({
      id: 'load-1',
      required_trucks: 3,
      accepted_trucks: 1,
      required_capacity: 30000,
      accepted_capacity: 10000,
    }).pool).toEqual({
      required: 3,
      accepted: 1,
      remaining: 2,
      required_capacity: 30000,
      accepted_capacity: 10000,
      remaining_capacity: 20000,
      pooling_allowed: false,
      fulfilled: false,
    });
  });

  test('returns a useful error for network failures without a response body', () => {
    expect(normalizeApiError({ message: 'Network Error' })).toBe('Network Error');
  });
});
