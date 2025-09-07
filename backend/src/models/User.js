import supabase from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from 'crypto';

class User {
  static async create({ 
    email, 
    phone, 
    password, 
    user_type, 
    full_name,
    owns_company, // New field to determine if user owns company or is individual driver
    cnic
  }) {
    // Validate inputs
    if (email && !validator.isEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    if (phone) {
      const cleanedPhone = phone.replace(/[\s\(\)\-]/g, '');
      if (!/^\+?\d{10,15}$/.test(cleanedPhone)) {
        throw new Error('Phone number must be 10-15 digits');
      }
    }
    
    if (!validator.isStrongPassword(password, { 
      minLength: 8, 
      minLowercase: 1, 
      minUppercase: 1, 
      minNumbers: 1, 
      minSymbols: 1 
    })) {
      throw new Error('Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol');
    }

    const validUserTypes = ['driver', 'shipper', 'admin', 'trucking_company', 'company_employee'];
    if (!validUserTypes.includes(user_type)) {
      throw new Error('Invalid user type');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user in database
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        email, 
        phone, 
        password_hash, 
        user_type, 
        full_name,
        auth_user_id: null
      }])
      .select('*');

    if (error) throw error;
    
    const newUser = data[0];
    
    // Handle company/driver relationship for trucking_company registrations
    if (user_type === 'trucking_company') {
      if (owns_company) {
        // User owns the company - create trucking company with default values
        const { error: companyError } = await supabase
          .from('trucking_companies')
          .insert([{
            user_id: newUser.user_id,
            company_name: `${full_name}'s Company`, // Default name
            company_address: 'Address to be provided', // Default address
            fleet_size: 1, // Default fleet size
            verification_status: 'pending'
          }]);
        
        if (companyError) throw companyError;
      } else {
        // User is an individual driver - create driver instance
        const { error: driverError } = await supabase
          .from('drivers')
          .insert([{
            user_id: newUser.user_id,
            // CNIC will be added later during verification
            company_id: null // Will be set when they join a company
          }]);
        
        if (driverError) throw driverError;
        
        // Also update user type to driver since they're registering as individual
        const { error: updateError } = await supabase
          .from('users')
          .update({ user_type: 'driver' })
          .eq('user_id', newUser.user_id);
        
        if (updateError) throw updateError;
        
        newUser.user_type = 'driver';
      }
    }

    return newUser;
  }

  // ... rest of the User class methods remain the same
  static async getAuthUserId(email) {
    if (!email) return null;
    
    const { data: authUser, error } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error || !authUser) return null;
    return authUser.id;
  }

  static async findByEmailOrPhone(identifier) {
    const isEmail = validator.isEmail(identifier);
    const field = isEmail ? 'email' : 'phone';
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq(field, identifier)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // Ensure auth_user_id exists for email users
    if (!data.auth_user_id && isEmail) {
      const authUserId = await this.getAuthUserId(data.email);
      if (authUserId) {
        await supabase
          .from('users')
          .update({ auth_user_id: authUserId })
          .eq('user_id', data.user_id);
        data.auth_user_id = authUserId;
      }
    }

    return data;
  }

  static async findById(user_id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error) throw error;
    return data;
  }

  static async comparePassword(candidatePassword, hash) {
    return await bcrypt.compare(candidatePassword, hash);
  }

  static async updatePassword(user_id, newPassword) {
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(newPassword, salt);

    const { data, error } = await supabase
      .from('users')
      .update({ password_hash })
      .eq('user_id', user_id)
      .select();

    if (error) throw error;
    return data[0];
  }

  static async createPasswordResetToken(user_id) {
    const token = crypto.randomBytes(32).toString('hex');
    const token_hash = crypto.createHash('sha256').update(token).digest('hex');
    const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .insert([{
        user_id,
        token_hash,
        expires_at: expires_at.toISOString()
      }])
      .select();

    if (error) throw error;
    return token;
  }

  static async verifyPasswordResetToken(token) {
    const token_hash = crypto.createHash('sha256').update(token).digest('hex');

    const { data, error } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('token_hash', token_hash)
    .gt('expires_at', new Date().toISOString())
    .eq('used', false)
    .maybeSingle();

    if (error) {
    console.error('Token verification error:', error);
    throw new Error('Token verification failed');
    }

    if (!data) {
    throw new Error('Invalid or expired token');
    }

    return data;
  }

  static async invalidateResetToken(token_id) {
    const { error } = await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token_id', token_id);

    if (error) throw error;
  }
}

export default User;