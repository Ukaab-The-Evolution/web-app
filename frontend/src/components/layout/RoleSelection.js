import { MdOutlineSupportAgent } from "react-icons/md";
import { FaAngleDoubleRight } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Toast from "../ui/Toast";

function RoleSelection() {
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
        {/* Top Left Logo */}
        <div className="
  absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center z-20
  md:top-4 md:left-16 md:transform-none
">
          <img
            src="/images/IconGreen.png"
            alt="Ukaab Logo"
            className="w-[85px] h-[67px] mr-[-9px]"
          />
          <span className="text-[25px] font-radley font-normal text-[#3B6255] leading-none">
            Ukaab
          </span>
        </div>


        {/* Left Section */}
        <div className="flex justify-center items-center p-8 sm:p-8 md:p-10 lg:px-20 pt-28 sm:pt-36 md:pt-40 lg:pt-36 lg:w-1/2 bg-white">
          <div className="w-full max-w-lg">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed text-[#333333] mb-6">
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
                <MenuButton
                  className="w-full flex items-center justify-between rounded-[10px] bg-[var(--color-bg-input)] py-2 px-4 text-left text-[var(--color-text-main)] font-[var(--font-poppins)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-main)]"
                  style={{
                    border: "1.3px solid #578C7A",
                  }}
                >
                  {selectedRole?.name || "Select Role"}
                  <FiChevronDown className="w-4 h-4 text-[var(--color-text-main)] opacity-60" />
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
              type="submit" className="w-full h-[45px] px-[25px] rounded-[12px] 
             bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
             shadow-lg font-poppins font-semibold text-[18px] leading-[100%] 
             text-white mt-[20px] cursor-pointer transition-all duration-300 ease-in 
             hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center gap-3 ">
              Next
              <FaAngleDoubleRight className="text-xl" />
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div
          className="flex w-full lg:w-1/2 relative items-center justify-center overflow-hidden 
              flex-1 md:h-[50vh] lg:h-screen
"
          style={{
            backgroundImage: "url('/images/bg_1.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-green-gradient-start)] to-[var(--color-bg-green-gradient-end)] opacity-80 z-0"></div>

          {/* Support Icon */}
          <div className="absolute top-6 sm:top-8 flex items-center gap-2 z-10 cursor-pointer hover:underline hover:decoration-white">
            <MdOutlineSupportAgent className="text-white text-lg" />
            <span className="text-white text-lg">Support</span>
          </div>

          {/* Circle for md */}
          <div
            className="absolute bottom-[-260px] right-[-40px] z-10 w-[650px] h-[650px]
               backdrop-blur-[1px] overflow-hidden bg-white/20 rounded-full  
                hidden md:block lg:hidden "
          />

          {/* Large screen circle */}
          <div
            className="absolute bottom-[-360px] right-[-120px] z-10 w-[750px] h-[750px]
               backdrop-blur-[1px] overflow-hidden bg-white/20 rounded-full  
                hidden lg:block"
          />

          {/* Text Content */}
          <div className="absolute bottom-10 sm:bottom-16 md:bottom-12 lg:bottom-20 right-4 sm:right-10 z-20 w-[90%] sm:w-[500px] p-4 sm:p-6 bg-transparent text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome to Ukaab!
            </h2>
            <br />
            <p className="text-white text-sm sm:text-base font-bold">
              Get started in seconds - connect with shippers, fleets, and drivers instantly to post
              requests, assign loads, and track in real time across one unified platform.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}

export default RoleSelection;
