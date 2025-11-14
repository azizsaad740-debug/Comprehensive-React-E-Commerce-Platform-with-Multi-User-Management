import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BrandingState {
  appName: string;
  slogan: string;
  logoUrl: string;
  faviconUrl: string; // NEW: URL for the favicon image
  updateBranding: (data: Partial<BrandingState>) => void;
}

export const useBrandingStore = create<BrandingState>()(
  persist(
    (set) => ({
      appName: 'Misali Center',
      slogan: 'Create unique, personalized products with our easy-to-use design tools.',
      logoUrl: '/placeholder.svg', // Placeholder for a logo
      faviconUrl: '', // Default to empty, triggering fallback logic
      
      updateBranding: (data) => {
        set((state) => ({ ...state, ...data }));
      },
    }),
    {
      name: 'branding-storage',
    }
  )
);