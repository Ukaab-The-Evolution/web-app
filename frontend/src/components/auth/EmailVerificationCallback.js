import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const EmailVerificationCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const finishVerification = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const verified = params.get('verified') === '1';
      const { data: existingSession } = await supabase.auth.getSession();

      if (code && !existingSession.session) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (active) setError('This verification link is invalid or has expired.');
          return;
        }
      }

      if (existingSession.session || code || verified) {
        await supabase.auth.signOut();
      }
      if (active) navigate('/login?verified=1', { replace: true });
    };

    finishVerification().catch(() => {
      if (active) setError('We could not complete email verification. Please request a new link.');
    });
    return () => { active = false; };
  }, [location.search, navigate]);

  return <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-8 text-center text-gray-600">{error || 'Verifying your email…'}</div>;
};

export default EmailVerificationCallback;
