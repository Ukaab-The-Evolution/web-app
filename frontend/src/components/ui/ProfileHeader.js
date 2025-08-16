import { FiSearch } from "react-icons/fi";
import { IoMdArrowDropdown } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { IoIosNotifications } from "react-icons/io";

const ProfileHeader = ({
    title = "Profile",
    subtitle = "Your profile, your control - edit and save with ease",
    userName,
    showSearch = true,
    searchPlaceholder = "Search your query",
    onSearch,
    userAvatar,
    className = ""
    }) => {

    const navigate = useNavigate();

    const handleSearchChange = (e) => {
        if (onSearch) {
            onSearch(e.target.value);
        }
    };
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

                {/* Right Side (Search + Notifications + Avatar + Dropdown) */}
                <div className="flex items-center space-x-4">
                    {showSearch && (
                        <div className="relative w-80">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder || "Search..."}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2.5 rounded-[10px] focus:outline-none focus:ring-2 focus:border-none focus:ring-[#578C7A] bg-[#e9eded]
                                 text[(--color-text-input)] text-base "
                            />
                        </div>

                    )}

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
