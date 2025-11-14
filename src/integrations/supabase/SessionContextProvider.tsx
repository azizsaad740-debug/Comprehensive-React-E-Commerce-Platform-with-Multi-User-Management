"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './client';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast'; // Keep import for potential future use, but remove from component logic

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
  // Initialize session as undefined to indicate initial loading state
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  
  const { logout, setLoading, syncUser } = useAuthStore(state => ({
    logout: state.logout,
    setLoading: state.setLoading,
    syncUser: state.syncUser,
  }));
  const navigate = useNavigate();
  // Removed useToast hook usage here to prevent loop

  // Effect 1: Handle initial load and auth state changes from Supabase
  useEffect(() => {
    // Set initial loading state in Zustand store
    setLoading(true);
    
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      // We rely on Effect 2 (syncUser/setLoading) to finalize the loading state.
    });

    // 2. Real-time auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);

      if (event === 'SIGNED_OUT') {
        // Clear local auth state on sign out
        logout();
        // Removed toast call here
        navigate('/auth/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [setLoading, logout, navigate]); // Dependencies cleaned up

  // Effect 2: Sync user profile whenever the internal session state changes
  useEffect(() => {
    if (session === undefined) {
      return; // Still initializing
    }
    
    if (session?.user?.id) {
      // Sync user profile (which sets isLoading=true, then false upon completion)
      syncUser(session.user.id);
    } else {
      // No session/user. Ensure loading is false.
      setLoading(false);
    }
  }, [session, syncUser, setLoading]);


  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
};