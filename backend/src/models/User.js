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
    company_name,
    company_address,
    fleet_size 
  }) {
    // Validate inputs
    if (email && !validator.isEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (phone && !validator.isMobilePhone(phone)) {
      throw new Error('Invalid phone number');
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

    // Additional validation for trucking companies
    if (user_type === 'trucking_company') {
      if (!company_address) throw new Error('Company address is required');
      if (fleet_size && !Number.isInteger(Number(fleet_size))) {
        throw new Error('Fleet size must be a number');
      }
      // Company name is now optional since it will be set by trigger
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
    return data[0];
  }
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

    if (error) throw error;
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
