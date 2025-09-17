import { useState } from 'react';
import ProfileHeader from '../../ui/ProfileHeader';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaChevronRight, FaTimes } from 'react-icons/fa';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { IoClose } from "react-icons/io5";

const Settings = ({ user }) => {
  const [activeSection, setActiveSection] = useState('account');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletePassword('');
    setShowPassword(false);
    setIsDeleting(false);
  };

  const handleConfirmDeletion = async () => {
    if (!deletePassword.trim()) {
      return;
    }

    setIsDeleting(true);
    
    setTimeout(() => {
      navigate('/register');
    }, 1500);
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
      <div className="max-w-10xl mx-auto pl-8 pb-6 px-0 py-1 items-center justify-center">
        <div className="bg-white rounded-xl p-6">
          
          {/* Content Area */}
          <div className="w-full md:w-3/4">
            {activeSection === 'account' && (
              <div>
                <h2 className="text-md font-medium text-[#A3A3A3] mb-6">Account</h2>
                <div className="space-y-6">
                    
                  <div className="flex justify-between items-center pb-2">
                    <h3 className="text-md font-medium text-[#171717] ml-8">Edit Profile</h3>
                    <button 
                      onClick={() => navigate('/dashboard/profile')}
                      className="w-8 h-8 flex items-center justify-center text-[#578C7A] hover:text-gray-600 transition-colors"
                      aria-label='Go to Profile'
                    >
                      <FaChevronRight />
                    </button>
                  </div>     

                  <div className="flex justify-between items-center pb-4">
                    <h3 className="text-md font-medium text-[#171717] ml-8">Change Password</h3>
                    <button 
                      onClick={() => navigate('/dashboard/change-password')}
                      className="w-8 h-8 flex items-center justify-center text-[#578C7A] hover:text-gray-600 transition-colors"
                      aria-label='Go to Change Password'
                    >
                      <FaChevronRight />
                    </button>
                  </div>     
                </div>
              
                <h3 className="text-md font-medium text-[#A3A3A3] mb-6 mt-6">Preferences</h3>
                <div className="space-y-6">
                    
                  <div className="flex justify-between items-center pb-4 ml-8">
                    <h3 className="text-md font-medium text-[#171717]">Notifications</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-[#A3A3A3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B6255]"></div>
                    </label>
                  </div>        
                </div>
                    
                <h3 className="text-md font-medium text-[#A3A3A3] mb-6 mt-6">Delete Account</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 ml-8">
                    <p className="text-md font-medium text-[#171717]">Permanently delete my account.</p>
                    <button 
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-white border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors">
                      Delete my Account
                    </button>
                  </div>
                </div>                    
              </div>  
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-auto p-4">

            {/* Dialog Header */}
            <div className="flex justify-between items-center pl-6 pr-6 pt-4 mb-4">
              <h2 className="text-lg font-poppins font-semibold text-[#3B6255]">Delete Account</h2>
              <button
                onClick={handleCloseDeleteDialog}
                className="relative text-[#171717] hover:text-gray-600 transition-colors"
                aria-label="Close dialog"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>
            
            {/* Dialog Content */}
            <div className="p-6 space-y-8">
              <p className="text-[#171717] text-md">
                Are you sure you want to delete your account?
              </p>

              <div className="space-y-4">
                <p className="text-[#171717] text-sm">
                  Enter your current password to continue:
                </p>

                <div className="space-y-1">
                  <label htmlFor="delete-password" className="block text-sm text-[#7B7F8D]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="delete-password"
                      type={showPassword ? "text" : "password"}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-[10px] border border-1 border-[#578C7A] focus:outline-none focus:ring-1 focus:ring-[#578C7A]
                      bg-[#B2D7CA3B] font-poppins font-normal text-[14px] leading-[100%] text-[#3B6255]
                      transition-all duration-200 shadow-[inset_0px_2px_0px_0px_#E7EBEE33]
                      placeholder:relative placeholder:top-[2px] placeholder:text-[#3B6255]"
                      placeholder="**********"
                      disabled={isDeleting}
                    />

                    <span
                      className="absolute right-12 top-[8px] h-8 w-[1px] bg-[var(--color-border-input)]"
                      aria-hidden="true"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-0 top-0 w-[50px] h-[50px] rounded-tr-[6px] rounded-br-[6px]
                      bg-transparent flex items-center justify-center focus:outline-none"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={isDeleting}
                    >
                      <div className="w-[24px] h-[24px] text-[#3B6255]">
                        {showPassword ? (
                          <AiOutlineEyeInvisible size={20} />
                        ) : (
                          <AiOutlineEye size={20} />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="flex justify-end space-x-3 p-6">
              <button
                onClick={handleCloseDeleteDialog}
                className="px-6 py-2 text-[#171717] bg-[#F1F5F9] rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletion}
                disabled={!deletePassword.trim() || isDeleting}
                className="px-6 py-2 bg-[#EB0C0C] text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Settings.propTypes = {
  user: PropTypes.shape({
    full_name: PropTypes.string,
    avatar_url: PropTypes.string,
  }),
};

const mapStateToProps = (state) => ({
  user: state.profile.profile,
});

export default connect(mapStateToProps)(Settings);