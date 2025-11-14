"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, ProductCustomization, SavedDesignTemplate, ImageSizes } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, ShoppingCart, Save, ArrowLeft, Loader2 } from 'lucide-react';
import DesignControls from './DesignControls';
import SaveDesignButton from './SaveDesignButton';
import DesignLoaderDialog from './DesignLoaderDialog';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DesignEditorProps {
  product: Product;
  initialCustomization: ProductCustomization;
  existingDesign?: SavedDesignTemplate;
  onBack: () => void;
  onDesignSaved: (design: SavedDesignTemplate) => void;
  onDesignLoaded: (design: SavedDesignTemplate) => void;
}

// Helper function to determine if customization is meaningful
const isCustomizationMeaningful = (customization: ProductCustomization, initialCustomization: ProductCustomization): boolean => {
  const hasText = customization.texts.some(text => text.trim().length > 0);
  const hasFontChange = customization.font !== initialCustomization.font;
  const hasStartDesign = customization.startDesign && customization.startDesign !== initialCustomization.startDesign;
  const hasEndDesign = customization.endDesign && customization.endDesign !== initialCustomization.endDesign;
  
  return hasText || hasFontChange || hasStartDesign || hasEndDesign;
};

const DesignEditor: React.FC<DesignEditorProps> = ({
  product,
  initialCustomization,
  existingDesign: initialExistingDesign,
  onBack,
  onDesignSaved,
  onDesignLoaded,
}) => {
  const { addItem } = useCartStore();
  const { toast } = useToast();
  
  const [customization, setCustomization] = useState<ProductCustomization>(initialCustomization);
  const [existingDesign, setExistingDesign] = useState<SavedDesignTemplate | undefined>(initialExistingDesign);
  
  // Sync state when props change (e.g., when a design is loaded via dialog)
  useEffect(() => {
    setCustomization(initialCustomization);
    setExistingDesign(initialExistingDesign);
  }, [initialCustomization, initialExistingDesign]);

  const isMeaningful = useMemo(() => {
    // We need a stable initial customization for comparison, but since we don't have it here, 
    // we'll use a simplified check or rely on the parent component to pass a stable initial state.
    // For now, we'll use a simple check if any field is populated.
    return isCustomizationMeaningful(customization, initialCustomization);
  }, [customization, initialCustomization]);

  const handleCustomizationChange = useCallback((newCustomization: ProductCustomization) => {
    setCustomization(newCustomization);
    // If the user modifies the design after loading an existing one, it's no longer the exact saved design.
    if (existingDesign) {
      setExistingDesign(undefined);
    }
  }, [existingDesign]);

  const handleAddToCart = () => {
    let customizationToPass: ProductCustomization | undefined = undefined;

    if (isMeaningful || existingDesign) {
      // Clean up empty text fields
      const cleanedCustomization: ProductCustomization = {
        ...customization,
        texts: customization.texts.filter(text => text.trim().length > 0),
      };
      customizationToPass = cleanedCustomization;
    }

    // For simplicity, assume the first variant is selected if none is explicitly managed here
    const variantId = product.variants[0]?.id; 

    addItem(product, variantId, 1, customizationToPass);
    toast({
      title: "Added to cart",
      description: `${product.name} with custom design added to your cart`,
    });
    onBack(); // Go back to product detail page or catalog
  };
  
  const handleDesignSaved = (savedDesign: SavedDesignTemplate) => {
    setExistingDesign(savedDesign);
    onDesignSaved(savedDesign);
  };
  
  const handleDesignLoaded = (design: SavedDesignTemplate) => {
    setCustomization(design.customization);
    setExistingDesign(design);
    onDesignLoaded(design);
  };

  // Mock Preview Logic (similar to ProductCustomizationForm)
  const isCustomizing = customization.texts.some(t => t.trim()) || customization.startDesign || customization.endDesign;
  
  // FIX: Access the small size URL for the preview background
  const previewImageUrl = (product.images[0] as ImageSizes)?.small || '/placeholder.svg';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Live Preview */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Image className="h-6 w-6 mr-2 text-orange-500" />
              Live Design Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-xl">
              {/* Product Image Background */}
              <img 
                src={previewImageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Customization Overlays */}
              <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
                {customization.texts.map((text, index) => {
                  if (text.trim() === '') return null;
                  
                  // Simple mock positioning based on index
                  const positionClasses = index === 0 
                    ? 'top-1/4 left-1/2 -translate-x-1/2' 
                    : index === 1 
                    ? 'bottom-1/4 left-1/2 -translate-x-1/2' 
                    : 'top-1/2 left-1/2 -translate-x-1/2';
                    
                  const fontStyle = customization.font || 'Arial';
                  
                  return (
                    <div 
                      key={index} 
                      className={cn(
                        "absolute p-2 bg-white/80 backdrop-blur-sm rounded shadow-lg text-center transition-all duration-300",
                        positionClasses
                      )}
                      style={{ fontFamily: fontStyle, fontSize: '1.5rem', fontWeight: 'bold', color: 'black' }}
                    >
                      {text}
                    </div>
                  );
                })}
                
                {/* Design Overlays (Simplified) */}
                {customization.startDesign && (
                  <div className="absolute top-4 left-4 p-2 bg-white/70 rounded text-sm text-blue-700 font-medium">
                    Start Design Applied
                  </div>
                )}
                {customization.endDesign && (
                  <div className="absolute bottom-4 right-4 p-2 bg-white/70 rounded text-sm text-blue-700 font-medium">
                    End Design Applied
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
          </CardContent>
        </Card>
        
        {/* Quick Actions for Design Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SaveDesignButton
            product={product}
            customization={customization}
            isCustomizationMeaningful={isMeaningful}
            onDesignSaved={handleDesignSaved}
            existingDesign={existingDesign}
          />
          <DesignLoaderDialog
            product={product}
            onDesignLoaded={handleDesignLoaded}
          />
        </div>
      </div>

      {/* Right Column: Controls and Checkout */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Design Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <DesignControls
              product={product}
              customization={customization}
              onCustomizationChange={handleCustomizationChange}
            />
            
            <div className="mt-6 pt-4 border-t space-y-3">
              <h3 className="text-lg font-bold">
                ${product.discountedPrice || product.basePrice}
              </h3>
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add Customized Item to Cart
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Product Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DesignEditor;