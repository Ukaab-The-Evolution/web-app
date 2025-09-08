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
    } else {
      setRole(null);
    }
  }, [location.search]);

  if (role === null) {
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
          className="block text-sm text-[#7B7F8D] mb-1"
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
            className={`w-full px-4 py-2 ${isPasswordField ? 'pr-12' : ''}
            rounded-[10px] bg-[#B2D7CA3B] border focus:border-transparent
            ${isPasswordField && formData.password && !isPasswordComplete
              ? 'border-red-300 focus:ring-red-500'
              : isPasswordField && formData.password && isPasswordComplete
              ? 'border-green-300 focus:ring-green-500'
              : 'border-[#578C7A] focus:ring-[#578C7A]  '
            } 
            text-[var(--color-text-main)] font-[var(--font-poppins)] focus:outline-none focus:ring-1
            ${isPasswordField ? 'placeholder:relative placeholder:top-[3px] leading-[1.8]' : ''} `}

            placeholder={field.placeholder}
          />

          {isPasswordField && (
            <>
              <span
                className="absolute right-12 top-[8px] h-8 w-[1px] bg-[var(--color-border-input)]"
                aria-hidden="true"
              />
              
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-0 top-0 w-[50px] h-[50px]
                rounded-tr-[6px] rounded-br-[6px] bg-transparent
                flex items-center justify-center text-[var(--color-text-main)] focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <div className="w-[24px] h-[24px] text-[#3B6255]">
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col  lg:flex-row relative font-poppins bg-[#f8fafc]">
      {/* Logo */}
      <div className="absolute top-0 left-1/2 pr-6 transform -translate-x-1/2 flex items-center z-40 md:top-4 md:left-16 md:transform-none">
        <img
          src="/images/IconGreenTransparent.png"
          alt="Ukaab Logo"
          className="w-[85px] mr-[-9px]"
        />
        <span className="text-[25px] font-radley font-normal text-[#3B6255] leading-none">
          Ukaab
        </span>
      </div>

      {/* Left Section - Register Form */}
      <div className="flex items-center justify-center p-4 sm:p-6 pt-20 sm:pt-20 md:pt-28 md:p-8 lg:px-16 px-4  w-full lg:w-1/2 h-full">

        <div className="w-full max-w-lg px-6 md:px-0 ">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed text-[#333333] mb-2">
            Sign Up
          </h1>

          <p className="text-[#7b7f8d] mb-4 lg:mb-6">
            Already have an account?{' '}
            <Link
              to='/login'
              className="text-[var(--color-green-main)] underline font-semibold font-poppins"
            >
              Login
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
            <ul className="text-[12px] lg:text-[14px] space-y-1">
              <li className="flex items-center gap-2">
                <span className={`${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-400'} transition-colors duration-200`}>
                  {passwordValidation.hasUppercase ? '✓' : '○'}
                </span>
                <span className={`${passwordValidation.hasUppercase ? 'text-green-700' : 'text-gray-700'} transition-colors duration-200`}>
                  Contains at least one capital character
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className={`${passwordValidation.hasMinLength ? 'text-green-600' : 'text-gray-400'} transition-colors duration-200`}>
                  {passwordValidation.hasMinLength ? '✓' : '○'}
                </span>
                <span className={`${passwordValidation.hasMinLength ? 'text-green-700' : 'text-gray-700'} transition-colors duration-200`}>
                  At least 8 characters
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className={`${passwordValidation.hasNumberOrSymbol ? 'text-green-600' : 'text-gray-400'} transition-colors duration-200`}>
                  {passwordValidation.hasNumberOrSymbol ? '✓' : '○'}
                </span>
                <span className={`${passwordValidation.hasNumberOrSymbol ? 'text-green-700' : 'text-gray-700'} transition-colors duration-200`}>
                  Contains a number or symbol
                </span>
              </li>
            </ul>

            <button
              type="submit"
              disabled={isLoading || (formData.password && !isPasswordComplete)}
              className={`w-full h-[45px] px-[25px] rounded-full 
              bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
              shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] font-poppins font-semibold text-[18px] leading-[100%] 
              text-white mt-[20px] cursor-pointer transition-all duration-300 ease-in 
              hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center gap-3 
              ${isLoading || (formData.password && !isPasswordComplete)
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-[var(--color-green-main)] text-[var(--color-text-button)] hover:bg-[var(--color-bg-green-dark)]'
              }`}
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          <div className='flex items-center my-3' aria-label='or-divider'>
            <hr className='flex-grow border-[var(--color-green-main)]' />
            <span className='mx-2 text-[#737373] text-base font-poppins'>
              OR
            </span>
            <hr className='flex-grow border-[var(--color-green-main)]' />
          </div>

          <section className="space-y-2 pb-2">
            <GoogleSignInButton />
          </section>

          {/* Back to role selection link */}
          {role && (
            <div className="text-center">
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

      {/* Right Section */}
      <div
        className="hidden lg:flex w-full lg:w-1/2 relative lg:items-center justify-center flex-1 bg-cover bg-center md:overflow-hidden"
        style={{
          backgroundImage: "url('/images/bg_1.jpg')",
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-green-gradient-start)] to-[var(--color-bg-green-gradient-end)] opacity-80 z-0"></div>

        {/* Support Icon */}
        <div className="absolute top-6 sm:top-8 flex items-center gap-2 z-10 cursor-pointer hover:underline hover:decoration-white">
          <MdOutlineSupportAgent className="text-white text-lg" />
          <span className="text-white text-lg">Support</span>
        </div>

        {/* Decorative Circle (desktop only) */}
        <div
          className="hidden md:block absolute z-10 rounded-full backdrop-blur-[1px]
          overflow-hidden bg-gradient-to-b from-white/30 to-transparent 
          md:bottom-[-200px] md:right-[-40px] md:w-[600px] md:h-[600px] 
          lg:bottom-[-260px] lg:right-[-100px] lg:w-[650px] lg:h-[650px]
          pointer-events-none"
        />

        {/* Text Content */}
        <div className="relative z-20 w-full max-w-md px-6 py-32 sm:py-28 md:py-20 text-center md:absolute md:-bottom-5  md:right-5 font-poppins">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-white mb-5">
            Welcome to Ukaab!
          </h2>
          <p className="text-white text-base md:text-lg lg:text-lg xl:text-xl font-medium font-poppins leading-relaxed">
            Get started in seconds – connect with shippers, fleets, and drivers instantly to post
            requests, assign loads, and track in real time across one unified platform.
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
