import { connect } from 'react-redux';
import { signInWithGoogle } from '../../actions/auth';
import { FcGoogle } from 'react-icons/fc';

const GoogleSignInButton = ({ 
  signInWithGoogle, 
  googleLoading,
  buttonText = 'Continue with Google',
  className = '',
  disabled = false
}) => {
  const handleGoogleSignIn = () => {
    if (!disabled && !googleLoading) {
      signInWithGoogle();
    }
  };

  const baseClasses = "w-full flex items-center justify-center gap-3 py-3 px-6 rounded-[40px] border border-[var(--color-border-social)] bg-[var(--color-bg-white)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-social)] text-base shadow-none font-[var(--font-poppins)] transition-colors";
  
  const disabledClasses = (googleLoading || disabled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type='button'
      onClick={handleGoogleSignIn}
      disabled={googleLoading || disabled}
      className={`${baseClasses} ${disabledClasses} ${className}`}
      aria-label={buttonText}
    >
      <FcGoogle className='text-2xl' />
      {googleLoading ? 'Signing in...' : buttonText}
    </button>
  );
};

const mapStateToProps = (state) => ({
  googleLoading: state.auth.googleLoading,
});

export default connect(mapStateToProps, { signInWithGoogle })(GoogleSignInButton);