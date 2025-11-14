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
  // Initialize session as null to simplify initial state handling
  const [session, setSession] = useState<Session | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load
  
  const { logout, setLoading, syncUser } = useAuthStore(state => ({
    logout: state.logout,
    setLoading: state.setLoading,
    syncUser: state.syncUser,
  }));
  const navigate = useNavigate();

  // Effect 1: Handle initial load and auth state changes from Supabase
  useEffect(() => {
    setLoading(true);
    
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setIsInitialLoad(false);
    });

    // 2. Real-time auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);

      if (event === 'SIGNED_OUT') {
        logout();
        navigate('/auth/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [setLoading, logout, navigate]);

  // Effect 2: Sync user profile whenever the user ID changes after initial load
  const userId = session?.user?.id || null;
  
  useEffect(() => {
    if (isInitialLoad) {
      return; // Wait for Effect 1 to complete initial session check
    }
    
    if (userId) {
      // Sync user profile (which sets isLoading=true, then false upon completion)
      syncUser(userId);
    } else {
      // No user ID (signed out or no session). Ensure loading is false.
      setLoading(false);
    }
  }, [userId, isInitialLoad, syncUser, setLoading]);


  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
};