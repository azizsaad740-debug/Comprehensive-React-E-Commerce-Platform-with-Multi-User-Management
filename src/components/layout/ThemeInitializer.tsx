"use client";

import React, { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

const ThemeInitializer: React.FC = () => {
  const { primaryColorHsl } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply primary color HSL values globally
    if (primaryColorHsl) {
      root.style.setProperty('--primary', primaryColorHsl);
      root.style.setProperty('--ring', primaryColorHsl);
      root.style.setProperty('--accent', primaryColorHsl);
      root.style.setProperty('--sidebar-primary', primaryColorHsl);
      root.style.setProperty('--sidebar-ring', primaryColorHsl);
    }
  }, [primaryColorHsl]);

  return null;
};

export default ThemeInitializer;