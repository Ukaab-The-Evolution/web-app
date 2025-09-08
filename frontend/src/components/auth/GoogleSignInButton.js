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

    if (userRole === 'truckDriver' && !formData.phone.trim()) {
      setToast({
        type: "error",
        message: "Phone number is required.",
      });
      return;
    }

    if (userRole === 'truckDriver' && !validatePhone(formData.phone)) {
      setToast({
        type: "error",
        message: "Please enter a valid phone number (e.g., 0300 1234567).",
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

  const getPopupDescription = () => {
    switch (userRole) {
      case 'truckDriver':
        return 'Enter the following details:';
      case 'truckingCompany':
        return 'Enter your company name:';
      case 'shipper':
      default:
        return 'Enter your company name:';
    }
  };

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
        </>
      );
    } else {
      // For trucking company and shipper
      return (
        <>
          {/* Company Name */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <label className="block text-sm font-medium text-[#171717] min-w-[65px] max-w-[100px]">
                Name
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
          <div className="bg-white rounded-lg p-8 max-w-md w-[400px] mx-4 relative">
            
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-[#171717] hover:text-gray-600"
            >
              <FaTimes className="w-5 h-5" />
            </button>
            
            {/* Modal Header */}
            <h2 className="text-xl font-semibold text-[#3B6255] mb-12">Signing up with Google</h2>
            <p className="text-[#171717] font-regular mb-6">{getPopupDescription()}</p>
            
            {/* Dynamic Form Fields */}
            <div className="mb-12">              
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