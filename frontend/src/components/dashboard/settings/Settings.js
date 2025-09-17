import { useState } from 'react';
import ProfileHeader from '../../ui/ProfileHeader';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

const Settings = ({ user }) => {
  const [activeSection, setActiveSection] = useState('account');
  const navigate = useNavigate();

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
                          <button className="px-4 py-2 bg-white border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors">
                            Delete my Account
                          </button>
                        </div>
                      </div>                    
                  </div>
                
              )}
            </div>
          </div>
        </div>
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