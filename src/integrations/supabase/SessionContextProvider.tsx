"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './client';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

interface SessionContextType {
  session: Session | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionContextProvider');
  }
  return context;
};

interface SessionContextProviderProps {
  children: ReactNode;
}

export const SessionContextProvider: React.FC<SessionContextProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const { logout, setLoading, syncUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    
    // 1. Handle initial session load
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user?.id) {
        syncUser(initialSession.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Handle real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);

      if (event === 'SIGNED_IN' && currentSession?.user?.id) {
        // When signed in, sync the user profile
        syncUser(currentSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        // When signed out, clear local state and navigate
        logout();
        navigate('/auth/login');
      } else if (event === 'INITIAL_SESSION' && !currentSession) {
        // If initial session is null (not logged in), ensure loading is false
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setLoading, logout, syncUser, navigate]);


  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
};