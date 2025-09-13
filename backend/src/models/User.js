import supabase from '../config/supabase.js';
import validator from 'validator';

class User {
  static async create({ 
    email, 
    phone, 
    password, 
    user_type, 
    full_name,
    owns_company, // New field to determine if user owns company or is individual driver
    cnic,
    auth_user_id
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

    const validUserTypes = ['driver', 'shipper', 'admin', 'trucking_company', 'company_employee'];
    if (!validUserTypes.includes(user_type)) {
      throw new Error('Invalid user type');
    }

    // Create user profile in database (password and verification handled by Supabase Auth)
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ 
        email, 
        phone, 
        user_type, 
        full_name,
        auth_user_id: auth_user_id || null
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
      .from('profiles')
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
          .from('profiles')
          .update({ auth_user_id: authUserId })
          .eq('user_id', data.user_id);
        data.auth_user_id = authUserId;
      }
    }

    return data;
  }

  static async findById(user_id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error) throw error;
    return data;
  }

  // Password management is now handled by Supabase Auth
  // These methods are kept for backward compatibility but are no longer used
  static async updatePassword(user_id, newPassword) {
    // This method is kept for backward compatibility
    // Actual password updates are handled by Supabase Auth
    console.log('Password update handled by Supabase Auth for user:', user_id);
    return { user_id };
  }
}

export default User;