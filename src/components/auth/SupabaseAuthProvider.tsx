"use client";

import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';

interface SupabaseAuthProviderProps {
  children: React.ReactNode;
}

const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const { setSession, setLoading } = useAuthStore();
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);

  useEffect(() => {
    // 1. Handle initial session load
    const getInitialSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      await setSession(session);
      setInitialLoadComplete(true);
    };

    getInitialSession();

    // 2. Set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        setSession(session);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, setLoading]);

  // Show a loading spinner while the initial session is being fetched
  if (!initialLoadComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

export default SupabaseAuthProvider;