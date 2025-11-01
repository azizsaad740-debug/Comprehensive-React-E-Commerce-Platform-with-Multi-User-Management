"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductCustomization } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text, Type, Image, LayoutGrid } from 'lucide-react';
import { getAllMockFonts, getAllMockStartDesigns, getAllMockEndDesigns } from '@/utils/customizationUtils';
import { cn } from '@/lib/utils';

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
  
  const isCustomizing = customizationState.texts.some(t => t.trim()) || customizationState.startDesign || customizationState.endDesign;

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
            <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
              {/* Product Image Background */}
              <img 
                src={product.images[0] || '/placeholder.svg'} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Customization Overlays */}
              <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
                {customizationState.texts.map((text, index) => {
                  if (text.trim() === '') return null;
                  
                  // Simple mock positioning based on index
                  const positionClasses = index === 0 
                    ? 'top-1/4 left-1/2 -translate-x-1/2' 
                    : index === 1 
                    ? 'bottom-1/4 left-1/2 -translate-x-1/2' 
                    : 'top-1/2 left-1/2 -translate-x-1/2';
                    
                  // Apply mock font style (since we don't have real font files)
                  const fontStyle = customizationState.font || 'Arial';
                  
                  return (
                    <div 
                      key={index} 
                      className={cn(
                        "absolute p-1 bg-white/70 backdrop-blur-sm rounded shadow-lg text-center transition-all duration-300",
                        positionClasses
                      )}
                      style={{ fontFamily: fontStyle, fontSize: '1.2rem', fontWeight: 'bold', color: 'black' }}
                    >
                      {text}
                    </div>
                  );
                })}
                
                {/* Design Overlays (Simplified) */}
                {customizationState.startDesign && (
                  <div className="absolute top-4 left-4 p-1 bg-white/70 rounded text-xs text-blue-700 font-medium">
                    Start Design
                  </div>
                )}
                {customizationState.endDesign && (
                  <div className="absolute bottom-4 right-4 p-1 bg-white/70 rounded text-xs text-blue-700 font-medium">
                    End Design
                  </div>
                )}
                
                {/* Fallback if no customization */}
                {!isCustomizing && (
                  <div className="text-center text-gray-600 p-4 bg-white/80 rounded">
                    <p className="font-bold mb-2">Start Customizing</p>
                    <p className="text-sm">Your design will appear here.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Customization Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-semibold mb-2">Current Customization Summary:</h4>
              <p className="text-sm text-gray-600">Font: <span className="font-medium">{customizationState.font || 'Default'}</span></p>
              {customizationState.texts.map((text, index) => (
                <p key={index} className="text-sm text-gray-600 truncate">
                  Text {index + 1}: <span className="font-medium">{text || 'Empty'}</span>
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductCustomizationForm;