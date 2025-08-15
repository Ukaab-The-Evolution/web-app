import PropTypes from 'prop-types';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { useState } from 'react';
import { MdOutlineSupportAgent } from 'react-icons/md';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import axios from 'axios';
import Toast from '../ui/Toast';

const ResetPassword = ({ isAuthenticated }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [toast, setToast] = useState(null);
  
    // Password validation state
    const [passwordValidation, setPasswordValidation] = useState({
        hasUppercase: false,
        hasMinLength: false,
        hasNumberOrSymbol: false
    });

    // Get email from location state (passed from OTP verification)
    const email = location.state?.email;

    if (isAuthenticated) {
        return <Navigate to='/dashboard' />;
    }

    //if (!email || !location.state?.otpVerified) {
      //  return <Navigate to='/forgot-password' />;
    //}

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
        setFormData({ ...formData, [name]: value });
    
        // Validate password
        if (name === 'newPassword') {
            validatePassword(value);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
    
        // Validate passwords
        if (!formData.newPassword || !formData.confirmPassword) {
            setToast({
                type: "error",
                message: "Please fill in all fields.",
            });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setToast({
                type: "error",
                message: "Passwords do not match.",
            });
            return;
        }

        // Final password validation before submission
        const isPasswordValid = validatePassword(formData.newPassword);
    
        if (!isPasswordValid) {
            setToast({
                type: "error",
                message: "Password does not meet requirements.",
            });
            return;
        }

        setIsLoading(true);

        try {

            // Insert backend api call here with {email, newPassword}

            const res = await axios.post('/api/reset-password', {
                email: email,
                newPassword: formData.newPassword
            });

            if (res.data.success) {
                setToast({
                    type: "success",
                    message: "Password has been reset successfully.",
                });
        
                // Redirect to login after successful reset
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } 
            else {
                setToast({
                    type: "error",
                    message: res.data.message || "Failed to reset password.",
                });
            }
        } catch (error) {
            console.error("Reset password error:", error);
            setToast({
                type: "error",
                message: error.response?.data?.message || "An error occurred. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Check if all password requirements are met
    const isPasswordComplete = passwordValidation.hasUppercase && passwordValidation.hasMinLength && passwordValidation.hasNumberOrSymbol;

    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-poppins overflow-hidden">
            
            {/* Toast */}
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Logo */}
            <div className="absolute top-4 left-4 sm:left-28 md:left-16 flex items-center z-20">
                <img
                    src="/images/IconGreen.png"
                    alt="Ukaab Logo"
                    className="w-[70px] h-[55px] sm:w-[80px] sm:h-[63px] md:w-[85px] md:h-[67px] -mr-2"
                />
                <span className="text-xl sm:text-2xl md:text-[25px] font-radley font-normal text-[#3B6255] leading-none">
                    Ukaab
                </span>
            </div>
          
            {/* Left Section */}
            <div className="flex justify-center w-full lg:w-1/2 px-6 sm:px-10 md:px-16 lg:px-20 py-24 bg-white">
                <div className="w-full max-w-md">
                
                    {/* Header */}
                    <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">
                        Reset Password
                    </h1>
              
                    {/* Description */}
                    <p className="w-full sm:max-w-[500px] h-[48px] font-sans font-medium text-base leading-6 text-[#5F5F5F] opacity-100 mb-4 text-left sm:text-left">
                        Setup your new password.
                    </p>

                    <form onSubmit={onSubmit} className="space-y-6 lg:space-y-7">
                 
                        {/* New Password Field */}
                        <div>
                            <label htmlFor="newPassword" className="block w-[102px] h-[21px] font-poppins font-normal text-[14px] leading-[100%] text-[#7B7F8D]">
                                New Password
                            </label>
                
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    id="newPassword"
                                    required
                                    value={formData.newPassword}
                                    onChange={onChange}
                                    className={`w-full max-w-[500px] h-[49px] px-4 pr-12 py-1 rounded-[10px] border border-[#578C7A] bg-[#B2D7CA3B]
                                    font-poppins font-normal text-[14px] leading-[100%] text-[#3B6255] placeholder-[#5F5F5F]
                                    focus:outline-none focus:ring-2 focus:ring-[#578C7A] focus:border-transparent
                                    transition-all duration-200 shadow-[inset_0px_2px_0px_0px_#E7EBEE33]
                                    ${ 
                                        formData.newPassword && !isPasswordComplete
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : formData.newPassword && isPasswordComplete
                                        ? 'border-green-300 focus:ring-green-500'
                                        : ''
                                    }`}
                                    placeholder="••••••••"
                                />
                
                                <span className="absolute right-10 top-[12px] h-6 w-px bg-[#578C7A]" aria-hidden="true" />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(prev => !prev)}
                                    className="absolute right-2 top-[9px] text-[#3B6255] focus:outline-none"
                                    tabIndex={-1}
                                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showNewPassword ? (
                                        <AiOutlineEyeInvisible size={22} />
                                    ) : (
                                        <AiOutlineEye size={22} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Password requirements with dynamic validation */}
                        <ul className="mt-0 mb-4 text-[12px] lg:text-[14px] space-y-2">
                            <li className="flex items-center gap-2">
                                <span className={`${ passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-400' }
                                    transition-colors duration-200 text-[16px]` }>
                                    { passwordValidation.hasUppercase ? '✓' : '○'  }
                                </span>
                                <span className={`${ passwordValidation.hasUppercase ? 'text-green-700' : 'text-gray-700' }
                                    transition-colors duration-200`}>
                                    Contains at least one capital character
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={`${ passwordValidation.hasMinLength ? 'text-green-600' : 'text-gray-400' }
                                    transition-colors duration-200 text-[16px]`}>
                                    {passwordValidation.hasMinLength ? '✓' : '○'}
                                </span>
                                <span className={`${ passwordValidation.hasMinLength ? 'text-green-700' : 'text-gray-700' }
                                    transition-colors duration-200`}>
                                    At least 8 characters
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={`${ passwordValidation.hasNumberOrSymbol ? 'text-green-600' : 'text-gray-400' }
                                    transition-colors duration-200 text-[16px]`}>
                                    {passwordValidation.hasNumberOrSymbol ? '✓' : '○'}
                                </span>
                                <span className={`${ passwordValidation.hasNumberOrSymbol ? 'text-green-700' : 'text-gray-700' }
                                    transition-colors duration-200`}>
                                    Contains a number or symbol
                                </span>
                            </li>
                        </ul>

                        {/* Confirm New Password Field */}
                        <div>
                            <label 
                                htmlFor="confirmPassword" 
                                className="block mb-2 font-poppins font-normal text-[14px] leading-[100%] text-[#7B7F8D]"
                            >
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={onChange}
                                    className={`w-full max-w-[500px] h-[49px] px-4 pr-12 py-1 rounded-[10px] border border-[#578C7A] bg-[#B2D7CA3B]
                                    font-poppins font-normal text-[14px] leading-[100%] text-[#3B6255] placeholder-[#5F5F5F]
                                    focus:outline-none focus:ring-2 focus:ring-[#578C7A] focus:border-transparent
                                    transition-all duration-200 shadow-[inset_0px_2px_0px_0px_#E7EBEE33]
                                    ${
                                        formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : formData.confirmPassword && formData.newPassword === formData.confirmPassword
                                        ? 'border-green-300 focus:ring-green-500'
                                        : ''
                                    }`}
                                    placeholder="••••••••"
                                />
                
                                <span
                                    className="absolute right-10 top-[12px] h-6 w-px bg-[#578C7A]"
                                    aria-hidden="true"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(prev => !prev)}
                                    className="absolute right-2 top-[9px] text-[#3B6255] focus:outline-none"
                                    tabIndex={-1}
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? (
                                        <AiOutlineEyeInvisible size={22} />
                                    ) : (
                                        <AiOutlineEye size={22} />
                                    )}
                                </button>
                            </div>
                        </div>
      
                        {/* Save Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !isPasswordComplete || formData.newPassword !== formData.confirmPassword}
                            className={`w-full sm:max-w-[500px] h-[50px] px-[25px] py-[9px] gap-[11px] rounded-[50px]
                            bg-gradient-to-t from-[#3B6255] to-[#578C7A] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)]
                            font-poppins font-semibold text-[18px] leading-[100%] text-white
                            flex items-center justify-center mt-8
                            cursor-pointer transition-all duration-300 ease-in hover:from-[#223931] hover:to-[#4A7D6D]
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </form>
                </div>
            </div>
      
            {/* Right Section */}
            <div className="flex w-full md:w-1/2 relative items-center justify-center overflow-hidden h-[50vh] sm:h-[60vh] md:h-screen"
                style={{
                    backgroundImage: "url('/images/bg_1.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}>
      
                {/* Gradient Overlay */}
                <div className="absolute inset-0 opacity-80"
                    style={{
                        background: "linear-gradient(360deg, #1B2D27 0%, #508171 100%)",
                        zIndex: 0,
                    }}
                ></div>
              
                {/* Support Icon */}
                <div className="absolute top-5 sm:top-8 flex items-center gap-2 z-10 cursor-pointer">
                    <MdOutlineSupportAgent className="text-[#F7FAFC] text-lg" />
                    <span className="text-[#F7FAFC] text-lg"> Support </span>
                </div>
      
                {/* Ellipse */}
                <div className="absolute bottom-[-490px] right-[-215px] z-10 w-[803px] h-[767px] backdrop-blur-[1px] rounded-full border border-white/30 hidden lg:block bg-gradient-to-b from-[rgba(247,250,252,0.4)] to-[rgba(237,242,247,0)]" />
      
                {/* Text Content */}
                <div className="absolute bottom-14 sm:bottom-12 left-0 sm:left-16 w-full px-8 sm:px-20 text-center z-10" >
                    <div className="max-w-[501px] mx-auto space-y-[18px]">
                        <h2 className="font-poppins font-extrabold text-[32px] sm:text-[40px] text-[#F7FAFC] leading-tight">
                            Trouble signing in?
                        </h2>
              
                        <p className="font-poppins font-medium text-white/90 text-[16px] sm:text-[18px] leading-[1.38]">
                            Don't worry! We're here to help you get back in securely.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    ); 
};
            
ResetPassword.propTypes = {
    isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(ResetPassword);