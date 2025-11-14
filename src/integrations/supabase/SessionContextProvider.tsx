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
  const { isAuthenticated, logout, setLoading } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set initial loading state to true while checking session
    setLoading(true);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setLoading(false);

      if (event === 'SIGNED_IN' && currentSession) {
        // Handle successful sign-in (AuthStore will handle user profile sync later)
        console.log('Supabase SIGNED_IN event');
      } else if (event === 'SIGNED_OUT') {
        // Clear local auth state on sign out
        logout();
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        navigate('/auth/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [setLoading, logout, navigate, toast]);

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
};