import { MdOutlineSupportAgent } from "react-icons/md";
import { FaAngleDoubleRight } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import Toast from "../ui/Toast";
import PropTypes from 'prop-types';
import { connect } from "react-redux";

const RoleSelection = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const roles = [
    { name: "Shipper", value: "shipper" },
    { name: "Trucking Company", value: "truckingCompany" },
    { name: "Truck Driver", value: "truckDriver" },
  ];


  const [selectedRole, setSelectedRole] = useState({ name: "", value: "" });


  const handleRoleSelection = () => {
    if (!selectedRole?.value) {
      setToast({
        type: "error",
        message: "Please select a role before proceeding.",
      });
      return;
    }
    navigate(`/register?role=${selectedRole.value}`);
  };

  if (isAuthenticated) {
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
      <div className="min-h-screen flex flex-col lg:flex-row relative font-poppins ">
        {/* Logo */}
        <div className="absolute top-0 left-1/2 pr-6 transform -translate-x-1/2 flex items-center z-40 md:top-4 md:left-16 md:transform-none">
          <img
            src="/images/IconGreen.png"
            alt="Ukaab Logo"
            className="w-[85px] mr-[-9px]"
          />
          <span className="text-[25px] font-radley font-normal text-[#3B6255] leading-none">
            Ukaab
          </span>
        </div>



        {/* Left Section */}
        <div className="flex justify-center z-30 items-center p-8 sm:p-8 md:p-10 lg:px-20 pt-28 sm:pt-36 md:pt-40 lg:pt-36 lg:w-1/2 bg-white">
          <div className="w-full max-w-lg ">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed text-[#333333] mb-6">
              Choose Your Role to Get Started
            </h1>

            <p className="text-[#333333] text-base mb-6 sm:mb-8">
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
                <MenuButton
                  className="w-full flex items-center justify-between rounded-[10px] bg-[var(--color-bg-input)] py-2 px-4 text-left text-[var(--color-text-main)] font-[var(--font-poppins)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-main)]"
                  style={{
                    border: "1.5px solid #578C7A",
                  }}
                >
                  {selectedRole?.name || "Select Role"}
                  <FiChevronDown className="w-4 h-4 text-[#3B6255]" />
                </MenuButton>

                <MenuItems className="absolute left-0 mt-2 w-full rounded-[10px] bg-[var(--color-bg-input)] border border-[var(--color-border-input)] shadow-lg text-sm z-50 max-h-60 overflow-y-auto">
                  {roles.map((role, index) => (
                    <MenuItem key={index} as="div">
                      {({ active }) => (
                        <button
                          onClick={() => setSelectedRole(role)}
                          className={`w-full text-left px-4 py-2 transition duration-150 ease-in-out rounded-[6px] ${active
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
              type="submit" className="w-full h-[45px] px-[25px] rounded-full 
             bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
             shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] font-poppins font-semibold text-[18px] leading-[100%] 
             text-white mt-[20px] cursor-pointer transition-all duration-300 ease-in 
             hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center gap-3 ">
              Next
              <FaAngleDoubleRight className="text-sm" />
            </button>
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
          <div className="relative z-20 w-full max-w-md px-6 py-32 sm:py-28 md:py-20 text-center md:absolute md:bottom-0 md:right-0 font-poppins">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-white mb-8">
              Welcome to Ukaab!
            </h2>
            <p className="text-white text-sm sm:text-base font-medium font-poppins leading-relaxed">
              Get started in seconds – connect with shippers, fleets, and drivers instantly to post
              requests, assign loads, and track in real time across one unified platform.
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
