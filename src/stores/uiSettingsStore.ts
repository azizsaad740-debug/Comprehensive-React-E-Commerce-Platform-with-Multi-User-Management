import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchSettings, updateSettings } from '@/integrations/supabase/settings';

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
  
  updateHomepageSections: (data: Partial<HomepageSectionSettings>) => Promise<void>;
  updateHeaderVisibility: (data: Partial<HeaderVisibilitySettings>) => Promise<void>;
  initialize: () => Promise<void>; // ADDED
}

const SETTINGS_KEY = 'ui_settings';

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

const DEFAULT_STATE: Omit<UISettingsState, 'updateHomepageSections' | 'updateHeaderVisibility' | 'initialize'> = {
  homepageSections: defaultHomepageSections,
  headerVisibility: defaultHeaderVisibility,
};

export const useUISettingsStore = create<UISettingsState>()(
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

    updateHomepageSections: async (data) => {
      const newState = { 
        ...get(), 
        homepageSections: { ...get().homepageSections, ...data } 
      };
      set(newState);
      await updateSettings(SETTINGS_KEY, newState);
    },
    
    updateHeaderVisibility: async (data) => {
      const newState = {
        ...get(),
        headerVisibility: { ...get().headerVisibility, ...data }
      };
      set(newState);
      await updateSettings(SETTINGS_KEY, newState);
    }
  })
);