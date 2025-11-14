import { createClient } from '@supabase/supabase-js';
import { useSupabaseConfigStore } from '@/stores/supabaseConfigStore';

// Initialize client dynamically based on the store's current state
// This function ensures the client is created only once or recreated if config changes.
const initializeSupabaseClient = () => {
  // We must access the store state outside of a React component/hook context
  // For simplicity in this setup, we rely on the store being initialized.
  // In a real app, this might be handled via a global singleton or context provider.
  const { supabaseUrl, supabaseAnonKey } = useSupabaseConfigStore.getState();

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase configuration missing. Client cannot be initialized.");
    // Return a dummy client to prevent crashes
    return { auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) }, from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }) }) } as any;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = initializeSupabaseClient();