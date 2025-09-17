import PropTypes from 'prop-types';
import { Navigate, useNavigate } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import ProfileHeader from '../../ui/ProfileHeader';

const ChangePassword = ({ isAuthenticated, user }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            //dispatch(setAlert('Please fill in all fields', 'danger'));
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            //dispatch(setAlert('Passwords do not match', 'danger'));
            return;
        }

        setIsLoading(true);
        
        // Here you would typically call an action to change the password
        try {
            // await changePassword(formData.currentPassword, formData.newPassword);
            //dispatch(setAlert('Password changed successfully', 'success'));
            navigate('/settings');
        } catch (error) {
            //dispatch(setAlert('Failed to change password. Please try again.', 'danger'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
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
                    
                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Current Password Field */}
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-[#333333] mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    name="currentPassword"
                                    id="currentPassword"
                                    required
                                    value={formData.currentPassword}
                                    onChange={onChange}
                                    className="w-full px-4 py-2 bg-[#E8F2EE] border border-1 border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none focus:ring-1 focus:ring-[#3B6255] pr-12"
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(prev => !prev)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#3B6255]"
                                >
                                    {showCurrentPassword ? (
                                        <AiOutlineEyeInvisible size={20} />
                                    ) : (
                                        <AiOutlineEye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* New Password Field */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-[#333333] mb-2">
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
                                    className="w-full px-4 py-2 bg-[#E8F2EE] border border-1 border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none focus:ring-1 focus:ring-[#3B6255] pr-12"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(prev => !prev)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#3B6255]"
                                >
                                    {showNewPassword ? (
                                        <AiOutlineEyeInvisible size={20} />
                                    ) : (
                                        <AiOutlineEye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#333333] mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={onChange}
                                    className="w-full px-4 py-2 bg-[#E8F2EE] border border-1 border-[#578C7A] rounded-lg text-[#3B6255] focus:outline-none focus:ring-1 focus:ring-[#3B6255] pr-12"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(prev => !prev)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#3B6255]"
                                >
                                    {showConfirmPassword ? (
                                        <AiOutlineEyeInvisible size={20} />
                                    ) : (
                                        <AiOutlineEye size={20} />
                                    )}
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
                                {isLoading ? 'Submitting...' : 'Submit'}
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