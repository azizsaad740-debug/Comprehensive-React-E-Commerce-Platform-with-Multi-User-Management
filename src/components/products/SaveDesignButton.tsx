"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save, Loader2, Edit } from 'lucide-react';
import { Product, ProductCustomization, SavedDesignTemplate } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { saveDesign } from '@/utils/designUtils';

interface SaveDesignButtonProps {
  product: Product;
  customization: ProductCustomization;
  isCustomizationMeaningful: boolean;
  onDesignSaved: (design: SavedDesignTemplate) => void;
  existingDesign?: SavedDesignTemplate; // NEW: Optional existing design object
}

const SaveDesignButton: React.FC<SaveDesignButtonProps> = ({
  product,
  customization,
  isCustomizationMeaningful,
  onDesignSaved,
  existingDesign,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [designName, setDesignName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!existingDesign;

  useEffect(() => {
    if (isEditing) {
      setDesignName(existingDesign.name);
    } else {
      setDesignName(product.name + ' Design');
    }
  }, [isEditing, existingDesign, product.name]);

  const handleSave = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save your design.",
        variant: "destructive",
      });
      return;
    }

    if (!isCustomizationMeaningful && !isEditing) {
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
          customization,
          existingDesign?.id // Pass ID if editing
        );
        
        onDesignSaved(savedDesign);
        
        toast({
          title: isEditing ? "Design Updated" : "Design Saved",
          description: `Your design "${designName}" has been ${isEditing ? 'updated' : 'saved'} to your library.`,
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
          variant={isEditing ? "default" : "outline"} 
          className="w-full" 
          size="lg"
          disabled={!isAuthenticated || (!isCustomizationMeaningful && !isEditing)}
        >
          {isEditing ? <Edit className="h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
          {isEditing ? 'Update Design' : 'Save Design'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Update Customization' : 'Save Customization'}</DialogTitle>
          <DialogDescription>
            {isEditing ? `Update the details for design: ${existingDesign.name}` : 'Give your design a name to save it to your personal library.'}
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
            {isLoading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Confirm Update' : 'Confirm Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveDesignButton;