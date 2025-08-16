import { MdOutlineSupportAgent } from "react-icons/md";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Toast from "../ui/Toast";

function OTPVerification({ email }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const isPasswordReset = location.state?.isPasswordReset || 
                            location.pathname.includes('reset') || 
                            new URLSearchParams(location.search).get('type') === 'reset';

    const handleChange = (value, index) => {
        if (/^[0-9]?$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < otp.length - 1) {
                document.getElementById(`otp-input-${index + 1}`).focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`);
            if (prevInput) {
                prevInput.focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const enteredOtp = otp.join("");

        if (enteredOtp.length !== 6) {
            setToast({
                type: "error",
                message: "Please enter the complete 6-digit code.",
            });
            return;
        }

        try {
            const apiEndpoint = isPasswordReset ? "/api/verify-reset-otp" : "/api/verify-signup-otp";

            // insert backend api call here

            const res = await axios.post(apiEndpoint, {
                email: email || location.state?.email,
                otp: enteredOtp,
            });

            if (res.data.success) {
                if (isPasswordReset) {
                    navigate("/reset-password", {
                        state: {
                            email: email || location.state?.email,
                            otpVerified: true 
                        }
                    });
                } else {
                    navigate("/login");
                }
            } else {
                setToast({
                    type: "error",
                    message: res.data.message || "Invalid OTP. Please try again.",
                });
            }
        } catch (err) {
            console.error("OTP verification error:", err);
            setToast({
                type: "error",
                message: err.response?.data?.message ||  "An error occurred. Please try again later.",
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-poppins overflow-hidden">

            {/* Toast */}
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
      
            {/* Logo */}
            <div className="absolute top-4 left-4 sm:left-28 md:left-16 flex items-center z-20">
                <img
                    src="/images/IconGreenTransparent.png"
                    alt="Ukaab Logo"
                    className="w-[70px] h-[55px] sm:w-[80px] sm:h-[63px] md:w-[85px] md:h-[67px] -mr-2"
                />
                <span className="text-xl sm:text-2xl md:text-[25px] font-radley font-normal text-[#3B6255] leading-none">
                    Ukaab
                </span>
            </div>

            {/* Left Section */}
            <div className="flex justify-center w-full lg:w-1/2 px-6 sm:px-10 md:px-16 lg:px-20 py-24 bg-white">
                <div className="w-full max-w-md">
        
                    {/* OTP Header */}
                    <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">
                        OTP Verification
                    </h1>
        
                    {/* Description */}
                    <p className="w-full sm:w-[500px] h-[48px] font-sans font-medium text-base leading-6 text-[#5F5F5F] opacity-100 mb-8 text-left sm:text-left">
                        We have sent you an email. Please check your inbox and enter the 6-digit OTP code.
                    </p>

                    {/* OTP Input Boxes */}
                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-center w-full">
                            <div className="flex justify-center w-[500px] h-[50px] gap-[7px]">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-input-${index}`}
                                        type="text"
                                        maxLength="1"
                                        placeholder="0"
                                        value={digit}
                                        onChange={(e) => handleChange(e.target.value, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        className="w-[45px] h-[50px] rounded-[5px] border border-[#578C7A] bg-[#B2D7CA3B] shadow-[inset_0px_2px_0px_0px_#E7EBEE33] px-2 py-[10px] font-[Poppins] font-normal text-[20px] leading-[100%] text-[#3B6255] text-center focus:outline-none"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full sm:max-w-[500px] h-[50px] px-[25px] py-[9px] gap-[11px] rounded-[50px]
                                bg-gradient-to-t from-[#3B6255] to-[#578C7A]
                                shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)]
                                font-poppins font-semibold text-[18px] leading-[100%]
                                text-white flex items-center justify-center mt-8
                                cursor-pointer transition-all duration-300 ease-in
                                hover:from-[#223931] hover:to-[#4A7D6D]"
                            >
                            Submit
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex w-full md:w-1/2 relative items-center justify-center overflow-hidden h-[50vh] sm:h-[60vh] md:h-screen"
                style={{
                    backgroundImage: "url('/images/bg_1.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 opacity-80"
                    style={{
                        background: "linear-gradient(360deg, #1B2D27 0%, #508171 100%)",
                        zIndex: 0,
                    }}
                ></div>
        
                {/* Support Icon */}
                <div className="absolute top-5 sm:top-8 flex items-center gap-2 z-10 cursor-pointer">
                    <MdOutlineSupportAgent className="text-[#F7FAFC] text-lg" />
                    <span className="text-[#F7FAFC] text-lg"> Support </span>
                </div>

                {/* Ellipse */}
                <div className="absolute bottom-[-450px] right-[-220px] z-10 w-[803px] h-[767px] backdrop-blur-[1px] rounded-full border border-white/30 hidden lg:block bg-gradient-to-b from-[rgba(247,250,252,0.4)] to-[rgba(237,242,247,0)]" />

                {/* Text Content */}
                <div className="absolute bottom-12 sm:bottom-8 left-0 sm:left-16 w-full px-8 sm:px-20 text-center z-10" >
                    <div className="max-w-[501px] mx-auto space-y-[18px]">
                        <h2 className="font-poppins font-extrabold text-[32px] sm:text-[40px] text-[#F7FAFC] leading-tight">
                            Welcome to Ukaab!
                        </h2>
        
                        <p className="font-poppins font-medium text-white/90 text-[16px] sm:text-[18px] leading-[1.38]">
                            Get started in seconds – connect with shippers, fleets, and drivers
                            instantly to post requests, assign loads, and track in real time
                            across one unified platform.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OTPVerification;