import PropTypes from 'prop-types';
import { Link, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { login } from '../../actions/auth';
import { useState } from 'react';

import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { MdOutlineSupportAgent } from 'react-icons/md';

import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const Login = ({ login, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if logged in
  if (isAuthenticated) {
    return <Navigate to='/dashboard' />;
  }
  console.log(isAuthenticated);

  return (
    <div className="min-h-screen  flex flex-col lg:flex-row relative font-poppins bg-[#f8fafc]">
      {/* Top Left Logo */}
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

      {/* Left Side */}
      <main className="flex items-center justify-center flex-col p-4 sm:p-6  px-4 lg:px-16 pb-8 md:pt-20 w-full lg:w-1/2 min-h-screen lg:min-h-full">

        <section className='px-6 md:px-0 w-full max-w-lg'>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed text-[#333333] mb-4 mt-8">
            Login
          </h1>
          <p className='mb-10 text-[#7b7f8d]   font-poppins'>
            Don’t have an account?{' '}
            <Link
              to='/register'
              className="text-[var(--color-green-main)]  underline font-semibold font-poppins"
            >
              Create now
            </Link>
          </p>
          <form onSubmit={onSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm text-[#7B7F8D] mb-1 font-[var(--font-poppins)]'
              >
                Email
              </label>
              <input
                type='email'
                name='email'
                id='email'
                autoComplete='email'
                required
                value={email}
                onChange={onChange}
                className='w-full px-4 py-2 rounded-[10px] border border-[#578C7A] focus:outline-none focus:ring-1 focus:border-none focus:ring-[#578C7A] bg-[#B2D7CA3B] text-[var(--color-text-input)] text-base font-[var(--font-poppins)]'

                placeholder='example@gmail.com'
              />
            </div>
            <div className='relative'>
              <label
                htmlFor='password'
                className='block text-sm text-[#7B7F8D] mb-1  font-[var(--font-poppins)]'
              >
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                id='password'
                autoComplete='current-password'
                required
                value={password}
                onChange={onChange}
                className='w-full px-4 py-2 rounded-[10px] justify-center items-center border border-[#578C7A] focus:outline-none focus:ring-1 focus:border-none focus:ring-[#578C7A] bg-[#B2D7CA3B] text-[var(--color-text-input)] text-base font-[var(--font-poppins)] placeholder:relative placeholder:top-[3px]'
                placeholder='********'
              />

              <span
                className='absolute right-12 bottom-[0.70vh] h-8 w-[1px] bg-[#CFD9E0]'
                aria-hidden='true'
              ></span>

              <button
                type='button'
                onClick={() => setShowPassword((prev) => !prev)}
                className='absolute right-0 bottom-[-0.80vh] w-[50px] h-[50px] rounded-tr-[6px] rounded-br-[6px] bg-transparent flex items-center justify-center text-[var(--color-text-main)] focus:outline-none'
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <div className="w-[24px] h-[24px] text-[#3B6255]">
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
                </div>
              </button>
            </div>
            <div className='flex items-center justify-between text-sm mb-2'>
              <label className='flex items-center text-[var(--color-text-main)] font-[var(--font-poppins)]'>
                <input
                  type='checkbox'
                  className='mr-2 accent-[var(--color-green-main)]'
                />
                Remember me
              </label>
              <Link
                to='/forgot-password'
                className='text-[var(--color-green-main)]  underline font-semibold font-poppins'
              >
                Forgot Password?
              </Link>
            </div>
            <button
              type='submit'
              disabled={isLoading}
              className="w-full h-[45px] px-[25px] rounded-full 
                       bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
                       shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] font-poppins font-semibold text-[18px] leading-[100%] 
                       text-white mt-[20px] cursor-pointer transition-all duration-300 ease-in 
                       hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center gap-3"
              style={{ boxShadow: 'var(--shadow-btn)' }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className='flex items-center my-6' aria-label='or-divider'>
            <hr className='flex-grow border-[var(--color-green-main)]' />
            <span className='mx-2 text-[#737373] text-base font-poppins'>
              OR
            </span>
            <hr className='flex-grow border-[var(--color-green-main)]' />
          </div>
          <section className='space-y-3'>
            <button
              type='button'
              className='w-full flex items-center justify-center gap-3  h-[45px] px-[25px] rounded-full border border-[var(--color-border-social)] bg-[var(--color-bg-white)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-social)] text-base shadow-none font-[var(--font-poppins)]'
              aria-label='Continue with Google'
            >
              <FcGoogle className='text-2xl' />
              Continue with Google
            </button>

          </section>
        </section>
      </main>
      {/* Right Section */}
      <div
        className="hidden md:flex w-full lg:w-1/2 relative  lg:items-center justify-center flex-1
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
        <div className="relative z-20 w-full max-w-md px-6 py-32 sm:py-28 md:py-20 text-center md:absolute md:-bottom-5 md:right-5 font-poppins">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-white mb-5">
            Welcome Back!
          </h2>
          <p className="text-white text-base md:text-lg lg:text-lg xl:text-xl font-medium font-poppins leading-relaxed">
            Manage your shipments with speed and confidence - login to access real-time tracking, instant load assignmnets, and seamless logistics management.
          </p>
        </div>
      </div>

    </div>
  );
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});
Login.propTypes = {
  login: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};

export default connect(mapStateToProps, { login })(Login);
