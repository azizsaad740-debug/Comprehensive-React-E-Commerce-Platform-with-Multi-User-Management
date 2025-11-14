import { createClient } from '@supabase/supabase-js';
import { useSupabaseConfigStore } from '@/stores/supabaseConfigStore';

// Initialize client dynamically based on the store's current state
const initializeSupabaseFunctionsClient = () => {
  const { supabaseUrl, supabaseAnonKey } = useSupabaseConfigStore.getState();

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase configuration missing. Functions client cannot be initialized.");
    return { functions: { invoke: () => ({ data: null, error: new Error("Supabase not configured.") }) } } as any;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabaseFunctionsClient = initializeSupabaseFunctionsClient();