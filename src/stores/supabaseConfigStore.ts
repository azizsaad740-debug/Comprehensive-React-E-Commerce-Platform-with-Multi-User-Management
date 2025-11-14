import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SupabaseConfigState {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConfigured: boolean;
  
  updateConfig: (url: string, anonKey: string) => void;
}

// Use the provided project details as the default configuration
const DEFAULT_URL = 'https://wnlveqfnbaempwvymfak.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubHZlcWZuYmFlbXB3dnltZmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5ODk0NzIsImV4cCI6MjA3NzU2NTQ3Mn0.yb9fairNg0lurOIZpkUFY4OMD_ddTGNMEgizCGS8ZVg';

export const useSupabaseConfigStore = create<SupabaseConfigState>()(
  persist(
    (set) => ({
      supabaseUrl: DEFAULT_URL,
      supabaseAnonKey: DEFAULT_ANON_KEY,
      isConfigured: true, // Assume configured by default using project context
      
      updateConfig: (url, anonKey) => {
        set({
          supabaseUrl: url,
          supabaseAnonKey: anonKey,
          isConfigured: !!(url && anonKey),
        });
      },
    }),
    {
      name: 'supabase-config-storage',
    }
  )
);