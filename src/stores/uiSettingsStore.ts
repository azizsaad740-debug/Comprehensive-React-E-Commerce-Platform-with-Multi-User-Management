import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HomepageSectionSettings {
  featuresSection: boolean;
  featuredProductsSection: boolean;
  categoriesPreviewSection: boolean;
  ctaSection: boolean;
}

interface UISettingsState {
  homepageSections: HomepageSectionSettings;
  
  updateHomepageSections: (data: Partial<HomepageSectionSettings>) => void;
}

const defaultHomepageSections: HomepageSectionSettings = {
  featuresSection: true,
  featuredProductsSection: true,
  categoriesPreviewSection: true,
  ctaSection: true,
};

export const useUISettingsStore = create<UISettingsState>()(
  persist(
    (set) => ({
      homepageSections: defaultHomepageSections,

      updateHomepageSections: (data) => {
        set((state) => ({ 
          homepageSections: { ...state.homepageSections, ...data } 
        }));
      },
    }),
    {
      name: 'ui-settings-storage',
    }
  )
);