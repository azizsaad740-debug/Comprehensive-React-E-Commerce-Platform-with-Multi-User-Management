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
  const [initialSyncDone, setInitialSyncDone] = useState(false); // Local flag to ensure initial sync runs only once
  
  const { logout, setLoading, syncUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Only run initial sync logic if it hasn't been done yet
    if (!initialSyncDone) {
      setLoading(true);
      
      supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        setSession(initialSession);
        setInitialSyncDone(true); // Mark initial check as done
        
        if (initialSession?.user?.id) {
          // Sync user profile (which handles setting isLoading=false internally)
          syncUser(initialSession.user.id);
        } else {
          // No session, stop loading
          setLoading(false);
        }
      });
    }

    // 2. Handle real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);

      if (event === 'SIGNED_IN' && currentSession?.user?.id) {
        // Note: syncUser handles setting isLoading=true/false internally
        syncUser(currentSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        logout();
        navigate('/auth/login');
      } else if (event === 'INITIAL_SESSION' && !currentSession) {
        // Fallback to ensure loading is false if initial session is null
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [initialSyncDone, setLoading, logout, syncUser, navigate]);


  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
};