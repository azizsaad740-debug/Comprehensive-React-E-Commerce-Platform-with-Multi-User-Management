import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { POSBillSettings } from '@/types';
import { fetchSettings, updateSettings } from '@/integrations/supabase/settings';

interface ThemeState {
  primaryColorHex: string;
  primaryColorHsl: string; // H S L (raw values for CSS variables)
  posBillSettings: POSBillSettings;
  
  updateThemeColors: (hex: string, hsl: string) => Promise<void>;
  updatePOSBillSettings: (settings: Partial<POSBillSettings>) => Promise<void>;
  initialize: () => Promise<void>; // ADDED
}

// Default values based on current globals.css (Salmon Pink approximation: 353 100% 78%)
const DEFAULT_HEX = '#FF6B81';
const DEFAULT_HSL = '353 100% 78%';
const SETTINGS_KEY = 'theme';

const DEFAULT_POS_BILL_SETTINGS: POSBillSettings = {
  headerLogoUrl: '/placeholder.svg',
  headerTitle: 'Misali Center POS',
  headerTagline: 'Your Custom Print Partner',
  footerMessage: 'Thank you for your purchase! All sales are final.',
  showQrCode: true,
  showContactInfo: true,
  showDateTime: true,
};

const DEFAULT_STATE: Omit<ThemeState, 'updateThemeColors' | 'updatePOSBillSettings' | 'initialize'> = {
  primaryColorHex: DEFAULT_HEX,
  primaryColorHsl: DEFAULT_HSL,
  posBillSettings: DEFAULT_POS_BILL_SETTINGS,
};

export const useThemeStore = create<ThemeState>()(
  (set, get) => ({
    ...DEFAULT_STATE,
    
    initialize: async () => {
      const data = await fetchSettings<typeof DEFAULT_STATE>(SETTINGS_KEY);
      if (data) {
        set(data);
      } else {
        set(DEFAULT_STATE);
      }
    },

    updateThemeColors: async (hex, hsl) => {
      const newState = { ...get(), primaryColorHex: hex, primaryColorHsl: hsl };
      set(newState);
      await updateSettings(SETTINGS_KEY, newState);
    },
    
    updatePOSBillSettings: async (settings) => {
      const newState = { 
        ...get(), 
        posBillSettings: { ...get().posBillSettings, ...settings } 
      };
      set(newState);
      await updateSettings(SETTINGS_KEY, newState);
    },
  })
);