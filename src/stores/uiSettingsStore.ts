import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HomepageSectionSettings {
  featuresSection: boolean;
  featuredProductsSection: boolean;
  categoriesPreviewSection: boolean;
  ctaSection: boolean;
}

export interface HeaderVisibilitySettings {
  showProductsLink: boolean;
  showCategoriesLink: boolean;
  showAboutLink: boolean;
  showContactLink: boolean;
  showSearchIcon: boolean;
}

interface UISettingsState {
  homepageSections: HomepageSectionSettings;
  headerVisibility: HeaderVisibilitySettings;
  
  updateHomepageSections: (data: Partial<HomepageSectionSettings>) => void;
  updateHeaderVisibility: (data: Partial<HeaderVisibilitySettings>) => void;
}

const defaultHomepageSections: HomepageSectionSettings = {
  featuresSection: true,
  featuredProductsSection: true,
  categoriesPreviewSection: true,
  ctaSection: true,
};

const defaultHeaderVisibility: HeaderVisibilitySettings = {
  showProductsLink: true,
  showCategoriesLink: true,
  showAboutLink: true,
  showContactLink: true,
  showSearchIcon: true,
};

export const useUISettingsStore = create<UISettingsState>()(
  persist(
    (set) => ({
      homepageSections: defaultHomepageSections,
      headerVisibility: defaultHeaderVisibility,

      updateHomepageSections: (data) => {
        set((state) => ({ 
          homepageSections: { ...state.homepageSections, ...data } 
        }));
      },
      
      updateHeaderVisibility: (data) => {
        set((state) => ({
          headerVisibility: { ...state.headerVisibility, ...data }
        }));
      }
    }),
    {
      name: 'ui-settings-storage',
    }
  )
);