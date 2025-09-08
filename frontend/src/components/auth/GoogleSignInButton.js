import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { signInWithGoogle } from '../../actions/auth';
import { FcGoogle } from 'react-icons/fc';
import { FaTimes } from 'react-icons/fa';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Toast from "../ui/Toast";
import { getInitialFormData, isValidRole } from '../../utils/fieldsConfig';

const GoogleSignInButton = ({
  signInWithGoogle, 
  googleLoading,
  buttonText = 'Continue with Google',
  className = '',
  disabled = false
}) => {
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    companyCode: '',
    companyName: '',
    phone: '',
    password: ''
  }); 

  // Extract role from URL params and initialize form
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const roleParam = urlParams.get('role');

    if (roleParam && isValidRole(roleParam)) {
      setUserRole(roleParam);
      setFormData((prev) => ({ ...prev, ...getInitialFormData(roleParam) }));
    } else {
      setUserRole(null); // invalid or missing role
    }
  }, [location.search]);

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    hasUppercase: false,
    hasMinLength: false,
    hasNumberOrSymbol: false
  });

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

  const validatePhone = (phone) => {
    // phone number format validation
    const phoneRegex = /^(\+92|0)?[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate password in real-time
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleGoogleSignIn = () => {
    if (!disabled && !googleLoading) {
      setShowPopup(true);
    }
  };

  const resetForm = () => {
    setFormData({
      companyCode: '',
      companyName: '',
      phone: '',
      password: ''
    });
    setPasswordValidation({
      hasUppercase: false,
      hasMinLength: false,
      hasNumberOrSymbol: false
    });
  };

  const handleContinue = async () => {
    if (userRole === 'truckDriver') {
      if (!formData.companyCode.trim()) {
        setToast({
          type: "error",
          message: "Company code is required.",
        });
        return;
      }
    } else {
      if (!formData.companyName.trim()) {
        setToast({
          type: "error",
          message: "Company name is required.",
        });
        return;
      }
    }

    if (!formData.phone.trim()) {
      setToast({
        type: "error",
        message: "Phone number is required.",
      });
      return;
    }

    if (!validatePhone(formData.phone)) {
      setToast({
        type: "error",
        message: "Please enter a valid phone number (e.g., 0300 1234567).",
      });
      return;
    }

    // Final password validation before submission
    const isPasswordValid = validatePassword(formData.password || '');

    if (!isPasswordValid) {
      setToast({
        type: "error",
        message: "Password does not meet requirements."
      });
      return;
    }

    try {
      // Pass the form data to the Google sign-in action
      await signInWithGoogle({
        userRole,
        ...formData
      });
      setShowPopup(false);
      resetForm();
    } catch (error) {
      console.error('Error signing up:', error);
      setToast({
        type: "error",
        message: "Failed to sign up. Please try again.",
      });
    }    
  };

  const handleCloseModal = () => {
    setShowPopup(false);
    resetForm();
  };

  // Check if all password requirements are met
  const isPasswordComplete = passwordValidation.hasUppercase && passwordValidation.hasMinLength && passwordValidation.hasNumberOrSymbol;

  const renderPasswordField = () => (
    <div className="mb-6">
      <div className="flex items-center space-x-4">
        <label className="block text-sm font-medium text-[#171717] min-w-[100px]">
          Password
        </label>
        <div className="relative w-full">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="********"
            className={`w-full px-4 py-3 bg-[#B2D7CA3B] border rounded-[10px] text-[#3B6255]
            font-poppins font-normal text-[14px] placeholder-[#5F5F5F]
            focus:outline-none focus:ring-1 focus:ring-[#578C7A] focus:border-[#578C7A]
            transition-all duration-200 shadow-[inset_0px_2px_0px_0px_#E7EBEE33]
            placeholder:relative placeholder:top-[2px]
            ${formData.password && !isPasswordComplete
              ? 'border-red-300 focus:ring-red-500'
              : formData.password && isPasswordComplete
              ? 'border-green-300 focus:ring-green-500'
              : 'border-[#578C7A]'
            }`}
          />

          {/* Vertical Divider */}
          <span 
            className="absolute right-10 top-[8px] h-8 w-[1px] bg-[var(--color-border-input)]"
            aria-hidden="true"
          />
              
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3B6255] focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
          </button>
        </div>
      </div>

      {/* Password requirements */}
      <ul className="mt-4 text-[12px] space-y-1">
        <li className={`flex items-center gap-2 ${passwordValidation.hasUppercase ? 'text-green-700' : 'text-[#525252]'}`}>
          {passwordValidation.hasUppercase ? '✓' : '○'} Contains at least one capital character
        </li>
        <li className={`flex items-center gap-2 ${passwordValidation.hasMinLength ? 'text-green-700' : 'text-[#525252]'}`}>
          {passwordValidation.hasMinLength ? '✓' : '○'} At least 8 characters
        </li>
        <li className={`flex items-center gap-2 ${passwordValidation.hasNumberOrSymbol ? 'text-green-700' : 'text-[#525252]'}`}>
          {passwordValidation.hasNumberOrSymbol ? '✓' : '○'} Contains a number or symbol
        </li>
      </ul>
    </div>
  );

  const renderFormFields = () => {

    if (userRole === 'truckDriver') {
      return (
        <>
          {/* Company Code */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <label className="block text-sm font-medium text-[#171717] min-w-[55px] max-w-[100px]">
                Company Code
              </label>
              <input
                type="text"
                name="companyCode"
                value={formData.companyCode}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value)) {
                    handleInputChange(e);
                  }
                }}
                placeholder="1234"
                className="flex-1 px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A] 
                rounded-[10px] text-[#3B6255] font-poppins font-normal text-[14px]
                focus:outline-none focus:ring-1 focus:ring-[#578C7A] focus:border-[#578C7A]"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <label className="block text-sm font-medium text-[#171717] min-w-[100px]">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  if (/^\+?\d*$/.test(e.target.value)) {
                    handleInputChange(e);
                  }
                }}
                placeholder="0300 1234567"
                className="flex-1 px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A]
                rounded-[10px] text-[#3B6255] font-poppins font-normal text-[14px]
                focus:outline-none focus:ring-1 focus:ring-[#578C7A] focus:border-[#578C7A]"
              />
            </div>
          </div>

          {renderPasswordField()}

        </>
      );
    } else {
      // For trucking company and shipper
      return (
        <>
          {/* Company Name */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <label className="block text-sm font-medium text-[#171717] min-w-[55px] max-w-[100px]">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="ABC Company"
                className="flex-1 px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A]
                rounded-[10px] text-[#3B6255] font-poppins font-normal text-[14px]
                focus:outline-none focus:ring-1 focus:ring-[#578C7A] focus:border-[#578C7A]"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <label className="block text-sm font-medium text-[#171717] min-w-[100px]">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  if (/^\+?\d*$/.test(e.target.value)) {
                    handleInputChange(e);
                  }
                }}
                placeholder="0300 1234567"
                className="flex-1 px-4 py-3 bg-[#B2D7CA3B] border border-[#578C7A]
                rounded-[10px] text-[#3B6255] font-poppins font-normal text-[14px]
                focus:outline-none focus:ring-1 focus:ring-[#578C7A] focus:border-[#578C7A]"
              />
            </div>
          </div>

          {renderPasswordField()}

        </>
      );
    }
  };
  
  const baseClasses = "w-full flex items-center justify-center  h-[45px] px-[25px] gap-3 rounded-full border border-[var(--color-border-social)] bg-[var(--color-bg-white)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-social)] text-base shadow-none font-[var(--font-poppins)] transition-colors";
  const disabledClasses = (googleLoading || disabled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <>
      <button
        type='button'
        onClick={handleGoogleSignIn}
        disabled={googleLoading || disabled}
        className={`${baseClasses} ${disabledClasses} ${className}`}
        aria-label={buttonText}
      >
        <FcGoogle className='text-2xl' />
        {googleLoading ? 'Signing in...' : buttonText}
      </button>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
            
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-[#171717] hover:text-gray-600"
            >
              <FaTimes className="w-5 h-5" />
            </button>
            
            {/* Modal Header */}
            <h2 className="text-xl font-semibold text-[#3B6255] mb-10">Signing up with Google</h2>
            <p className="text-[#171717] font-regular mb-6">Enter the following details:</p>
            
            {/* Dynamic Form Fields */}
            <div className="mb-6">              
              {renderFormFields()}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={resetForm}
                className="w-2/4 h-[45px] px-2 text-[#171717] font-poppins font-medium text-[16px]
                rounded-full bg-[#D4D4D4] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25)] 
                hover:bg-gray-200 mt-[6px] transition-colors duration-300
                flex items-center justify-center"
              >
                Remove
              </button>
              
              <button
                onClick={handleContinue}
                className="w-2/4 h-[45px] px-2 rounded-full 
                bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
                shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] font-poppins font-medium text-[16px]
                text-white mt-[6px] cursor-pointer transition-colors duration-300
                hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center"
              >
                {googleLoading ? 'Signing up...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  googleLoading: state.auth.googleLoading,
});

export default connect(mapStateToProps, { signInWithGoogle })(GoogleSignInButton);