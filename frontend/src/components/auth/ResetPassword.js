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

    // Uncomment the following condition after connecting the page to the backend 

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
        <div className="min-h-screen flex flex-col lg:flex-row font-poppins overflow-hidden bg-[#f8fafc]">

            {/* Toast */}
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Logo */}
            <div className="absolute top-0 left-1/2 pr-6 transform -translate-x-1/2 flex items-center z-20 md:top-4 md:left-16 md:transform-none">
                <img
                    src="/images/IconGreenTransparent.png"
                    alt="Ukaab Logo"
                    className="w-[85px] mr-[-9px]"
                />
                <span className="text-[25px] font-radley font-normal text-[#3B6255] leading-none">
                    Ukaab
                </span>
            </div>


            {/* Left Section */}
            <div className="flex justify-center items-start w-full lg:w-1/2 
                p-4 sm:p-6 md:p-8 px-8 lg:px-16 pb-8 pt-24 md:pt-32">
                <div className="w-full max-w-lg">



                    {/* Header */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed text-[#333333] mb-4">
                        Reset Password
                    </h1>

                    {/* Description */}
                    <p className="w-full sm:max-w-[500px] h-[48px] font-sans font-medium text-base leading-6 text-[#5F5F5F] opacity-100 mb-4 text-left sm:text-left">
                        Setup your new password.
                    </p>

                    <form onSubmit={onSubmit}>

                        {/* New Password Field */}
                        <div>
                            <label htmlFor="newPassword" className="block  h-[21px] font-poppins font-normal text-[14px] leading-[100%] text-[#7B7F8D]">
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
                                    className={`w-full h-[49px] px-4 py-1 rounded-[10px] border border-[#578C7A] bg-[#B2D7CA3B]
                                    font-poppins font-normal text-[14px] leading-[100%] text-[#3B6255] placeholder-[#5F5F5F]
                                    focus:outline-none focus:ring-2 focus:ring-[#578C7A] focus:border-transparent
                                    transition-all duration-200 shadow-[inset_0px_2px_0px_0px_#E7EBEE33] pr-[70px]
                                    ${formData.newPassword && !isPasswordComplete
                                            ? 'border-red-300 focus:ring-red-500'
                                            : formData.newPassword && isPasswordComplete
                                                ? 'border-green-300 focus:ring-green-500'
                                                : ''
                                        }`}
                                    placeholder="********"
                                />

                                {/* Vertical Divider */}
                                <span className="absolute right-[54px] top-[4.5px] w-[1px] h-[40px] bg-[#CFD9E0]" aria-hidden="true" />

                                {/* Eye Icon Container */}
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(prev => !prev)}
                                    className="absolute right-0 top-0 w-[50px] h-[50px] rounded-tr-[6px] rounded-br-[6px]
                                    bg-transparent flex items-center justify-center focus:outline-none"
                                    tabIndex={-1}
                                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                >
                                    <div className="w-[24px] h-[24px] text-[#3B6255]">
                                        {showNewPassword ? (
                                            <AiOutlineEyeInvisible size={20} />
                                        ) : (
                                            <AiOutlineEye size={20} />
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Password requirements with dynamic validation */}
                        <ul className="mt-2 mb-8 text-[12px] lg:text-[12px] space-y-1">
                            <li className="flex items-center gap-2">
                                <span className={`${passwordValidation.hasUppercase ? 'text-green-600' : 'text-[#525252]'}
                                    transition-colors duration-200 text-[16px]` }>
                                    {passwordValidation.hasUppercase ? '✓' : '○'}
                                </span>
                                <span className={`${passwordValidation.hasUppercase ? 'text-green-700' : 'text-[#525252]'}
                                    transition-colors duration-200`}>
                                    Contains at least one capital character
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={`${passwordValidation.hasMinLength ? 'text-green-600' : 'text-[#525252]'}
                                    transition-colors duration-200 text-[16px]`}>
                                    {passwordValidation.hasMinLength ? '✓' : '○'}
                                </span>
                                <span className={`${passwordValidation.hasMinLength ? 'text-green-700' : 'text-[#525252]'}
                                    transition-colors duration-200`}>
                                    At least 8 characters
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={`${passwordValidation.hasNumberOrSymbol ? 'text-green-600' : 'text-[#525252]'}
                                    transition-colors duration-200 text-[16px]`}>
                                    {passwordValidation.hasNumberOrSymbol ? '✓' : '○'}
                                </span>
                                <span className={`${passwordValidation.hasNumberOrSymbol ? 'text-green-700' : 'text-[#525252]'}
                                    transition-colors duration-200`}>
                                    Contains a number or symbol
                                </span>
                            </li>
                        </ul>

                        {/* Confirm New Password Field */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block  h-[21px] font-poppins font-normal text-[14px] leading-[100%] text-[#7B7F8D]"
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
                                    className={`w-full  h-[49px] px-4 pr-12 py-1 rounded-[10px] border border-[#578C7A] bg-[#B2D7CA3B]
                                    font-poppins font-normal text-[14px] leading-[100%] text-[#3B6255] placeholder-[#5F5F5F]
                                    focus:outline-none focus:ring-2 focus:ring-[#578C7A] focus:border-transparent
                                    transition-all duration-200 shadow-[inset_0px_2px_0px_0px_#E7EBEE33]
                                    ${formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                                            ? 'border-red-300 focus:ring-red-500'
                                            : formData.confirmPassword && formData.newPassword === formData.confirmPassword
                                                ? 'border-green-300 focus:ring-green-500'
                                                : ''
                                        }`}
                                    placeholder="********"
                                />

                                {/* Vertical Divider */}
                                <span className="absolute right-[54px] top-[4.5px] w-[1px] h-[40px] bg-[#CFD9E0]" aria-hidden="true" />

                                {/* Eye Icon Container */}
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(prev => !prev)}
                                    className="absolute right-0 top-0 w-[50px] h-[50px] rounded-tr-[6px] rounded-br-[6px]
                                    bg-transparent flex items-center justify-center focus:outline-none"
                                    tabIndex={-1}
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    <div className="w-[24px] h-[24px] text-[#3B6255]">
                                        {showConfirmPassword ? (
                                            <AiOutlineEyeInvisible size={20} />
                                        ) : (
                                            <AiOutlineEye size={20} />
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full  h-[45px] px-[25px] rounded-full 
                       bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
                       shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] font-poppins font-semibold text-[18px] leading-[100%] 
                       text-white mt-[25px] cursor-pointer transition-all duration-300 ease-in 
                       hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center gap-3
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Section */}
            <div
                className="flex w-full lg:w-1/2 relative  lg:items-center justify-center flex-1
             bg-cover bg-center md:overflow-hidden"
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
                    className="hidden md:block absolute z-10 rounded-full backdrop-blur-[1px] overflow-hidden 
               bg-gradient-to-b from-white/30 to-transparent 
               md:bottom-[-200px] md:right-[-40px] md:w-[600px] md:h-[600px] 
               lg:bottom-[-260px] lg:right-[-100px] lg:w-[650px] lg:h-[650px]
               pointer-events-none"
                />

                {/* Text Content */}
                <div className="relative z-20 w-full max-w-md px-6 py-32 sm:py-28 md:py-20 text-center md:absolute md:bottom-5  md:right-8 font-poppins">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-white mb-5">
                        Trouble Signing in!
                    </h2>
                    <p className="text-white text-base md:text-lg lg:text-lg xl:text-xl font-medium font-poppins leading-relaxed">
                        Don't worry! We're here to help you get back in securely.
                    </p>
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