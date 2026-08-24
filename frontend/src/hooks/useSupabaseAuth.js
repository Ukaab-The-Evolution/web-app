import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { signInWithGoogle, signOutUser } from '../actions/auth';
import { supabase } from '../lib/supabase';

export const useSupabaseAuth = () => {
  const dispatch = useDispatch();
  const { user, supabaseUser, googleLoading, isAuthenticated } = useSelector((state) => state.auth);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInGoogle = () => dispatch(signInWithGoogle());
  const signOut = () => dispatch(signOutUser());

  return {
    user: user || supabaseUser,
    session,
    loading: googleLoading,
    isAuthenticated,
    signInGoogle,
    signOut,
  };
};
