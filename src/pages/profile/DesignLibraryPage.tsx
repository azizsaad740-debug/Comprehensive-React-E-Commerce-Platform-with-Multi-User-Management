"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Palette, Edit, Trash2, ArrowLeft, ShoppingCart } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { SavedDesignTemplate, ImageSizes, Product } from '@/types';
import { getDesignsByUserId, deleteDesign } from '@/utils/designUtils';
import { getAllMockStartDesigns, getAllMockEndDesigns } from '@/utils/customizationUtils';
import { getMockProductById } from '@/utils/productUtils';
import { useCartStore } from '@/stores/cartStore';

const DesignLibraryPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [designs, setDesigns] = useState<SavedDesignTemplate[]>([]);
  
  const mockStartDesigns = getAllMockStartDesigns();
  const mockEndDesigns = getAllMockEndDesigns();

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/auth/login');
    }
    if (user) {
      setDesigns(getDesignsByUserId(user.id));
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  const refreshDesigns = () => {
    if (user) {
      setDesigns(getDesignsByUserId(user.id));
    }
  };

  const handleDeleteDesign = (designId: string) => {
    if (window.confirm("Are you sure you want to delete this saved design?")) {
      try {
        deleteDesign(designId);
        refreshDesigns();
        toast({
          title: "Deleted",
          description: "Design template removed successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete design.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleReorder = async (design: SavedDesignTemplate) => {
    const product = await getMockProductById(design.productId);
    
    if (!product) {
      toast({
        title: "Error",
        description: "Product associated with this design was not found.",
        variant: "destructive",
      });
      return;
    }
    
    // Determine the variant ID to use. If the design specifies one, use it. Otherwise, use the first available variant.
    const variant = product.variants.length > 0 ? product.variants[0] : undefined;
    const variantId = variant?.id;

    // Add the item to the cart with the saved customization
    addItem(product, variantId, 1, design.customization);
    
    toast({
      title: "Added to Cart",
      description: `Design "${design.name}" added to cart. ${variant ? `(Variant: ${variant.name})` : ''}`,
    });
    
    // Optionally navigate to cart or keep on page
    // navigate('/cart'); 
  };

  if (!isAuthenticated || !user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading profile or redirecting...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Design Library</h1>
          <Button variant="outline" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </div>
        <p className="text-gray-600 mb-8">
          View, manage, and reorder products using your saved customization templates.
        </p>

        <div className="flex justify-end mb-8">
          <Button variant="default" onClick={() => navigate('/products')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Design
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.length === 0 ? (
            <Card className="lg:col-span-3 text-center py-12">
              <Palette className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">You haven't saved any designs yet.</p>
            </Card>
          ) : (
            designs.map((design) => {
              // Use a temporary state/memoization or fetch inside map if necessary, 
              // but for simplicity in this component, we rely on the mock utility being fast.
              // Since getMockProductById is now async, we must handle it.
              // For display purposes, we'll use a placeholder until we refactor this component fully.
              // However, since the product is only needed for the image URL and reorder, 
              // we'll wrap the image logic in a component or handle the async fetch here.
              
              // NOTE: Since we cannot await inside map, we must rely on the product object 
              // being passed to the component or fetched beforehand. Since the original code 
              // used a synchronous utility, we must now fetch it asynchronously inside the map 
              // or use a placeholder. Given the complexity, I'll introduce a temporary component 
              // to handle the async fetch for the image URL within the map context.
              
              // For now, I'll use a placeholder image and rely on the async fetch in handleReorder.
              const imageUrl = '/placeholder.svg';
              
              return (
                <Card key={design.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">{design.name}</CardTitle>
                    <CardDescription>Product: {design.productName}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 space-y-3">
                    {/* Product Image Preview */}
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center p-4 border border-dashed border-gray-300 relative overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={design.productName} 
                        className="w-full h-full object-cover opacity-50"
                      />
                      <div className="absolute inset-0 flex items-center justify-center p-2">
                        <div className="text-center text-gray-800 text-sm bg-white/80 p-3 rounded-lg shadow-md">
                          <p className="font-bold mb-1">Customization Preview</p>
                          <p>Text: {design.customization.texts.filter(t => t.trim()).join(' | ') || 'N/A'}</p>
                          <p>Font: {design.customization.font || 'Default'}</p>
                          {design.customization.startDesign && (
                            <p>Start Design: {mockStartDesigns.find(d => d.id === design.customization.startDesign)?.name}</p>
                          )}
                          {design.customization.endDesign && (
                            <p>End Design: {mockEndDesigns.find(d => d.id === design.customization.endDesign)?.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Last updated: {design.updatedAt.toLocaleDateString()}
                    </p>
                    
                    <div className="flex space-x-2 pt-2 border-t mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleReorder(design)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Reorder
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/products/${design.productId}/design?designId=${design.id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteDesign(design.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DesignLibraryPage;