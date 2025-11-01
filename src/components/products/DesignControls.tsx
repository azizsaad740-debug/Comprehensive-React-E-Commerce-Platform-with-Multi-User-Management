"use client";

import React, { useMemo } from 'react';
import { Product, ProductCustomization } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text, Type, LayoutGrid } from 'lucide-react';
import { getAllMockFonts, getAllMockStartDesigns, getAllMockEndDesigns } from '@/utils/customizationUtils';

interface DesignControlsProps {
  product: Product;
  customization: ProductCustomization;
  onCustomizationChange: (customization: ProductCustomization) => void;
}

const DesignControls: React.FC<DesignControlsProps> = ({
  product,
  customization,
  onCustomizationChange,
}) => {
  const mockFonts = getAllMockFonts();
  const mockStartDesigns = getAllMockStartDesigns();
  const mockEndDesigns = getAllMockEndDesigns();

  const handleTextChange = (index: number, value: string) => {
    const newTexts = [...customization.texts];
    newTexts[index] = value;
    onCustomizationChange({
      ...customization,
      texts: newTexts,
    });
  };

  const handleFontChange = (fontId: string) => {
    const selectedFont = mockFonts.find(f => f.id === fontId);
    
    onCustomizationChange({
      ...customization,
      font: selectedFont ? selectedFont.name : '',
    });
  };

  const handleDesignChange = (type: 'startDesign' | 'endDesign', designId: string) => {
    const value = designId === 'none' ? undefined : designId;
    
    onCustomizationChange({
      ...customization,
      [type]: value,
    });
  };

  const printPaths = product.printPaths || 1;
  const textInputs = useMemo(() => Array.from({ length: printPaths }, (_, i) => i), [printPaths]);
  
  const currentFontId = useMemo(() => {
    return mockFonts.find(f => f.name === customization.font)?.id || 
           mockFonts.find(f => f.name === product.customizationOptions.fonts[0])?.id || 
           '';
  }, [customization.font, mockFonts, product.customizationOptions.fonts]);

  return (
    <div className="space-y-6">
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
                value={customization.texts[index] || ''}
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
            value={currentFontId}
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
            Design Elements
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Design */}
          <div>
            <Label htmlFor="start-design-select">Start Design</Label>
            <Select 
              value={customization.startDesign || 'none'} 
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
              value={customization.endDesign || 'none'} 
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
  );
};

export default DesignControls;