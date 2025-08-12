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
  return (
    <div className='min-h-screen flex flex-col md:flex-row bg-[var(--color-bg-main)] font-[var(--font-poppins)]'>
      {/* Left Side */}
      <main className='md:w-1/2 flex flex-col justify-center px-6 py-8 md:px-12 lg:px-24'>
        <header className='mb-8 flex items-center justify-center md:justify-start'>
          { <img
            src='/images/IconGreen.png'
            alt='Ukaab Logo'
            className='h-[38px] w-[88px]'
          /> }
        <p className="text-4xl sm:text-xl md:text-2xl font-bold font-radley text-[#3B6255] ml-2">
            Ukaab
          </p>
        </header>
        <section className='p-6 md:p-8'>
          <h1 className='text-[40px] text-[var(--color-text-heading)] mb-2 leading-[1] font-[var(--font-poppins)]'>
            Login
          </h1>
          <p className='mb-6 text-[var(--color-text-main)] text-base  font-[var(--font-poppins)]'>
            Don’t have an account?{' '}
            <Link
              to='/register'
              className='text-[var(--color-text-link)] hover:underline font-[var(--font-poppins)]'
            >
              Create now
            </Link>
          </p>
          <form onSubmit={onSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm text-[var(--color-text-main)] mb-1 font-[var(--font-poppins)]'
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
                className='w-full px-4 py-2 rounded-[10px] border border-[var(--color-border-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-main)] bg-[var(--color-bg-input)] text-[var(--color-text-input)] text-base  placeholder:text-[var(--color-text-placeholder)] font-[var(--font-poppins)]'
                placeholder='example@gmail.com'
                style={{ height: '49px' }}
              />
            </div>
            <div className='relative'>
              <label
                htmlFor='password'
                className='block text-sm text-[var(--color-text-main)] mb-1 font-[var(--font-poppins)]'
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
                className='w-full px-4 py-2 rounded-[10px] border border-[var(--color-border-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-main)] bg-[var(--color-bg-input)] text-[var(--color-text-input)] text-base placeholder:text-[var(--color-text-placeholder)] font-[var(--font-poppins)] pr-12'
                placeholder='********'
                style={{ height: '49px' }}
              />

              <span
                className='absolute right-10 bottom-[0.25vh]  h-11 w-px bg-[var(--color-border-input)]'
                aria-hidden='true'
              ></span>
              <button
                type='button'
                onClick={() => setShowPassword((prev) => !prev)}
                className='absolute right-3 bottom-[1.5vh] text-[var(--color-text-input)] focus:outline-none'
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={22} />
                ) : (
                  <AiOutlineEye size={22} />
                )}
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
                className='text-[var(--color-text-link)] hover:underline font-[var(--font-poppins)]'
              >
                Forgot Password?
              </Link>
            </div>
            <button
              type='submit'
              disabled={isLoading}
              className='w-full py-2 rounded-md bg-[var(--color-green-main)] text-[var(--color-text-button)] font-[var(--font-poppins)] text-lg shadow-none hover:bg-[var(--color-bg-green-dark)] transition'
              style={{ boxShadow: 'var(--shadow-btn)' }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className='flex items-center my-6' aria-label='or-divider'>
            <hr className='flex-grow border-[var(--color-border-divider)]' />
            <span className='mx-2 text-[var(--color-text-or)] text-base font-[var(--font-poppins)]'>
              OR
            </span>
            <hr className='flex-grow border-[var(--color-border-divider)]' />
          </div>
          <section className='space-y-3'>
            <button
              type='button'
              className='w-full flex items-center justify-center gap-3 py-3 px-6 rounded-[40px] border border-[var(--color-border-social)] bg-[var(--color-bg-white)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-social)] text-base shadow-none font-[var(--font-poppins)]'
              aria-label='Continue with Google'
            >
              <FcGoogle className='text-2xl' />
              Continue with Google
            </button>
            
          </section>
        </section>
      </main>
      {/* Right Side */}
      <div
              className="hidden md:flex w-1/2 relative items-center justify-center overflow-hidden h-screen"
              style={{
                backgroundImage: "url('/images/bg_1.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-green-gradient-start)] to-[var(--color-bg-green-gradient-end)] opacity-80 z-0"></div>
      
              {/* Support Icon */}
              <div className="absolute top-6 sm:top-8 flex items-center gap-2 z-10 cursor-pointer hover:underline">
                <MdOutlineSupportAgent className="text-white text-lg" />
                <span className="text-white text-lg">Support</span>
              </div>
      
              {/* Large screen: full circle */}
              <div
                className="absolute bottom-[-360px] right-[-120px] z-10 w-[750px] h-[750px]
              backdrop-blur-[1px] overflow-hidden bg-white/20 rounded-full  
              border border-white/30"
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
