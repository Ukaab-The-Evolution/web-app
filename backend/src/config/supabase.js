import { createClient } from '@supabase/supabase-js';
import { loadEnv } from './env.js';

const config = loadEnv();
const baseAuthOptions = {
  persistSession: false,
  autoRefreshToken: false,
};

const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: baseAuthOptions,
  db: { schema: 'public' },
});

const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: baseAuthOptions,
  db: { schema: 'public' },
});

export const createUserClient = (token) => createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
  {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: baseAuthOptions,
    db: { schema: 'public' },
  },
);

export { supabase, supabaseAdmin };
export default supabase;
