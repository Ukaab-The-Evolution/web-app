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
    <div className="min-h-screen flex flex-col lg:flex-row font-poppins overflow-hidden">
      
      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Left Section */}
      <div className="flex justify-center w-full lg:w-1/2 px-6 sm:px-10 md:px-16 lg:px-20 py-24 bg-white">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="absolute top-4 left-4 sm:left-28 md:left-16 flex items-center z-20">
            <img
              src="/images/IconGreen.png"
              alt="Ukaab Logo"
              className="w-[70px] h-[55px] sm:w-[80px] sm:h-[63px] md:w-[85px] md:h-[67px] -mr-2"
            />
            <span className="text-xl sm:text-2xl md:text-[25px] font-radley font-normal text-[#3B6255] leading-none">
              Ukaab
            </span>
          </div>

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
            
            <h1 className="text-3xl md:text-4xl font-bold text-[#333333]">
              Forgot Password
            </h1>
          </div>
          
          {/* Description */}
          <p className="w-full sm:max-w-[500px] h-[48px] font-sans font-medium text-base leading-6 text-[#5F5F5F] opacity-100 mb-8 text-left sm:text-left">
            Enter your email and we'll send you a password otp to reset your password.
          </p>
  
          {/* Email Form */}
          <form onSubmit={handleSubmit}>
                        
            {/* Email Label */}
            <label htmlFor="email" className="block w-[38px] h-[21px] font-poppins font-normal text-[14px] leading-[100%] text-[#7B7F8D]">
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
                className="w-full sm:max-w-[500px] h-[49px] px-4 py-1 rounded-[10px] border border-[#578C7A] bg-[#B2D7CA3B]
                font-poppins font-normal text-[14px] text-[#3B6255] placeholder-[#5F5F5F] leading-[100%]
                focus:outline-none focus:ring-2 focus:ring-[#578C7A] focus:border-transparent
                transition-all duration-200 shadow-[inset_0px_2px_0px_0px_#E7EBEE33]"
              />
            </div>
  
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:max-w-[500px] h-[50px] px-[25px] py-[9px] gap-[11px] rounded-[50px]
              bg-gradient-to-t from-[#3B6255] to-[#578C7A] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)]
              font-poppins font-semibold text-[18px] leading-[100%] text-white
              flex items-center justify-center mt-8
              cursor-pointer transition-all duration-300 ease-in hover:from-[#223931] hover:to-[#4A7D6D]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Sending...' : 'Submit'}
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
        <div className="absolute bottom-[-490px] right-[-215px] z-10 w-[803px] h-[767px] backdrop-blur-[1px] rounded-full border border-white/30 hidden lg:block bg-gradient-to-b from-[rgba(247,250,252,0.4)] to-[rgba(237,242,247,0)]" />
  
        {/* Text Content */}
        <div className="absolute bottom-14 sm:bottom-12 left-0 sm:left-16 w-full px-8 sm:px-20 text-center z-10" >
          <div className="max-w-[501px] mx-auto space-y-[18px]">
            <h2 className="font-poppins font-extrabold text-[32px] sm:text-[40px] text-[#F7FAFC] leading-tight">
              Trouble signing in?
            </h2>
          
            <p className="font-poppins font-medium text-white/90 text-[16px] sm:text-[18px] leading-[1.38]">
              Don't worry! We're here to help you get back in securely.
            </p>
          </div>
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