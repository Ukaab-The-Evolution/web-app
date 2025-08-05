import supabase from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from 'crypto';

class User {
  // Create new user with validation
  static async create({ email, phone, password, user_type, full_name }) {
    // Validate password strength
    if (!validator.isStrongPassword(password, { 
      minLength: 8, 
      minLowercase: 1, 
      minUppercase: 1, 
      minNumbers: 1, 
      minSymbols: 1 
    })) {
      throw new Error('Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol');
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        email, 
        phone, 
        password_hash, 
        user_type, 
        full_name
      }])
      .select();

    if (error) throw error;
    return data[0];
  }

  // Find user by email or phone
  static async findByEmailOrPhone(identifier) {
    const isEmail = validator.isEmail(identifier);
    const field = isEmail ? 'email' : 'phone';
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq(field, identifier)
      .maybeSingle();

    if (error) throw error;
    return data;
  }


  // Find user by ID
  static async findById(user_id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error) throw error;
    return data;
  }

  // Compare password
  static async comparePassword(candidatePassword, hash) {
    return await bcrypt.compare(candidatePassword, hash);
  }

  // Update user's password
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
  return token; // Return the unhashed token for email
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

  
//   // Create password reset token (stores in documents table)
//   static async createPasswordResetToken(user_id) {
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
//     const { data, error } = await supabase
//       .from('documents')
//       .insert([{
//         user_id,
//         document_type: 'password_reset',
//         s3_url: hashedToken,
//         uploaded_at: expiresAt.toISOString()
//       }])
//       .select();

//     if (error) throw error;
//     return resetToken;
//   }

//   // Verify password reset token
//   static async verifyPasswordResetToken(token) {
//     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
//     const { data, error } = await supabase
//       .from('documents')
//       .select('*')
//       .eq('document_type', 'password_reset')
//       .eq('s3_url', hashedToken)
//       .gt('uploaded_at', new Date().toISOString())
//       .maybeSingle();

//     if (error) throw error;
//     return data;
//   }

//   // Clear password reset token
//   static async clearPasswordResetToken(tokenId) {
//     const { error } = await supabase
//       .from('documents')
//       .delete()
//       .eq('document_id', tokenId);

//     if (error) throw error;
//   }
}

export default User;