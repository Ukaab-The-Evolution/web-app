import { FaTruckFast, FaUser, FaClipboardList } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { TbCubePlus,TbLayoutDashboardFilled } from "react-icons/tb";
import { FiTruck } from "react-icons/fi";
import { BiPackage } from "react-icons/bi";
import { TbLogout2 } from "react-icons/tb";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ activeSection, setActiveSection, handleSignOut, userRole = 'shipper' }) => {
  
  // Define navigation items based on user role
  const getNavigationItems = () => {
    switch (userRole) {
      case 'truckingCompany':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <TbLayoutDashboardFilled className="w-6 h-6" /> },
          { id: 'loadRequests', label: 'Load Requests', icon: <TbCubePlus className="w-6 h-6" /> },
          { id: 'acceptedLoads', label: 'Accepted Loads', icon: <FaClipboardList className="w-6 h-6" /> },
          { id: 'fleet', label: 'Fleet Management', icon: <FiTruck className="w-6 h-6" /> },
        ];
      
      case 'truckDriver':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <TbLayoutDashboardFilled className="w-6 h-6" /> },
          { id: 'orders', label: 'My Orders', icon: <BiPackage className="w-6 h-6" /> },
        ];
      
      case 'shipper':
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <TbLayoutDashboardFilled className="w-6 h-6" /> },
          { id: 'shipments', label: 'Shipments', icon: <FaTruckFast className="w-6 h-6" /> },
          { id: 'loadRequest', label: 'Load Request', icon: <TbCubePlus className="w-6 h-6" /> },
        ];
    }
  };

  const navigate = useNavigate();

  const navigationItems = getNavigationItems();
  
  const accountItems = [
    { id: 'profile', label: 'Profile', icon: <FaUser className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <IoSettingsOutline className="w-5 h-5" /> },
  ];

  return (
    <div className="w-56 h-screen text-sm fixed bg-gradient-to-b from-[#578C7A] to-[#223931] text-white 
    rounded-r-md shadow-xl shadow-gray-700">

        <div className="flex justify-end p-3 pt-4 pb-0">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 hover:bg-white/20 rounded-full"
        >
          <IoIosArrowBack size={20} />
        </button>
      </div>

      {/* Logo Section */}
      <div className="pt-0 pb-2 px-2">
        <div className="flex items-center">
          <img src="/images/IconWhiteTransparent.png" className="w-20" alt="Ukaab Logo" />
          <span className="text-2xl font-radley -ml-2">Ukaab</span>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="">
        <div className="px-5 space-y-2">
          {navigationItems.map((item) => (
            <div
              key={item.id}
              className={`p-3 font-poppins flex items-center rounded-lg cursor-pointer transition-colors ${
                activeSection === item.id
                  ? 'bg-white text-[#3B6255]'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <div className="mr-3">
                {item.icon}
              </div>
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* Account Section */}
      <div className="absolute bottom-0 w-full p-5">
        <div className="text-sm mb-3 font-medium text-white">ACCOUNT</div>
        <div className="space-y-2 pl-2">
          {accountItems.map((item) => (
            <div
              key={item.id}
              className={`p-2 flex items-center rounded cursor-pointer transition-colors ${
                activeSection === item.id
                  ? 'bg-white  hover:bg-white text-[#3B6255]'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <div className="mr-3">
                {item.icon}
              </div>
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
          
          {/* Logout */}
          <div
            className="p-2 flex items-center hover:bg-white hover:bg-opacity-10 rounded cursor-pointer transition-colors"
            onClick={handleSignOut}
          >
            <div className="mr-3">
              <TbLogout2  className="w-5 h-5" />
            </div>
            <span className="text-sm">Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;