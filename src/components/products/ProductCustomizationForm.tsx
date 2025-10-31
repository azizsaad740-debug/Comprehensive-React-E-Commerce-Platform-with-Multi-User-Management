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

  // Sync internal state with external changes (e.g., product change)
  useEffect(() => {
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
    const selectedFont = mockFonts.find(f => f.id === fontId);
    if (selectedFont) {
      setCustomizationState(prev => ({
        ...prev,
        font: selectedFont.name, // Storing name for display, but ID/file would be used for rendering
      }));
    }
  };

  const handleDesignChange = (type: 'startDesign' | 'endDesign', designId: string) => {
    const designs = type === 'startDesign' ? mockStartDesigns : mockEndDesigns;
    const selectedDesign = designs.find(d => d.id === designId);
    
    setCustomizationState(prev => ({
      ...prev,
      [type]: selectedDesign ? selectedDesign.id : undefined,
    }));
  };

  const printPaths = product.customizationOptions.printPaths || 1;
  const textInputs = useMemo(() => Array.from({ length: printPaths }, (_, i) => i), [printPaths]);

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
              value={customizationState.font} 
              onValueChange={handleFontChange}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Choose a font" />
              </SelectTrigger>
              <SelectContent>
                {mockFonts.map(font => (
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
                  {mockStartDesigns.map(design => (
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
                  {mockEndDesigns.map(design => (
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
                  Font: {mockFonts.find(f => f.id === customizationState.font)?.name || 'Default'}
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