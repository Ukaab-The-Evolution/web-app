import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, supabaseUser } = useSelector((state) => state.auth);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        if (isAuthenticated && supabaseUser) {
          // Redirect to dashboard for successful Google auth
          navigate('/dashboard');
        } else {
          // Redirect back to register if auth failed
          navigate('/register');
        }
      }
    }, 2000); // Give some time for auth state to settle

    return () => clearTimeout(timer);
  }, [isAuthenticated, loading, supabaseUser, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-green-main)] mx-auto mb-4"></div>
        <p className="text-[var(--color-text-main)] font-[var(--font-poppins)] text-lg">
          Completing sign-in...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;