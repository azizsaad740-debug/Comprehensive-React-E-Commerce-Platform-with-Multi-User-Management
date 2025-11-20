import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SupabaseConfigState {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConfigured: boolean;
  
  updateConfig: (url: string, anonKey: string) => void;
}

// Use the provided project details as the default configuration
const DEFAULT_URL = 'https://bzjznezrzxuadnxbkfdj.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6anpuZXpyenh1YWRueGJrZmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NTEwMjEsImV4cCI6MjA3OTIyNzAyMX0.81aWPSLo9yoj8H2h1XlEivJ0inbBC2UIOGXzyJ593p0';

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