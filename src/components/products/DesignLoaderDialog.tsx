"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { List, Loader2, Check, Palette } from 'lucide-react';
import { SavedDesignTemplate, Product } from '@/types';
import { getDesignsByUserId } from '@/utils/designUtils';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

interface DesignLoaderDialogProps {
  product: Product;
  onDesignLoaded: (design: SavedDesignTemplate) => void;
}

const DesignLoaderDialog: React.FC<DesignLoaderDialogProps> = ({ product, onDesignLoaded }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userDesigns, setUserDesigns] = useState<SavedDesignTemplate[]>([]);

  useEffect(() => {
    if (isDialogOpen && user) {
      setIsLoading(true);
      // Simulate fetching designs
      setTimeout(() => {
        const allDesigns = getDesignsByUserId(user.id);
        // Filter designs relevant to the current product ID
        const productDesigns = allDesigns.filter(d => d.productId === product.id);
        setUserDesigns(productDesigns);
        setIsLoading(false);
      }, 300);
    }
  }, [isDialogOpen, user, product.id]);

  const handleLoadDesign = (design: SavedDesignTemplate) => {
    onDesignLoaded(design);
    setIsDialogOpen(false);
    toast({
      title: "Design Loaded",
      description: `Customization template "${design.name}" applied.`,
    });
  };

  if (!isAuthenticated) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full" 
          size="lg"
          disabled={!isAuthenticated}
        >
          <Palette className="h-5 w-5 mr-2" />
          Load Saved Design
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Load Saved Design for {product.name}</DialogTitle>
          <DialogDescription>
            Select a saved customization template to apply it to the current product.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : userDesigns.length === 0 ? (
          <div className="text-center py-8">
            <List className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No saved designs found for this product.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {userDesigns.map((design) => (
              <Card key={design.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">{design.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Text: {design.customization.texts.filter(t => t.trim()).join(' | ') || 'N/A'}
                    </CardDescription>
                    <CardDescription className="text-xs">
                      Font: {design.customization.font || 'Default'} | Updated: {design.updatedAt.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleLoadDesign(design)} size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Load
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
      </DialogContent>
    </Dialog>
  );
};

export default DesignLoaderDialog;