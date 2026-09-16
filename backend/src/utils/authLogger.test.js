import { jest } from '@jest/globals';
import { logAuthError, logAuthEvent } from './authLogger.js';

describe('auth logging', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('writes a structured event with safe context', () => {
    const info = jest.spyOn(console, 'info').mockImplementation(() => {});

    logAuthEvent('signup.started', {
      role: 'shipper',
      hasEmail: true,
      hasPhone: false,
    });

    expect(info).toHaveBeenCalledWith(expect.stringContaining('"event":"signup.started"'));
    expect(info).toHaveBeenCalledWith(expect.stringContaining('"role":"shipper"'));
    expect(info).toHaveBeenCalledWith(expect.stringContaining('"hasEmail":true'));
  });

  test('writes error details without logging sensitive values', () => {
    const error = new Error('Database insert failed');
    error.code = '23505';
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});

    logAuthError('signup.profile_insert_failed', error, {
      role: 'shipper',
      authUserId: 'auth-user-id',
    });

    const [message] = errorLog.mock.calls[0];
    expect(message).toContain('"event":"signup.profile_insert_failed"');
    expect(message).toContain('"code":"23505"');
    expect(message).toContain('"authUserId":"auth-user-id"');
    expect(message).not.toContain('password');
    expect(message).not.toContain('access_token');
  });

  test('redacts sensitive error text and limits large stack output', () => {
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error(`password=secret access_token=token ${'x'.repeat(2500)}`);

    logAuthError('login.supabase_auth_failed', error);

    const [message] = errorLog.mock.calls[0];
    expect(message).toContain('password=[REDACTED]');
    expect(message).toContain('access_token=[REDACTED]');
    expect(message.length).toBeLessThan(2300);
  });
});
