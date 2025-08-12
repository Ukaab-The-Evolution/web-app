import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '../../index';
import { handleAuthStateChange, loadSupabaseSession } from '../../actions/auth';

const SupabaseAuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load initial session
    dispatch(loadSupabaseSession());

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      dispatch(handleAuthStateChange(event, session));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return children;
};

export default SupabaseAuthProvider;