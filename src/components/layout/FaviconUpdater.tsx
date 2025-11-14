"use client";

import React, { useEffect, useMemo } from 'react';
import { useBrandingStore } from '@/stores/brandingStore';

// Function to generate a simple fallback favicon (16x16 data URL)
const generateFallbackFavicon = (text: string, color: string = '#ffffff', bgColor: string = '#ff6b81'): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 16, 16);

  // Text (first letter)
  ctx.fillStyle = color;
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.charAt(0).toUpperCase(), 8, 9);

  return canvas.toDataURL('image/png');
};

const FaviconUpdater: React.FC = () => {
  const { appName, faviconUrl } = useBrandingStore();

  const fallbackDataUrl = useMemo(() => {
    if (appName) {
      // Use the primary color from the theme store if available, but for simplicity here, use a hardcoded color
      return generateFallbackFavicon(appName);
    }
    return '';
  }, [appName]);

  useEffect(() => {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    if (faviconUrl) {
      // Use the configured URL
      link.href = faviconUrl;
    } else if (fallbackDataUrl) {
      // Use the generated fallback data URL
      link.href = fallbackDataUrl;
    } else {
      // Fallback to default if all else fails
      link.href = '/favicon.ico';
    }
    
    // Also update the apple touch icon if present (optional, but good practice)
    let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (appleLink) {
        appleLink.href = faviconUrl || fallbackDataUrl || '/favicon.ico';
    }

  }, [faviconUrl, fallbackDataUrl]);

  return null;
};

export default FaviconUpdater;