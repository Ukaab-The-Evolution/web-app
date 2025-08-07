import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { MdOutlineSupportAgent } from 'react-icons/md';
import { FaChevronDown } from 'react-icons/fa';

const RoleSelection = () => {
    const [role, setRole] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const roleOptions = [
      { value: 'company', label: 'Company' },
      { value: 'truck-driver', label: 'Truck Driver' },
      { value: 'shipper', label: 'Shipper' }
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleRoleSelect = (selectedRole) => {
      setRole(selectedRole);
      setIsDropdownOpen(false);
    };

    const handleGetStarted = () => {
      if (role) {
        // Navigate to register page with role as query parameter
        navigate(`/register?role=${role}`);
      }
    };
  return (
     <div className='min-h-screen flex flex-col lg:flex-row bg-[var(--color-bg-main)] font-[var(--font-poppins)] relative'>
      {/* Background Image for Medium Screens */}
      <div className='hidden md:block lg:hidden absolute inset-0 bg-[var(--color-green-main)] z-0'>
        <img
          src='/images/bg_1.svg'
          alt='Logistics Background'
          className='absolute bottom-4 right-4 w-48 h-48 object-contain opacity-20 z-1'
        />
      </div>

      {/* Left Side - Full width on mobile, half width on larger screens */}
      <main className='w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 lg:px-12 xl:px-20 min-h-screen relative z-10 md:bg-[var(--color-green-main)] lg:bg-transparent'>
        {/* Logo Section */}
        <header className='mb-12 w-full max-w-md'>
          <div className='flex items-center justify-center lg:justify-start mb-8'>
            <img
              src='/images/logo.svg'
              alt='Ukaab Logo'
              className='h-[38px] w-[88px] mr-3'
            />
            <h1 className='text-[30px] text-[var(--color-text-logo)] md:text-white lg:text-[var(--color-text-logo)] font-[var(--font-radley)]'>
              Ukaab
            </h1>
          </div>
        </header>

        {/* Content Section */}
        <section className='w-full max-w-md space-y-6'>
          {/* Main Heading */}
          <div className='space-y-4'>
            <h2 className='text-[32px] lg:text-[36px] xl:text-[40px] text-[var(--color-text-heading)] md:text-white lg:text-[var(--color-text-heading)] leading-tight font-[var(--font-poppins)]'>
              Ready to transform your logistics?
            </h2>
            <p className='text-[18px] lg:text-[20px] text-[var(--color-green-main)] md:text-white lg:text-[var(--color-green-main)] font-[var(--font-poppins)]'>
              Fast & Secure
            </p>
          </div>

          {/* Role Selection */}
          <div className='space-y-4'>
            <label className='block text-[16px] text-[var(--color-text-heading)] md:text-white lg:text-[var(--color-text-heading)] font-[var(--font-poppins)]'>
              Select your role
            </label>
            <div className='relative' ref={dropdownRef}>
              <button
                type='button'
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className='w-full flex items-center justify-between px-4 py-3 bg-white border border-[var(--color-border-input)] rounded-[10px] text-[var(--color-text-input)] text-[16px] font-[var(--font-poppins)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-main)] transition-colors'
              >
                <span className={role ? 'text-[var(--color-text-input)]' : 'text-[var(--color-text-placeholder)]'}>
                  {role ? roleOptions.find(option => option.value === role)?.label : 'Choose your role'}
                </span>
                <FaChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--color-border-input)] rounded-[10px] shadow-lg z-50'>
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      type='button'
                      onClick={() => handleRoleSelect(option.value)}
                      className='w-full px-4 py-3 text-left text-[var(--color-text-input)] hover:bg-gray-50 font-[var(--font-poppins)] first:rounded-t-[10px] last:rounded-b-[10px] transition-colors'
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className='space-y-4'>
            <p className='text-[15px] lg:text-[16px] text-[var(--color-text-main)] md:text-white/90 lg:text-[var(--color-text-main)] leading-relaxed font-[var(--font-poppins)]'>
              Welcome to Ukaab — your all-in-one logistics partner. Track,
              assign, and manage your shipments effortlessly and in real time!
            </p>
          </div>

          {/* CTA Button */}
          <div className='pt-4'>
            <button
              onClick={handleGetStarted}
              disabled={!role}
              className={`inline-flex items-center justify-center w-full px-8 py-3 rounded-[10px] text-[18px] transition-colors duration-200 shadow-lg font-[var(--font-poppins)] ${
                role 
                  ? 'bg-[var(--color-green-main)] md:bg-white lg:bg-[var(--color-green-main)] text-[var(--color-text-button)] md:text-[var(--color-green-main)] lg:text-[var(--color-text-button)] hover:bg-[var(--color-bg-green-dark)] md:hover:bg-gray-100 lg:hover:bg-[var(--color-bg-green-dark)]' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              style={role ? { boxShadow: 'var(--shadow-btn)' } : {}}
            >
              Get started
              <svg
                className='ml-2 w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 7l5 5m0 0l-5 5m5-5H6'
                />
              </svg>
            </button>
          </div>
        </section>

        {/* Support Button for Medium Screens */}
        <div className='hidden md:block lg:hidden absolute top-6 right-6 items-center gap-2 z-20'>
          <MdOutlineSupportAgent className='text-white text-lg' />
          <span className='text-white text-lg font-[var(--font-poppins)]'>
            Support
          </span>
        </div>

        {/* Text Content for Medium Screens */}
        <div className='hidden md:block lg:hidden mt-12 space-y-3 max-w-sm text-center'>
          <h3 className='text-xl text-white leading-tight font-[var(--font-poppins)]'>
            No More Long Delays
          </h3>
          <p className='text-sm text-white/90 leading-relaxed font-[var(--font-poppins)]'>
            Get your loads moving faster, smarter, and on time — every time.
          </p>
        </div>
      </main>

      {/* Right Side - Only shown on large screens */}
      <div className='hidden lg:flex lg:w-1/2 relative items-center justify-center bg-[var(--color-green-main)] min-h-screen overflow-hidden'>
        {/* Support Button */}
        <div className='absolute top-6 lg:top-8  flex items-center gap-2 z-10'>
          <MdOutlineSupportAgent className='text-white text-lg flex-center' />
          <span className='text-white text-lg font-[var(--font-poppins)]'>
            Support
          </span>
        </div>

        {/* Main Content Container */}
        <div className='flex flex-col items-center justify-center px-6 py-12 lg:px-12 text-center h-full'>
          {/* Image Container */}
          <div className='mb-6 lg:mb-8 relative'>
            <img
              src='/images/bg_2.svg'
              alt='Logistics Illustration'
              className='w-60 h-48 md:w-56 md:h-56 lg:w-72 lg:h-72 xl:w-80 xl:h-80 object-contain'
            />
          </div>

          {/* Text Content */}
          <div className='space-y-3 lg:space-y-4 max-w-sm lg:max-w-md'>
            <h3 className='text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white leading-tight font-[var(--font-poppins)]'>
              No More Long Delays
            </h3>
            <p className='text-sm md:text-base lg:text-lg text-white/90 leading-relaxed font-[var(--font-poppins)]'>
              Get your loads moving faster, smarter, and on time — every time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleSelection;