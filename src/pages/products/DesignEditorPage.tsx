"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import DesignEditor from '@/components/products/DesignEditor';
import { getMockProductById } from '@/utils/productUtils';
import { getDesignById } from '@/utils/designUtils';
import { Product, ProductCustomization, SavedDesignTemplate } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const DesignEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const designId = query.get('designId');
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [initialCustomization, setInitialCustomization] = useState<ProductCustomization | null>(null);
  const [existingDesign, setExistingDesign] = useState<SavedDesignTemplate | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const handleBack = () => {
    navigate(`/products/${id}`);
  };
  
  const handleDesignSaved = (savedDesign: SavedDesignTemplate) => {
    // If a new design was saved, update the URL to include the new designId for continuity
    if (savedDesign.id && savedDesign.id !== designId) {
      navigate(`/products/${product?.id}/design?designId=${savedDesign.id}`, { replace: true });
    }
    setExistingDesign(savedDesign);
  };
  
  const handleDesignLoaded = (design: SavedDesignTemplate) => {
    // Update URL query parameter to reflect the loaded design ID
    navigate(`/products/${product?.id}/design?designId=${design.id}`, { replace: true });
    setInitialCustomization(design.customization);
    setExistingDesign(design);
  };

  useEffect(() => {
    if (!id) {
      navigate('/products');
      return;
    }

    const fetchedProduct = getMockProductById(id);
    if (!fetchedProduct) {
      navigate('/products');
      toast({
        title: "Product Not Found",
        description: `Product with ID ${id} does not exist.`,
        variant: "destructive",
      });
      return;
    }

    setProduct(fetchedProduct);
    
    // 1. Define the default customization based on product options
    const defaultCustom: ProductCustomization = {
      texts: Array(fetchedProduct.printPaths).fill(''),
      font: fetchedProduct.customizationOptions.fonts[0] || '',
      startDesign: fetchedProduct.customizationOptions.startDesigns?.[0] || undefined,
      endDesign: fetchedProduct.customizationOptions.endDesigns?.[0] || undefined,
      previewImage: '',
      svgFile: ''
    };

    let loadedCustomization: ProductCustomization = defaultCustom;
    let loadedDesign: SavedDesignTemplate | undefined;

    // 2. Check for saved design override
    if (designId) {
      loadedDesign = getDesignById(designId);
      if (loadedDesign && loadedDesign.productId === id) {
        loadedCustomization = loadedDesign.customization;
        setExistingDesign(loadedDesign);
      } else if (designId) {
        toast({
          title: "Design Not Found",
          description: "Could not load the specified design template.",
          variant: "destructive",
        });
      }
    }
    
    // 3. Ensure loaded customization texts array matches product printPaths length
    const requiredTextLength = fetchedProduct.printPaths;
    const currentTextLength = loadedCustomization.texts.length;
    
    if (currentTextLength < requiredTextLength) {
        const padding = Array(requiredTextLength - currentTextLength).fill('');
        loadedCustomization = {
            ...loadedCustomization,
            texts: [...loadedCustomization.texts, ...padding]
        };
    } else if (currentTextLength > requiredTextLength) {
        loadedCustomization = {
            ...loadedCustomization,
            texts: loadedCustomization.texts.slice(0, requiredTextLength)
        };
    }
    
    if (!loadedCustomization.font && fetchedProduct.customizationOptions.fonts.length > 0) {
        loadedCustomization.font = fetchedProduct.customizationOptions.fonts[0];
    }
    
    setInitialCustomization(loadedCustomization);
    setIsLoading(false);
    
  }, [id, navigate, toast, designId, location.search]);

  if (isLoading || !product || !initialCustomization) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-128px)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Design Editor: {product.name}</h1>
        <DesignEditor
          product={product}
          initialCustomization={initialCustomization}
          existingDesign={existingDesign}
          onBack={handleBack}
          onDesignSaved={handleDesignSaved}
          onDesignLoaded={handleDesignLoaded}
        />
      </div>
    </Layout>
  );
};

export default DesignEditorPage;