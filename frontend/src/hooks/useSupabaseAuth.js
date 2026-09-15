import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { signOutUser } from '../actions/auth';
import { supabase } from '../lib/supabase';

export const useSupabaseAuth = () => {
  const dispatch = useDispatch();
  const { user, supabaseUser, isAuthenticated } = useSelector((state) => state.auth);
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

  const signOut = () => dispatch(signOutUser());

  return {
    user: user || supabaseUser,
    session,
    isAuthenticated,
    signOut,
  };
};
