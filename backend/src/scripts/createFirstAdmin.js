// scripts/createFirstAdmin.js
import User from '../models/User.js';
import { supabaseAdmin } from '../config/supabase.js';

const createFirstAdmin = async () => {
  const { data: existingAdmins, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_type', 'admin')
    .limit(1);

  if (error) throw error;
  if (existingAdmins.length > 0) {
    console.log('Admin user already exists');
    return;
  }

  // Create admin
  const admin = await User.create({
    email: 'admin@example.com',
    password: 'securePassword123!',
    user_type: 'admin',
    full_name: 'System Admin'
  });

  console.log('Created first admin:', admin);
};

createFirstAdmin().catch(console.error);