import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { POSBillSettings } from '@/types';

interface ThemeState {
  primaryColorHex: string;
  primaryColorHsl: string; // H S L (raw values for CSS variables)
  posBillSettings: POSBillSettings;
  
  updateThemeColors: (hex: string, hsl: string) => void;
  updatePOSBillSettings: (settings: Partial<POSBillSettings>) => void;
}

// Default values based on current globals.css (Salmon Pink approximation: 353 100% 78%)
const DEFAULT_HEX = '#FF6B81';
const DEFAULT_HSL = '353 100% 78%';

const DEFAULT_POS_BILL_SETTINGS: POSBillSettings = {
  headerLogoUrl: '/placeholder.svg',
  headerTitle: 'Misali Center POS',
  headerTagline: 'Your Custom Print Partner',
  footerMessage: 'Thank you for your purchase! All sales are final.',
  showQrCode: true,
  showContactInfo: true,
  showDateTime: true,
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      primaryColorHex: DEFAULT_HEX,
      primaryColorHsl: DEFAULT_HSL,
      posBillSettings: DEFAULT_POS_BILL_SETTINGS,

      updateThemeColors: (hex, hsl) => {
        set({
          primaryColorHex: hex,
          primaryColorHsl: hsl,
        });
      },
      
      updatePOSBillSettings: (settings) => {
        set((state) => ({
          posBillSettings: { ...state.posBillSettings, ...settings },
        }));
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);