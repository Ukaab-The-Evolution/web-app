import request from 'supertest';

process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_KEY = 'anon-test-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-test-key';
process.env.FRONTEND_URL = 'https://pilot.example.com';
process.env.NODE_ENV = 'production';

const { default: createApp } = await import('./app.js');
const app = createApp({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  frontendUrl: process.env.FRONTEND_URL,
  nodeEnv: 'production',
});

describe('application HTTP boundaries', () => {
  test('serves the health check without authentication', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'success', environment: 'production' });
  });

  test('protects operational routes', async () => {
    const response = await request(app).get('/api/v1/loads/available');

    expect(response.status).toBe(401);
  });

  test('returns a generic response for unknown routes', async () => {
    const response = await request(app).get('/api/v1/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.message).toContain('Route not found');
  });
});
