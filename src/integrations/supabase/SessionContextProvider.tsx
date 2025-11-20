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
  const { isAuthenticated, logout, setLoading, syncUser } = useAuthStore(); // Destructure syncUser
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set initial loading state to true while checking session
    setLoading(true);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Initial load: sync user profile if a session exists
        syncUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      
      if (event === 'SIGNED_IN' && currentSession) {
        // Handle successful sign-in: Explicitly sync user profile
        console.log('Supabase SIGNED_IN event, syncing user profile...');
        syncUser(currentSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        // Clear local auth state on sign out
        logout();
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        navigate('/auth/login');
      } else if (event === 'INITIAL_SESSION' && !currentSession) {
        // If initial session check finds no session, stop loading
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setLoading, logout, navigate, toast, syncUser]); // Added syncUser to dependencies

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
};