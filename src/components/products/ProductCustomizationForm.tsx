"use client";

import React, { useState, useEffect } from 'react';
import { Product, ProductCustomization } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Type } from 'lucide-react';

interface ProductCustomizationFormProps {
  product: Product;
  initialCustomization: ProductCustomization;
  onCustomizationChange: (customization: ProductCustomization) => void;
}

const ProductCustomizationForm: React.FC<ProductCustomizationFormProps> = ({
  product,
  initialCustomization,
  onCustomizationChange,
}) => {
  const { customizationOptions } = product;

  const [customization, setCustomization] = useState<ProductCustomization>(initialCustomization);

  // Sync internal state changes back to the parent component
  useEffect(() => {
    onCustomizationChange(customization);
  }, [customization, onCustomizationChange]);

  const handleTextChange = (index: number, value: string) => {
    const maxChars = customizationOptions.maxCharacters || 50;
    const newTexts = [...customization.texts];
    newTexts[index] = value.substring(0, maxChars);
    setCustomization(prev => ({ ...prev, texts: newTexts }));
  };

  const addTextField = () => {
    if (customization.texts.length < 3) { // Limiting to 3 lines for simplicity
      setCustomization(prev => ({ ...prev, texts: [...prev.texts, ''] }));
    }
  };

  const removeTextField = (index: number) => {
    if (customization.texts.length > 1) {
      const newTexts = customization.texts.filter((_, i) => i !== index);
      setCustomization(prev => ({ ...prev, texts: newTexts }));
    }
  };

  const handleFontChange = (font: string) => {
    setCustomization(prev => ({ ...prev, font }));
  };

  const handleStartDesignChange = (design: string) => {
    setCustomization(prev => ({ ...prev, startDesign: design }));
  };

  const handleEndDesignChange = (design: string) => {
    setCustomization(prev => ({ ...prev, endDesign: design }));
  };

  return (
    <div className="space-y-6">
      {/* Text Inputs */}
      <div>
        <Label className="text-base font-medium">Custom Text</Label>
        <p className="text-sm text-gray-600 mb-3">
          Maximum {customizationOptions.maxCharacters || 50} characters per line
        </p>
        <div className="space-y-3">
          {customization.texts.map((text, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder={`Line ${index + 1} text...`}
                value={text}
                onChange={(e) => handleTextChange(index, e.target.value)}
                maxLength={customizationOptions.maxCharacters}
              />
              {customization.texts.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTextField(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          {customization.texts.length < 3 && (
            <Button variant="outline" onClick={addTextField}>
              Add Another Line
            </Button>
          )}
        </div>
      </div>

      {/* Font Selection */}
      {customizationOptions.fonts.length > 0 && (
        <div>
          <Label className="text-base font-medium">Font Style</Label>
          <Select 
            value={customization.font} 
            onValueChange={handleFontChange}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {customizationOptions.fonts.map(font => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Design Selection */}
      {(customizationOptions.startDesigns?.length || 0 > 0 || customizationOptions.endDesigns?.length || 0 > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {customizationOptions.startDesigns && customizationOptions.startDesigns.length > 0 && (
            <div>
              <Label className="text-base font-medium">Start Design</Label>
              <Select 
                value={customization.startDesign} 
                onValueChange={handleStartDesignChange}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customizationOptions.startDesigns.map(design => (
                    <SelectItem key={design} value={design}>
                      {design}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {customizationOptions.endDesigns && customizationOptions.endDesigns.length > 0 && (
            <div>
              <Label className="text-base font-medium">End Design</Label>
              <Select 
                value={customization.endDesign} 
                onValueChange={handleEndDesignChange}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customizationOptions.endDesigns.map(design => (
                    <SelectItem key={design} value={design}>
                      {design}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Preview Area */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <h4 className="font-medium mb-3">Live Preview</h4>
        <div className="bg-white p-4 rounded border text-center min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            {customization.texts.filter(text => text.trim()).map((text, index) => (
              <div key={index} style={{ fontFamily: customization.font }} className="mb-2 text-lg font-semibold">
                {text || 'Your text here'}
              </div>
            ))}
            {/* Display selected designs (placeholder text for now) */}
            {(customization.startDesign || customization.endDesign) && (
                <p className="text-xs text-gray-400 mt-2">
                    {customization.startDesign && `[Start Design: ${customization.startDesign}] `}
                    {customization.endDesign && `[End Design: ${customization.endDesign}]`}
                </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCustomizationForm;