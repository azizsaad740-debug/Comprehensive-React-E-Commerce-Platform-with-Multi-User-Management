"use client";

import React, { useEffect, useState } from 'react';
import { useBrandingStore } from '@/stores/brandingStore';
import { useThemeStore } from '@/stores/themeStore';
import { useUISettingsStore } from '@/stores/uiSettingsStore';
import { useCheckoutSettingsStore } from '@/stores/checkoutSettingsStore';
import { Loader2 } from 'lucide-react';

interface SettingsInitializerProps {
  children: React.ReactNode;
}

const SettingsInitializer: React.FC<SettingsInitializerProps> = ({ children }) => {
  const brandingStore = useBrandingStore();
  const themeStore = useThemeStore();
  const uiStore = useUISettingsStore();
  const checkoutStore = useCheckoutSettingsStore();
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeAll = async () => {
      await Promise.all([
        brandingStore.initialize(),
        themeStore.initialize(),
        uiStore.initialize(),
        checkoutStore.initialize(),
      ]);
      setIsReady(true);
    };

    initializeAll();
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-gray-600">Loading application settings...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default SettingsInitializer;