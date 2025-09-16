import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { MdOutlineEmail, MdOutlineRefresh } from 'react-icons/md';
import { FaCheckCircle } from 'react-icons/fa';
import PropTypes from 'prop-types';

const SignupConfirmation = ({ isAuthenticated, supabaseUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const emailParam = urlParams.get('email');
    const roleParam = urlParams.get('role');
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    if (roleParam) {
      setRole(roleParam);
    }

    // If no email in URL, redirect to role selection
    if (!emailParam) {
      navigate('/role-selection');
    }
  }, [location.search, navigate]);

  // Auto-redirect when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated || supabaseUser) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, supabaseUser, navigate]);

  const handleResendConfirmation = async () => {
    setIsChecking(true);
    // Here you would typically call your API to resend confirmation email
    try {
      // await resendConfirmationEmail(email);
      console.log('Resending confirmation email to:', email);
      
      // Show success feedback
      setTimeout(() => {
        setIsChecking(false);
      }, 2000);
    } catch (error) {
      console.error('Error resending confirmation email:', error);
      setIsChecking(false);
    }
  };

  const handleCheckStatus = () => {
    window.location.reload();
  };

  const getRoleDisplayName = (roleValue) => {
    switch (roleValue) {
      case 'shipper':
        return 'Shipper';
      case 'truckingCompany':
        return 'Trucking Company';
      case 'truckDriver':
        return 'Truck Driver';
      default:
        return 'User';
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative font-poppins bg-gray-50">
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

      {/* Main Content */}
      <div className="flex justify-center items-center p-8 sm:p-8 md:p-10 lg:px-20 pt-28 sm:pt-36 md:pt-40 lg:pt-36 lg:w-full bg-white min-h-screen">
        <div className="w-full max-w-md text-center">
          
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <MdOutlineEmail className="w-10 h-10 text-[#3B6255]" />
            </div>
          </div>

          {/* Header */}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#333333] mb-4">
            Check Your Email
          </h1>

          {/* Description */}
          <p className="text-[#666666] text-base mb-2">
            We've sent a confirmation link to:
          </p>
          
          <p className="text-[#3B6255] font-semibold text-lg mb-6">
            {email}
          </p>

          <p className="text-[#666666] text-sm mb-8">
            Click the link in your email to activate your {getRoleDisplayName(role)} account and get started with Ukaab.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleResendConfirmation}
              disabled={isChecking}
              className="w-full h-[45px] px-[25px] rounded-full 
              border-2 border-[#3B6255] bg-transparent
              font-poppins font-semibold text-[16px] 
              text-[#3B6255] cursor-pointer transition-all duration-300 ease-in 
              hover:bg-gradient-to-t from-[#3B6255] to-[#578C7A] hover:text-white hover:border-none
              flex items-center justify-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdOutlineEmail className="text-lg" />
              {isChecking ? 'Sending...' : 'Resend Email'}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-[#888888] text-sm">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </div>

          {/* Back to Login */}
          <div className="mt-6">
            <button
              onClick={() => navigate('/role-selection')}
              className="text-[#3B6255] text-sm hover:underline"
            >
              ← Back to Role Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

SignupConfirmation.propTypes = {
  isAuthenticated: PropTypes.bool,
  supabaseUser: PropTypes.object,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  supabaseUser: state.auth.supabaseUser,
});

export default connect(mapStateToProps)(SignupConfirmation);