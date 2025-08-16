import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../actions/auth';
import { MdOutlineSupportAgent } from "react-icons/md";
import axios from "axios";
import Toast from "../ui/Toast";

const ForgotPassword = ({ forgotPassword, isAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setToast({
        type: "error",
        message: "Please enter your email address.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setToast({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setLoading(true);

    try {

      // insert backend api call here
      
      await forgotPassword({ email });

      // On success
      navigate('/otp-verification', {
        state: {
          email: email,
          isPasswordReset: true
        }
      });

      setToast({
        type: "success",
        message: "Password reset code has been sent to your email.",
      })
    } 
    catch (error) {
      console.error("Forgot password error:", error);
      setToast({
        type: "error",
        message: error.response?.data?.message || "An error occurred. Please try again later.",
      });
    } 
    finally {
      setLoading(false);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to='/dashboard' />;
  }

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
      <div className="flex justify-center items-start w-full lg:w-1/2 p-4 sm:p-6 md:p-8 px-8 lg:px-16 pb-8 pt-24 md:pt-32">
        <div className="w-full max-w-lg">

          {/* Back Arrow and Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/login')}
              className="relative w-[30px] h-[30px] mr-4 hover:opacity-70 transition-opacity duration-200"  >

              <div className="absolute w-[11.25px] h-[20px] top-[5px] left-[5px]"
                style={{
                  background: 'var(--foreground, #171717)',
                  clipPath: 'polygon(-5% 50%, 100% 0%, 100% 15%, 50% 42.5%, 50% 57.5%, 100% 100%, 80% 100%)'
                }}
              ></div>

              <div 
                className="absolute w-[20px] h-[2.5px] top-[13.75px] left-[5px]"
                style={{
                  background: 'var(--foreground, #171717)'
                }}
              ></div>
            </button>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#333333]">
              Forgot Password
            </h1>
          </div>
          
          {/* Description */}
          <p className="w-full sm:max-w-[500px] h-[48px] font-sans font-medium text-base leading-6 text-[#5F5F5F] opacity-100 mb-8 text-left sm:text-left">
            Enter your email and we'll send you an OTP code to reset your password.
          </p>
  
          {/* Email Form */}
          <form onSubmit={handleSubmit}>
                        
            {/* Email Label */}
            <label htmlFor="email" className="block  h-[21px] font-poppins font-normal text-[14px] leading-[100%] text-[#7B7F8D]">
              Email
            </label>
            
            {/* Email Input */}
            <div className="mb-6">
              <input
                type="email"
                id="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full  h-[49px] px-4 py-1 rounded-[10px] border border-[#578C7A] bg-[#B2D7CA3B]
                font-poppins font-normal text-[14px] text-[#3B6255] placeholder-[#5F5F5F] leading-[100%]
                focus:outline-none focus:ring-2 focus:ring-[#578C7A] focus:border-transparent
                transition-all duration-200 shadow-[inset_0px_2px_0px_0px_#E7EBEE33]"
              />
            </div>
            
  
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-[45px] px-[25px] rounded-full 
                       bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
                       shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] font-poppins font-semibold text-[18px] leading-[100%] 
                       text-white mt-[20px] cursor-pointer transition-all duration-300 ease-in 
                       hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center gap-3
              disabled:opacity-50 disabled:cursor-not-allowed
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Sending...' : 'Submit'}
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
          <div className="relative z-20 w-full max-w-md px-6 py-32 sm:py-28 md:py-20 text-center md:absolute md:bottom-0 md:right-0 font-poppins">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-white mb-8">
              Trouble Signing in!
            </h2>
            <p className="text-white text-sm sm:text-base font-medium font-poppins leading-relaxed">
              Don't worry! We're here to help you get back in securely.
            </p>
          </div>
        </div>
    </div>
  ); 
};

ForgotPassword.propTypes = {
  forgotPassword: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { forgotPassword })(ForgotPassword);