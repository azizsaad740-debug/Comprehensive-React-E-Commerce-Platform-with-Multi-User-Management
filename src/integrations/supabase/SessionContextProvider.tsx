"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './client';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  // Include syncUser in the dependencies
  const { isAuthenticated, logout, setLoading, syncUser } = useAuthStore(state => ({
    isAuthenticated: state.isAuthenticated,
    logout: state.logout,
    setLoading: state.setLoading,
    syncUser: state.syncUser,
  }));
  const navigate = useNavigate();
  const { toast } = useToast();

  // Effect 1: Handle initial load and auth state changes from Supabase
  useEffect(() => {
    // Set initial loading state to true while checking session
    setLoading(true);
    
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoading(false);
    });

    // 2. Real-time auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setLoading(false);

      if (event === 'SIGNED_OUT') {
        // Clear local auth state on sign out
        logout();
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        navigate('/auth/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [setLoading, logout, navigate, toast]);

  // Effect 2: Sync user profile whenever the internal session state changes
  useEffect(() => {
    if (session?.user?.id) {
      // Only sync if we have a user ID in the session
      syncUser(session.user.id);
    }
  }, [session, syncUser]);


  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
};