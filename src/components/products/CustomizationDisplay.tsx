"use client";

import React from 'react';
import { ProductCustomization } from '@/types';
import { getAllMockStartDesigns, getAllMockEndDesigns } from '@/utils/customizationUtils';

interface CustomizationDisplayProps {
  customization: ProductCustomization;
  className?: string;
  title?: string;
}

const CustomizationDisplay: React.FC<CustomizationDisplayProps> = ({ customization, className, title = 'Customization Details' }) => {
  const mockStartDesigns = getAllMockStartDesigns();
  const mockEndDesigns = getAllMockEndDesigns();

  const hasCustomization = customization && (
    customization.texts.some(text => text.trim()) ||
    customization.font ||
    customization.startDesign ||
    customization.endDesign
  );

  if (!hasCustomization) {
    return null;
  }

  return (
    <div className={`mt-1 p-2 bg-blue-50 rounded border border-blue-200 ${className}`}>
      <p className="text-xs text-blue-700 font-medium mb-1">{title}:</p>
      {customization.texts.filter(text => text.trim()).map((text, idx) => (
        <p key={idx} className="text-xs text-blue-600">
          Text {idx + 1}: "{text}"
        </p>
      ))}
      {customization.font && (
        <p className="text-xs text-blue-600">
          Font: {customization.font}
        </p>
      )}
      {customization.startDesign && (
        <p className="text-xs text-blue-600">
          Start Design: {mockStartDesigns.find(d => d.id === customization.startDesign)?.name || customization.startDesign}
        </p>
      )}
      {customization.endDesign && (
        <p className="text-xs text-blue-600">
          End Design: {mockEndDesigns.find(d => d.id === customization.endDesign)?.name || customization.endDesign}
        </p>
      )}
    </div>
  );
};

export default CustomizationDisplay;