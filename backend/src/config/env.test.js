import { loadEnv } from './env.js';

const validEnv = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_KEY: 'anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
  PORT: '3001',
  FRONTEND_URL: 'http://localhost:3000',
  NODE_ENV: 'test',
};

describe('loadEnv', () => {
  test('rejects a missing service-role key without exposing secret values', () => {
    const { SUPABASE_SERVICE_ROLE_KEY: omitted, ...missingServiceRole } = validEnv;

    expect(() => loadEnv(missingServiceRole)).toThrow('SUPABASE_SERVICE_ROLE_KEY');
    expect(() => loadEnv(missingServiceRole)).not.toThrow('service-role-key');
  });

  test('returns normalized runtime configuration for valid values', () => {
    expect(loadEnv(validEnv)).toEqual({
      supabaseUrl: validEnv.SUPABASE_URL,
      supabaseAnonKey: validEnv.SUPABASE_KEY,
      supabaseServiceRoleKey: validEnv.SUPABASE_SERVICE_ROLE_KEY,
      port: 3001,
      frontendUrl: validEnv.FRONTEND_URL,
      nodeEnv: 'test',
    });
  });

  test('rejects a frontend URL with a trailing period', () => {
    expect(() => loadEnv({
      ...validEnv,
      FRONTEND_URL: 'https://web-app.example.com.',
    })).toThrow('FRONTEND_URL');
  });
});
