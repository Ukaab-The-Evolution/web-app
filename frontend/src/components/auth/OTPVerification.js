import { MdOutlineSupportAgent } from "react-icons/md";
import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import Toast from "../ui/Toast";
import { verifyOTP, sendOTP } from "../../actions/auth";

const OTPVerification = ({ sendOTP, verifyOTP, isAuthenticated }) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(59);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const email = searchParams.get('email');

    // Resend OTP timer logic
    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);

    const handleResendOTP = async () => {
        if (resendTimer === 0 && email) {
            try {
                await sendOTP(email);
                setToast({
                    type: "success",
                    message: "OTP resent successfully.",
                });
                setResendTimer(59);
            } catch (err) {
                setToast({
                    type: "error",
                    message: err.response?.data?.message || "Failed to resend OTP.",
                });
            }
        }
    };

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

    if (isAuthenticated) {
        navigate('/dashboard');
    }

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-input-${index - 1}`)?.focus();
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
            await verifyOTP(enteredOtp, email);
        } catch (err) {
            setToast({
                type: "error",
                message: err.response?.data?.message || "An error occurred. Please try again later.",
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-poppins overflow-hidden bg-[#f8fafc]">

            {/* Toast */}
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Logo */}
            <div className="absolute top-0 left-1/2 pr-6 transform -translate-x-1/2 flex items-center z-20 md:top-4 md:left-16 md:transform-none">
                <img
                    src="/images/IconGreenTransparent.png"
                    alt="Ukaab Logo"
                    className="w-[85px] mr-[-9px]"
                />
                <span className="text-[25px] font-radley font-normal text-[#3B6255] leading-none">
                    Ukaab
                </span>
            </div>

            {/* Left Section */}
            <div className="flex justify-center items-start w-full lg:w-1/2 
                p-4 sm:p-6 md:p-8 px-8 lg:px-16 pb-8 pt-24 md:pt-32">
                <div className="w-full max-w-lg">

                    {/* OTP Header */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed text-[#333333] mb-6">
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

                        {/* Resend OTP Option */}
                        <div className="flex justify-end mt-4">
                            {resendTimer > 0 ? (
                                <span className="text-sm text-gray-500">
                                    Resend OTP in {resendTimer}s
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    className="text-sm text-[#578C7A] font-semibold hover:underline focus:outline-none"
                                    onClick={handleResendOTP}
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full  h-[45px] px-[25px] rounded-full 
                       bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
                       shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] font-poppins font-semibold text-[18px] leading-[100%] 
                       text-white mt-[30px] cursor-pointer transition-all duration-300 ease-in 
                       hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center gap-3"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Submit"}
                        </button>
                    </form>
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
                <div className="relative z-20 w-full max-w-md px-6 py-32 sm:py-28 md:py-20 text-center md:absolute md:-bottom-5  md:right-5 font-poppins">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-white mb-5">
                        Welcome to Ukaab!
                    </h2>
                    <p className="text-white text-base md:text-lg lg:text-lg xl:text-xl font-medium font-poppins leading-relaxed">
                        Get started in seconds – connect with shippers, fleets, and drivers instantly to post
                        requests, assign loads, and track in real time across one unified platform.
                    </p>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
});

OTPVerification.propTypes = {
    verifyOTP: PropTypes.func.isRequired,
    sendOTP: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool,
};

export default connect(mapStateToProps, { verifyOTP, sendOTP })(OTPVerification);