import { supabaseAdmin } from '../config/supabase.js';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const fullName = process.env.ADMIN_FULL_NAME?.trim() || 'System Admin';

const createFirstAdmin = async () => {
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
  }

  const { data: existingAdmins, error: lookupError } = await supabaseAdmin
    .from('profiles').select('user_id').eq('user_type', 'admin').limit(1);
  if (lookupError) throw lookupError;
  if (existingAdmins?.length) {
    console.log('Admin user already exists');
    return;
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authError || !authData.user) throw authError || new Error('Failed to create admin auth user');

  try {
    const { data: profile, error: profileError } = await supabaseAdmin.from('profiles')
      .insert({ auth_user_id: authData.user.id, email, full_name: fullName, user_type: 'admin' })
      .select('user_id, email, full_name, user_type')
      .single();
    if (profileError) throw profileError;
    console.log(`Created first admin profile ${profile.user_id}`);
  } catch (error) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id).catch(() => undefined);
    throw error;
  }
};

createFirstAdmin().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
