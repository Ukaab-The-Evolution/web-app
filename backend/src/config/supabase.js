import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseServiceRoleKey) {
  throw new Error('Supabase credentials must be provided in environment variables');
}

// Regular client (uses ANON key)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  db: {
    schema: 'public'
  }
});

// Admin client (uses SERVICE ROLE key)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export const createUserClient = (token) => {
  return createClient(
    supabaseUrl,
    supabaseKey,
    {
      global: {
        headers: {
          Authorization: token
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
};

// Keep both named and default exports for backward compatibility
export { supabase, supabaseAdmin };
export default supabase;  // Add this line back
