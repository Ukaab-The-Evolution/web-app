import PropTypes from 'prop-types';
import { Link, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { register } from '../../actions/auth';
import { useState } from 'react';

import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { MdOutlineSupportAgent } from 'react-icons/md';

import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const Register = ({ register, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companycode: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { email, password, name, companycode, phone } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(email, password, name, companycode, phone);
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
      <main className='md:w-1/2 flex flex-col justify-center px-2 py-6 md:px-6 lg:px-12'>
        <header className='mb-6 flex items-center justify-center md:justify-start'>
          <img
            src='/images/logo.svg'
            alt='Ukaab Logo'
            className='h-[38px] w-[88px] mr-2'
          />
          <p className='text-[30px] text-[var(--color-text-logo)] font-[var(--font-radley)]'>
            Ukaab
          </p>
        </header>
        <section className='bg-[var(--color-bg-white)] rounded-lg shadow-none md:shadow-lg p-6 md:p-8 max-w-xl mx-auto'>
          <h1 className='text-[40px] text-[var(--color-text-heading)] mb-2 leading-[1] font-[var(--font-poppins)]'>
            Sign Up
          </h1>
          <p className='mb-2 text-[var(--color-text-main)] text-base font-[var(--font-poppins)]'>
            Already have an account?{' '}
            <Link
              to='/login'
              className='text-[var(--color-text-link)] hover:underline font-[var(--font-poppins)]'
            >
              Login
            </Link>
          </p>
          <form onSubmit={onSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm text-[var(--color-text-main)] mb-1 font-[var(--font-poppins)]'
                >
                  Full Name
                </label>
                <input
                  type='text'
                  name='name'
                  id='name'
                  autoComplete='name'
                  required
                  value={name}
                  onChange={onChange}
                  className='w-full px-4 py-2 rounded-[10px] border border-[var(--color-border-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-main)] bg-[var(--color-bg-input)] text-[var(--color-text-input)] text-base placeholder:text-[var(--color-text-placeholder)] font-[var(--font-poppins)]'
                  placeholder='Full Name'
                />
              </div>
              <div>
                <label
                  htmlFor='companycode'
                  className='block text-sm text-[var(--color-text-main)] mb-1 font-[var(--font-poppins)]'
                >
                  Company Code
                </label>
                <input
                  type='text'
                  name='companycode'
                  id='companycode'
                  autoComplete='companycode'
                  required
                  value={companycode}
                  onChange={onChange}
                  className='w-full px-4 py-2 rounded-[10px] border border-[var(--color-border-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-main)] bg-[var(--color-bg-input)] text-[var(--color-text-input)] text-base placeholder:text-[var(--color-text-placeholder)] font-[var(--font-poppins)]'
                  placeholder='Company Code'
                />
              </div>
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
                  className='w-full px-4 py-2 rounded-[10px] border border-[var(--color-border-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-main)] bg-[var(--color-bg-input)] text-[var(--color-text-input)] text-base placeholder:text-[var(--color-text-placeholder)] font-[var(--font-poppins)]'
                  placeholder='example@gmail.com'
                />
              </div>
              <div>
                <label
                  htmlFor='phone'
                  className='block text-sm text-[var(--color-text-main)] mb-1 font-[var(--font-poppins)]'
                >
                  Phone
                </label>
                <input
                  type='text'
                  name='phone'
                  id='phone'
                  autoComplete='tel'
                  required
                  value={phone}
                  onChange={onChange}
                  className='w-full px-4 py-2 rounded-[10px] border border-[var(--color-border-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-main)] bg-[var(--color-bg-input)] text-[var(--color-text-input)] text-base placeholder:text-[var(--color-text-placeholder)] font-[var(--font-poppins)]'
                  placeholder='Phone'
                />
              </div>
            </div>
            <div className='relative mt-2'>
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
              />
              <span
                className='absolute right-3 top-1/2 -translate-y-1/2 h-6 w-px bg-[var(--color-border-input)]'
                aria-hidden='true'
              ></span>
              <button
                type='button'
                onClick={() => setShowPassword((prev) => !prev)}
                className='absolute right-1 top-1/2 -translate-y-1/2 text-[var(--color-text-input)] focus:outline-none'
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
            {/* Password requirements */}
            <ul className='mt-2 mb-4 text-[14px] text-[var(--color-text-main)] font-[var(--font-poppins)] space-y-1'>
              <li className='flex items-center gap-2'>
                <span className='text-green-600'>&#10003;</span> Contains at
                least one capital character
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-green-600'>&#10003;</span> At least 8
                characters
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-green-600'>&#10003;</span> Contains a
                number or symbol
              </li>
            </ul>
            <button
              type='submit'
              disabled={isLoading}
              className='w-full py-2.5 rounded-[10px] bg-[var(--color-green-main)] text-[var(--color-text-button)] font-[var(--font-poppins)] text-[18px] shadow-lg hover:bg-[var(--color-bg-green-dark)] transition'
            >
              Sign Up
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
            <button
              type='button'
              className='w-full flex items-center justify-center gap-3 py-3 px-6 rounded-[40px] border border-[var(--color-border-social)] bg-[var(--color-bg-white)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-social)] text-base shadow-none font-[var(--font-poppins)]'
              aria-label='Continue with Facebook'
            >
              <FaFacebook className='text-2xl text-[var(--color-text-facebook)]' />
              Continue with Facebook
            </button>
          </section>
        </section>
      </main>
      {/* Right Side */}
      <div
        className='hidden md:flex md:w-1/2 relative items-center justify-center bg-green-900'
        style={{
          backgroundImage: "url('/images/bg_1.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='absolute inset-0 bg-green-900 opacity-80 z-1'></div>
        <div className='absolute top-8 flex items-center gap-2 z-2'>
          <MdOutlineSupportAgent className='text-white text-lg' />
          <span className='text-white text-lg'>Support</span>
        </div>

        {/* Content inside ellipse */}
        <div className='absolute flex flex-col items-center justify-center h-full '>
          <h2 className='text-4xl text-white mb-4 text-center font-[var(--font-poppins)]'>
            Welcome to Ukaab!
          </h2>
          <p className='text-white text-lg text-center max-w-md font-[var(--font-poppins)]'>
            Get started in seconds — connect with shippers, fleets, and drivers
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
Register.propTypes = {
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};

export default connect(mapStateToProps, { register })(Register);
