import { IoMdArrowDropdown } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { IoIosNotifications } from "react-icons/io";

const ProfileHeader = ({
    title = "Profile",
    subtitle = "Your profile, your control - edit and save with ease",
    userName,
    userAvatar,
    className = ""
    }) => {

    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate('/dashboard/profile');
    };

    return (
        <div className={`pt-11 py-4 px-8 text-[#3B6255] ${className}`}>
            <div className="flex justify-between items-center">
                {/* Left Side (Title + Subtitle) */}
                <div>
                    <h1 className="text-3xl font-semibold">
                        {title}
                    </h1>
                    <p className="mt-2">{subtitle}</p>
                </div>

                {/* Right Side (Notifications + Avatar + Dropdown) */}
                <div className="flex items-center space-x-4">
                    
                    {/* Notification Bell */}
                    <div className="relative cursor-pointer">
                        <IoIosNotifications className="w-6 h-6 text-gray-600" />
                        <span className="absolute top-0 right-[2px] w-[9px] h-[9px] bg-green-500 rounded-full"></span>
                    </div>

                    {/* Avatar + Dropdown */}
                    <div className="flex items-center space-x-1 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors"
                        onClick={handleProfileClick}>
                        <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden shadow-lg shadow-gray-300  hover:shadow-xl hover:shadow-gray-400 transition-shadow duration-200">
                            {userAvatar ? (
                                <img
                                    src={userAvatar}
                                    alt="User avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                    <span className="text-gray-600 text-sm font-medium">
                                        {userName ? userName.charAt(0).toUpperCase() : 'U'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <IoMdArrowDropdown className="w-5 h-5 text-gray-600" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
