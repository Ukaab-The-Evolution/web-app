import { MdOutlineSupportAgent } from "react-icons/md";
import { FaAngleDoubleRight } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import Toast from "../ui/Toast";
import PropTypes from 'prop-types';
import { connect } from "react-redux";

const RoleSelection=({isAuthenticated})=> {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const roles = [
    { name: "Shipper", value: "shipper" },
    { name: "Trucking Company", value: "truckingCompany" },
    { name: "Truck Driver", value: "truckDriver" },
  ];

  
  const [selectedRole, setSelectedRole] = useState(roles[0]);

  const handleRoleSelection = () => {
    if (!selectedRole?.value) {
      setToast({ type: "error", message: "Please select a role before proceeding." });
      return;
    }

    navigate(`/register?role=${selectedRole.value}`);
  };

  if(isAuthenticated){
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    <div className="min-h-screen flex flex-col lg:flex-row relative font-poppins overflow-hidden">
      {/* Top Left Logo */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center z-20">
        <img
          src="/images/IconGreen.png"
          alt="Ukaab Logo"
          className="h-8 sm:h-10 md:h-16"
        />
        <span className="text-lg sm:text-xl md:text-2xl font-bold font-radley text-[#3B6255] ml-2">
          Ukaab
        </span>
      </div>

      {/* Left Section */}
      <div className="flex justify-center items-center p-4 sm:p-8 md:p-10 lg:px-20 pt-24 sm:pt-28 md:pt-32 lg:pt-36 lg:w-1/2 bg-white">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed text-gray-900 mb-6">
            Choose Your Role to Get Started
          </h1>

          <p className="text-gray-700 mb-6 sm:mb-8">
            Tell us how you want to use Ukaab so we can set up the right
            experience for you.
          </p>

          {/* Role Dropdown */}
          <div className="mb-6 w-full relative z-20">
            <label
              htmlFor="role"
              className="block text-sm text-[var(--color-text-main)] mb-1 opacity-70"
            >
              Role
            </label>

            <Menu as="div" className="relative w-full">
              <MenuButton className="w-full flex items-center justify-between rounded-[10px] bg-[var(--color-bg-input)] py-2 px-4 text-left border border-[var(--color-border-input)] text-[var(--color-text-main)] font-[var(--font-poppins)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-main)]">
                {selectedRole?.name || "Select Role"}
                <FiChevronDown className="w-4 h-4 text-[var(--color-text-main)] opacity-60" />
              </MenuButton>

              <MenuItems className="absolute left-0 mt-2 w-full rounded-[10px] bg-[var(--color-bg-input)] border border-[var(--color-border-input)] shadow-lg text-sm z-50 max-h-60 overflow-y-auto">
                {roles.map((role, index) => (
                  <MenuItem key={index} as="div">
                    {({ active }) => (
                      <button
                        onClick={() => setSelectedRole(role)}
                        className={`w-full text-left px-4 py-2 transition duration-150 ease-in-out rounded-[6px] ${
                          active
                            ? "bg-[var(--color-green-main)] text-white"
                            : "text-[var(--color-text-main)]"
                        }`}
                      >
                        {role.name}
                      </button>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>

          <button
            onClick={handleRoleSelection}
            className="w-full py-2.5 rounded-[10px] bg-[var(--color-green-main)] text-[var(--color-text-button)] text-[18px] shadow-lg hover:bg-[var(--color-bg-green-dark)] transition flex items-center justify-center gap-2"
          >
            Next
            <FaAngleDoubleRight className="text-xl" />
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div
        className="flex w-full md:w-1/2 relative items-center justify-center overflow-hidden h-[50vh] sm:h-[60vh] md:h-screen"
        style={{
          backgroundImage: "url('/images/bg_1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-green-gradient-start)] to-[var(--color-bg-green-gradient-end)] opacity-80 z-0"></div>

        {/* Support Icon */}
        <div className="absolute top-6 sm:top-8  flex items-center gap-2 z-10 cursor-pointer hover:underline">
          <MdOutlineSupportAgent className="text-white text-lg" />
          <span className="text-white text-lg">Support</span>
        </div>

        {/* Responsive Circles */}
        <div
          className="absolute bottom-[-220px] right-[-80px] z-10 w-[400px] h-[400px]
        backdrop-blur-[1px] overflow-hidden bg-white/20 rounded-full  
        border border-white/30 hidden md:block lg:hidden"
        />

        {/* Large screen: full circle */}
        <div
          className="absolute bottom-[-360px] right-[-120px] z-10 w-[750px] h-[750px]
        backdrop-blur-[1px] overflow-hidden bg-white/20 rounded-full  
        border border-white/30 hidden lg:block"
        />

        {/* Text Content */}
        <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 z-20 w-[90%] sm:w-[500px] p-4 sm:p-6 bg-transparent text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome to Ukaab!
          </h2>
          <p className="text-white text-sm sm:text-base font-bold">
            Get started in seconds - connect with shippers, fleets, and drivers
            instantly to post requests, assign loads, and track in real time
            across one unified platform.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  supabaseUser: state.auth.supabaseUser,
});

RoleSelection.propTypes = {
  isAuthenticated: PropTypes.bool,
  supabaseUser: PropTypes.object,
};
export default connect(mapStateToProps)(RoleSelection);
