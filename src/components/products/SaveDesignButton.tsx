"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save, Loader2 } from 'lucide-react';
import { Product, ProductCustomization, SavedDesignTemplate } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { saveDesign } from '@/utils/designUtils';

interface SaveDesignButtonProps {
  product: Product;
  customization: ProductCustomization;
  isCustomizationMeaningful: boolean;
  onDesignSaved: (design: SavedDesignTemplate) => void;
}

const SaveDesignButton: React.FC<SaveDesignButtonProps> = ({
  product,
  customization,
  isCustomizationMeaningful,
  onDesignSaved,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [designName, setDesignName] = useState(product.name + ' Design');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save your design.",
        variant: "destructive",
      });
      return;
    }

    if (!isCustomizationMeaningful) {
      toast({
        title: "Nothing to Save",
        description: "Please customize your product before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call delay
      setTimeout(() => {
        const savedDesign = saveDesign(
          user.id,
          designName,
          product.id,
          product.name,
          customization
        );
        
        onDesignSaved(savedDesign);
        
        toast({
          title: "Design Saved",
          description: `Your design "${designName}" has been saved to your library.`,
        });
        
        setIsLoading(false);
        setIsDialogOpen(false);
      }, 500);

    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to save design.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full" 
          size="lg"
          disabled={!isAuthenticated || !isCustomizationMeaningful}
        >
          <Save className="h-5 w-5 mr-2" />
          Save Design
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Customization</DialogTitle>
          <DialogDescription>
            Give your design a name to save it to your personal library.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="designName">Design Name</Label>
            <Input
              id="designName"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              required
            />
          </div>
          <div className="text-sm text-gray-500">
            Product: {product.name}
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || designName.trim() === ''}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Saving...' : 'Confirm Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveDesignButton;