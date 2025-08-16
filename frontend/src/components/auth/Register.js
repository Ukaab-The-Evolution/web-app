import PropTypes from 'prop-types';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { register } from '../../actions/auth';
import { useState, useEffect } from 'react';

import { MdOutlineSupportAgent } from 'react-icons/md';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import GoogleSignInButton from './GoogleSignInButton';

// Import utilities
import { 
  getFieldsForRole, 
  getInitialFormData, 
  getRoleContent,
  isValidRole,
  validateFieldInput
} from '../../utils/fieldsConfig';

const Register = ({ register, isAuthenticated, supabaseUser }) => {
  const location = useLocation();
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    hasUppercase: false,
    hasMinLength: false,
    hasNumberOrSymbol: false
  });

  // Extract role from URL params and initialize form
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const roleParam = urlParams.get('role');
    
    if (roleParam && isValidRole(roleParam)) {
      setRole(roleParam);
      setFormData(getInitialFormData(roleParam));
    } else{
      setRole(null);
    }
  }, [location.search]);

  if(role === null) {
    return <Navigate to='/role-selection' />;
  }

  // Password validation function
  const validatePassword = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasMinLength = password.length >= 8;
    const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    setPasswordValidation({
      hasUppercase,
      hasMinLength,
      hasNumberOrSymbol
    });

    return hasUppercase && hasMinLength && hasNumberOrSymbol;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    
    // Validate field input (especially for numeric fields)
    if (!validateFieldInput(name, value)) {
      return; // Prevent invalid input
    }

    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    // Validate password in real-time
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Final password validation before submission
    const isPasswordValid = validatePassword(formData.password || '');
    
    if (!isPasswordValid) {
      return; // Prevent submission if password doesn't meet requirements
    }

    setIsLoading(true);
    try {
      await register(formData, role);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if logged in
  if (isAuthenticated) {
    return <Navigate to='/otp-verification' />;
  }

  // Get dynamic configurations
  const fields = getFieldsForRole(role);
  const roleContentData = getRoleContent(role);

  // Separate password field and other fields
  const passwordField = fields.find(field => field.name === 'password');
  const otherFields = fields.filter(field => field.name !== 'password');

  // Check if all password requirements are met
  const isPasswordComplete = passwordValidation.hasUppercase && 
                            passwordValidation.hasMinLength && 
                            passwordValidation.hasNumberOrSymbol;

  // Render form field
  const renderField = (field) => {
    const isPasswordField = field.type === 'password';
    const inputType = isPasswordField && showPassword ? 'text' : field.type;

    return (
      <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
        <label
          htmlFor={field.name}
          className="block text-sm text-[var(--color-text-main)] mb-1 opacity-70"
        >
          {field.label}
        </label>
        <div className={isPasswordField ? 'relative' : ''}>
          <input
            type={inputType}
            name={field.name}
            id={field.name}
            autoComplete={field.autoComplete}
            required={field.required}
            value={formData[field.name] || ''}
            onChange={onChange}
            pattern={field.pattern}
            inputMode={field.inputMode}
            className={`w-full px-4 py-2 ${
              isPasswordField ? 'pr-12' : ''
            } rounded-[10px] bg-[var(--color-bg-input)] border ${
              isPasswordField && formData.password && !isPasswordComplete
                ? 'border-red-300 focus:ring-red-500' 
                : isPasswordField && formData.password && isPasswordComplete
                ? 'border-green-300 focus:ring-green-500'
                : 'border-[var(--color-border-input)] focus:ring-[var(--color-green-main)]'
            } text-[var(--color-text-main)] font-[var(--font-poppins)] focus:outline-none focus:ring-2`}
            placeholder={field.placeholder}
          />
          
          {isPasswordField && (
            <>
              <span
                className="absolute right-10 top-[12px] h-6 w-px bg-[var(--color-border-input)]"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-2 top-[9px] text-[var(--color-text-main)] focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={22} />
                ) : (
                  <AiOutlineEye size={22} />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row relative font-poppins overflow-hidden">
      {/* Top Left Logo */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center z-20">
        <img
          src="/images/IconGreenTransparent.png"
          alt="Ukaab Logo"
          className="h-8 sm:h-10 md:h-12"
        />
        <span className="text-lg sm:text-xl md:text-2xl font-bold font-radley text-[#3B6255] ml-2">
          Ukaab
        </span>
      </div>

      {/* Left Section - Register Form */}
      <div className="flex justify-center items-center p-4 sm:p-6 md:p-8 lg:px-16 pt-20 sm:pt-24 md:pt-28 lg:pt-32 w-full lg:w-1/2 bg-white">
        <div className="w-full max-w-lg">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-gray-900 mb-4 lg:mb-6">
            Sign Up
          </h1>

          <p className="text-gray-700 mb-4 lg:mb-6">
            Already have an account?{' '}
            <Link
              to='/login'
              className="text-[var(--color-text-link)] hover:underline font-[var(--font-poppins)]"
            >
              Login now
            </Link>
          </p>

          <form onSubmit={onSubmit} className="space-y-3 lg:space-y-4">
            {/* Dynamic form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              {otherFields.map(renderField)}
            </div>
            
            {/* Password field - full width */}
            {passwordField && renderField(passwordField)}

            {/* Password requirements with dynamic validation */}
            <ul className="mt-2 mb-3 text-[12px] lg:text-[14px] space-y-1">
              <li className="flex items-center gap-2">
                <span className={`${
                  passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-400'
                } transition-colors duration-200`}>
                  {passwordValidation.hasUppercase ? '✓' : '○'}
                </span>
                <span className={`${
                  passwordValidation.hasUppercase ? 'text-green-700' : 'text-gray-700'
                } transition-colors duration-200`}>
                  Contains at least one capital character
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className={`${
                  passwordValidation.hasMinLength ? 'text-green-600' : 'text-gray-400'
                } transition-colors duration-200`}>
                  {passwordValidation.hasMinLength ? '✓' : '○'}
                </span>
                <span className={`${
                  passwordValidation.hasMinLength ? 'text-green-700' : 'text-gray-700'
                } transition-colors duration-200`}>
                  At least 8 characters
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className={`${
                  passwordValidation.hasNumberOrSymbol ? 'text-green-600' : 'text-gray-400'
                } transition-colors duration-200`}>
                  {passwordValidation.hasNumberOrSymbol ? '✓' : '○'}
                </span>
                <span className={`${
                  passwordValidation.hasNumberOrSymbol ? 'text-green-700' : 'text-gray-700'
                } transition-colors duration-200`}>
                  Contains a number or symbol
                </span>
              </li>
            </ul>

            <button
              type="submit"
              disabled={isLoading || (formData.password && !isPasswordComplete)}
              className={`w-full py-2.5 rounded-[10px] text-[16px] lg:text-[18px] shadow-lg transition flex items-center justify-center gap-2 ${
                isLoading || (formData.password && !isPasswordComplete)
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-[var(--color-green-main)] text-[var(--color-text-button)] hover:bg-[var(--color-bg-green-dark)]'
              }`}
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          <div className="flex items-center my-4 lg:my-6" aria-label="or-divider">
            <hr className="flex-grow border-[var(--color-border-divider)]" />
            <span className="mx-2 text-gray-700 text-base">
              OR
            </span>
            <hr className="flex-grow border-[var(--color-border-divider)]" />
          </div>

          <section className="space-y-3 pb-4">
            <GoogleSignInButton />
          </section>

          {/* Back to role selection link */}
          {role && (
            <div className="text-center mt-4">
              <Link
                to="/role-selection"
                className="text-sm text-[var(--color-text-link)] hover:underline"
              >
                ← Back to role selection
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Background Image */}
      <div
        className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden h-screen"
        style={{
          backgroundImage: "url('/images/bg_1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-green-gradient-start)] to-[var(--color-bg-green-gradient-end)] opacity-80 z-0"></div>

        {/* Support Icon */}
        <div className="absolute top-6 sm:top-8 flex items-center gap-2 z-10 cursor-pointer hover:underline">
          <MdOutlineSupportAgent className="text-white text-lg" />
          <span className="text-white text-lg">Support</span>
        </div>

        {/* Large screen: full circle */}
        <div
          className="absolute bottom-[-360px] right-[-120px] z-10 w-[750px] h-[750px]
        backdrop-blur-[1px] overflow-hidden bg-white/20 rounded-full  
        border border-white/30"
        />

        {/* Dynamic Text Content */}
        <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 z-20 w-[90%] sm:w-[500px] p-4 sm:p-6 bg-transparent text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            {roleContentData.title}
          </h2>
          <p className="text-white text-sm sm:text-base font-bold">
            {roleContentData.description}
          </p>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  supabaseUser: state.auth.supabaseUser,
});

Register.propTypes = {
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  supabaseUser: PropTypes.object,
};

export default connect(mapStateToProps, { register })(Register);
