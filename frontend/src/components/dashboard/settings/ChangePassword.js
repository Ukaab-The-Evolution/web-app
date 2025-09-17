import PropTypes from 'prop-types';
import { Navigate, useNavigate } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import ProfileHeader from '../../ui/ProfileHeader';
import Toast from '../../ui/Toast';

const ChangePassword = ({ isAuthenticated, user }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password validation state
    const [passwordValidation, setPasswordValidation] = useState({
        hasUppercase: false,
        hasMinLength: false,
        hasNumberOrSymbol: false
    });

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

        if (name === 'newPassword') {
            validatePassword(value);
        }
    };
    
    const changePassword = async (currentPassword, newPassword) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (currentPassword === "wrong") reject(new Error("Invalid current password"));
                else resolve("success");
            }, 1000);
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
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

        const isPasswordValid = validatePassword(formData.newPassword);
        
        if (!isPasswordValid) {
            setToast({
                type: "error",
                message: "Password does not meet the requirements.",
            });
            return;
        }

        if (!passwordValidation.hasMinLength) {
            setToast({
                type: "error",
                message: "Password must be at least 8 characters long.",
            });
            return;
        }

        if (!passwordValidation.hasNumberOrSymbol) {
            setToast({
                type: "error",
                message: "Password must have a number or a symbol.",
            });
            return;
        }

        if (!passwordValidation.hasUppercase) {
            setToast({
                type: "error",
                message: "Password must have an uppercase letter.",
            });
            return;
        }

        setIsLoading(true);
        
        try {
            await changePassword(formData.currentPassword, formData.newPassword);
            setToast({
                type: "success",
                message: "Password changed successfully!",
            });
            setTimeout(() => {
                navigate('/dashboard/settings');
            }, 3000); 
        } catch (error) {
            setToast({
                type: "error",
                message: "Failed to change password. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isPasswordComplete = passwordValidation.hasUppercase && passwordValidation.hasMinLength && passwordValidation.hasNumberOrSymbol;

    return (
        <div className="min-h-screen bg-white">
            {/* Toast */}
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header */}
            <ProfileHeader
                userName={user?.full_name || "Ahmed"}
                title="Settings"
                subtitle="Manage all your settings here!"
                userAvatar={user?.avatar_url}
            />

            {/* Main Content */}
            <div className="max-w-xl mx-auto px-6 py-0 items-center justify-center">
                <div className="bg-white rounded-xl p-6">
                    <h2 className="text-lg text-center font-semibold text-[#3B6255] mb-6">Change Password</h2>
                    
                    <form onSubmit={onSubmit} className="space-y-8">
                        {/* Current Password Field */}
                        <div className="flex items-center gap-8">
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-[#3B6255] text-wrap max-w-16">
                                Current Password
                            </label>
                            <div className="relative flex-1">
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    name="currentPassword"
                                    id="currentPassword"
                                    required
                                    value={formData.currentPassword}
                                    onChange={onChange}
                                    className="w-full px-4 py-3 pr-12 rounded-[10px] border border-1 border-[#578C7A] focus:outline-none focus:ring-1 focus:ring-[#578C7A]
                                    bg-[#B2D7CA3B] font-poppins font-normal text-[14px] leading-[100%] text-[#3B6255]
                                    transition-all duration-200 shadow-[inset_0px_2px_0px_0px_#E7EBEE33]"
                                />

                                <span
                                    className="absolute right-12 top-[8px] h-8 w-[1px] bg-[var(--color-border-input)]"
                                    aria-hidden="true"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(prev => !prev)}
                                    className="absolute right-0 top-0 w-[50px] h-[50px] rounded-tr-[6px] rounded-br-[6px]
                                    bg-transparent flex items-center justify-center focus:outline-none"
                                    tabIndex={-1}
                                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                                >
                                    <div className="w-[24px] h-[24px] text-[#3B6255]">
                                        {showCurrentPassword ? (
                                            <AiOutlineEyeInvisible size={20} />
                                        ) : (
                                            <AiOutlineEye size={20} />
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* New Password Field */}
                        <div className="flex items-center gap-8">
                            <label htmlFor="newPassword" className="block text-sm font-poppins font-medium text-[#3B6255] text-wrap max-w-16">
                                New Password
                            </label>
                            <div className="relative flex-1">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    id="newPassword"
                                    required
                                    value={formData.newPassword}
                                    onChange={onChange}
                                    className={`w-full px-4 py-3 pr-12 rounded-[10px] border border-1 border-[#578C7A] focus:outline-none focus:ring-1 focus:ring-[#578C7A] focus:border-transparent
                                    bg-[#B2D7CA3B] font-poppins font-normal text-[14px] leading-[100%] text-[#3B6255]
                                    transition-all duration-200 shadow-[inset_0px_2px_0px_0px_#E7EBEE33]
                                    ${formData.newPassword && !isPasswordComplete
                                        ? 'border-red-300 focus:ring-red-500'
                                        : formData.newPassword && isPasswordComplete
                                        ? 'border-green-300 focus:ring-green-500'
                                        : ''
                                    }`}
                                />

                                <span
                                    className="absolute right-12 top-[8px] h-8 w-[1px] bg-[var(--color-border-input)]"
                                    aria-hidden="true"
                                />

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

                        {/* Confirm Password Field */}
                        <div className="flex items-center gap-8">
                            <label htmlFor="confirmPassword" className="block text-sm font-poppins font-medium text-[#3B6255] text-wrap max-w-16">
                                Confirm Password
                            </label>
                            <div className="relative flex-1">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={onChange}
                                    className={`w-full px-4 py-3 pr-12 rounded-[10px] border border-1 border-[#578C7A] focus:outline-none focus:ring-1 focus:ring-[#578C7A] focus:border-transparent
                                    bg-[#B2D7CA3B] font-poppins font-normal text-[14px] leading-[100%] text-[#3B6255]
                                    transition-all duration-200 shadow-[inset_0px_2px_0px_0px_#E7EBEE33]
                                    ${formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                                        ? 'border-red-300 focus:ring-red-500'
                                        : formData.confirmPassword && formData.newPassword === formData.confirmPassword
                                        ? 'border-green-300 focus:ring-green-500'
                                        : ''
                                    }`}
                                />

                                <span
                                    className="absolute right-12 top-[8px] h-8 w-[1px] bg-[var(--color-border-input)]"
                                    aria-hidden="true"
                                />

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

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-8 py-2 bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
                                shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] font-poppins font-medium text-white text-md
                                rounded-xl cursor-pointer transition-colors duration-300
                                hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center
                                disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

ChangePassword.propTypes = {
    isAuthenticated: PropTypes.bool,
    user: PropTypes.object,
};

const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
});

export default connect(mapStateToProps)(ChangePassword);