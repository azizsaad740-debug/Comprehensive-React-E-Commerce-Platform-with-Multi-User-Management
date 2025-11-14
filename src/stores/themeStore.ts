import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  primaryColorHex: string;
  primaryColorHsl: string; // H S L (raw values for CSS variables)
  
  updateThemeColors: (hex: string, hsl: string) => void;
}

// Default values based on current globals.css (Salmon Pink approximation: 353 100% 78%)
const DEFAULT_HEX = '#FF6B81';
const DEFAULT_HSL = '353 100% 78%';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      primaryColorHex: DEFAULT_HEX,
      primaryColorHsl: DEFAULT_HSL,

      updateThemeColors: (hex, hsl) => {
        set({
          primaryColorHex: hex,
          primaryColorHsl: hsl,
        });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);