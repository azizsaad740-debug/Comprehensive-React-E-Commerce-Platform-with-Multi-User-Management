"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ImageSizes } from '@/types';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'sizes'> {
  sizes: ImageSizes;
  alt: string;
  className?: string;
  aspectRatio?: string; // e.g., 'aspect-square', 'aspect-video'
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({ sizes, alt, className, aspectRatio = 'aspect-square', ...props }) => {
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [mediumResLoaded, setMediumResLoaded] = useState(false);

  // Start with the smallest image as the initial source
  const initialSrc = sizes.small;
  
  // Determine the current source based on loading state
  const currentSrc = useMemo(() => {
    if (highResLoaded) return sizes.large;
    if (mediumResLoaded) return sizes.medium;
    return initialSrc;
  }, [highResLoaded, mediumResLoaded, initialSrc, sizes.large, sizes.medium]);

  useEffect(() => {
    setHighResLoaded(false);
    setMediumResLoaded(false);
    
    // 1. Load Medium Resolution Image
    const mediumImg = new window.Image();
    mediumImg.onload = () => {
      setMediumResLoaded(true);
    };
    mediumImg.src = sizes.medium;

    // 2. Load High Resolution Image
    const largeImg = new window.Image();
    largeImg.onload = () => {
      setHighResLoaded(true);
    };
    largeImg.src = sizes.large;
    
    // Cleanup function
    return () => {
      mediumImg.onload = null;
      largeImg.onload = null;
    };
  }, [sizes.large, sizes.medium]);

  return (
    <div className={cn("relative overflow-hidden bg-gray-100", aspectRatio, className)}>
      {/* Low-res placeholder (always visible, blurred) */}
      <img
        src={initialSrc}
        alt={alt}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-all duration-500",
          highResLoaded ? "blur-none" : "blur-sm",
          className
        )}
        style={{ filter: highResLoaded ? 'none' : 'blur(5px)' }}
        {...props}
      />
      
      {/* Medium/High-res image overlay */}
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
          (mediumResLoaded || highResLoaded) ? "opacity-100" : "opacity-0",
          className
        )}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default ProgressiveImage;