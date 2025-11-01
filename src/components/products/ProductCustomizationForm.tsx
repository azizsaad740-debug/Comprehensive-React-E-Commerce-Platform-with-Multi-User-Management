"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductCustomization } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text, Type, Image, LayoutGrid } from 'lucide-react';
import { getAllMockFonts, getAllMockStartDesigns, getAllMockEndDesigns } from '@/utils/customizationUtils';

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
  const [customizationState, setCustomizationState] = useState<ProductCustomization>(initialCustomization);
  
  const mockFonts = getAllMockFonts();
  const mockStartDesigns = getAllMockStartDesigns();
  const mockEndDesigns = getAllMockEndDesigns();

  // Sync internal state with external changes (e.g., product change or design load)
  useEffect(() => {
    // When initialCustomization changes (e.g., a design is loaded), update the local state.
    setCustomizationState(initialCustomization);
  }, [initialCustomization]);

  // Debounce or immediately update parent state
  useEffect(() => {
    onCustomizationChange(customizationState);
  }, [customizationState, onCustomizationChange]);

  const handleTextChange = (index: number, value: string) => {
    const newTexts = [...customizationState.texts];
    newTexts[index] = value;
    setCustomizationState(prev => ({
      ...prev,
      texts: newTexts,
    }));
  };

  const handleFontChange = (fontId: string) => {
    // Find the font name based on the selected ID/value
    const selectedFont = mockFonts.find(f => f.id === fontId);
    
    setCustomizationState(prev => ({
      ...prev,
      font: selectedFont ? selectedFont.name : '', // Store name
    }));
  };

  const handleDesignChange = (type: 'startDesign' | 'endDesign', designId: string) => {
    // If 'none' is selected, set to undefined
    const value = designId === 'none' ? undefined : designId;
    
    setCustomizationState(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const printPaths = product.printPaths || 1;
  const textInputs = useMemo(() => Array.from({ length: printPaths }, (_, i) => i), [printPaths]);
  
  // Helper to get the currently selected font ID for the Select component
  // We need to map the font name stored in customizationState back to its ID for the Select component
  const currentFontId = useMemo(() => {
    return mockFonts.find(f => f.name === customizationState.font)?.id || 
           mockFonts.find(f => f.name === product.customizationOptions.fonts[0])?.id || 
           '';
  }, [customizationState.font, mockFonts, product.customizationOptions.fonts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Customization Controls (Left/Middle Column) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Text Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Text className="h-5 w-5 mr-2 text-blue-500" />
              Engraving Text ({printPaths} Path{printPaths > 1 ? 's' : ''})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {textInputs.map((index) => (
              <div key={index}>
                <Label htmlFor={`text-${index}`}>Text Path {index + 1}</Label>
                <Input
                  id={`text-${index}`}
                  placeholder={`Enter text for path ${index + 1}`}
                  value={customizationState.texts[index] || ''}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  className="mt-1"
                  maxLength={product.customizationOptions.maxCharacters}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Font Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Type className="h-5 w-5 mr-2 text-blue-500" />
              Font Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="font-select">Select Font</Label>
            <Select 
              value={currentFontId} // Use ID for Select value
              onValueChange={handleFontChange}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Choose a font" />
              </SelectTrigger>
              <SelectContent>
                {mockFonts
                  .filter(font => product.customizationOptions.fonts.includes(font.name))
                  .map(font => (
                    <SelectItem key={font.id} value={font.id}>
                      {font.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Design Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <LayoutGrid className="h-5 w-5 mr-2 text-blue-500" />
              Design Elements (Shapes/Borders)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Design */}
            <div>
              <Label htmlFor="start-design-select">Start Design</Label>
              <Select 
                value={customizationState.startDesign || 'none'} 
                onValueChange={(val) => handleDesignChange('startDesign', val)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="No Start Design" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {mockStartDesigns
                    .filter(design => product.customizationOptions.startDesigns?.includes(design.name))
                    .map(design => (
                      <SelectItem key={design.id} value={design.id}>
                        {design.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* End Design */}
            <div>
              <Label htmlFor="end-design-select">End Design</Label>
              <Select 
                value={customizationState.endDesign || 'none'} 
                onValueChange={(val) => handleDesignChange('endDesign', val)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="No End Design" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {mockEndDesigns
                    .filter(design => product.customizationOptions.endDesigns?.includes(design.name))
                    .map(design => (
                      <SelectItem key={design.id} value={design.id}>
                        {design.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview (Right Column) */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Image className="h-5 w-5 mr-2 text-orange-500" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center p-4 border border-dashed border-gray-400">
              <div className="text-center text-gray-600">
                <p className="font-bold mb-2">Customization Preview Area</p>
                <p className="text-sm">
                  Text: {customizationState.texts.filter(t => t.trim()).join(' | ') || 'No Text'}
                </p>
                <p className="text-sm">
                  Font: {customizationState.font || 'Default'}
                </p>
                <p className="text-sm">
                  Start Design: {mockStartDesigns.find(d => d.id === customizationState.startDesign)?.name || 'None'}
                </p>
                <p className="text-sm">
                  End Design: {mockEndDesigns.find(d => d.id === customizationState.endDesign)?.name || 'None'}
                </p>
                <p className="mt-4 text-xs text-red-500">
                  (SVG/Canvas rendering logic will be implemented here in a later step.)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductCustomizationForm;