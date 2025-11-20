import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchSettings, updateSettings } from '@/integrations/supabase/settings';

interface BrandingState {
  appName: string;
  slogan: string;
  logoUrl: string;
  faviconUrl: string;
  updateBranding: (data: Partial<BrandingState>) => Promise<void>;
  initialize: () => Promise<void>; // ADDED
}

const SETTINGS_KEY = 'branding';

// Default values
const DEFAULT_STATE: Omit<BrandingState, 'updateBranding' | 'initialize'> = {
  appName: 'Misali Center',
  slogan: 'Create unique, personalized products with our easy-to-use design tools.',
  logoUrl: '/placeholder.svg',
  faviconUrl: '',
};

export const useBrandingStore = create<BrandingState>()(
  (set, get) => ({
    ...DEFAULT_STATE,
    
    initialize: async () => {
      const data = await fetchSettings<typeof DEFAULT_STATE>(SETTINGS_KEY);
      if (data) {
        set(data);
      } else {
        // Fallback to local default state if fetching fails (e.g., unauthenticated read or empty table)
        set(DEFAULT_STATE);
      }
    },

    updateBranding: async (data) => {
      const newState = { ...get(), ...data };
      set(newState);
      await updateSettings(SETTINGS_KEY, newState);
    },
  })
);