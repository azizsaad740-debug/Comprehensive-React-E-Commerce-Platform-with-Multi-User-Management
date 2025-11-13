"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Image, Wand2, Save, Trash2, RefreshCw, PlusCircle, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';
import ImageGeneratorForm from '@/components/admin/ImageGeneratorForm';
import { updateMockProductImages } from '@/utils/productUtils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImageManagementModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdate: () => void;
}

const ImageManagementModal: React.FC<ImageManagementModalProps> = ({ product, isOpen, onClose, onProductUpdate }) => {
  const [currentImages, setCurrentImages] = useState(product.images);
  const [isSaving, setIsSaving] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const { toast } = useToast();

  // Sync images when product prop changes (e.g., modal opens)
  React.useEffect(() => {
    setCurrentImages(product.images);
  }, [product.images]);

  const handleImageSelected = (imageUrl: string) => {
    // Add the new image URL to the list
    setCurrentImages(prev => [imageUrl, ...prev.filter(img => img !== '/placeholder.svg')]);
  };
  
  const handleAddManualImage = () => {
    if (manualUrl.trim()) {
      setCurrentImages(prev => [manualUrl.trim(), ...prev.filter(img => img !== '/placeholder.svg')]);
      setManualUrl('');
      toast({ title: "Image Added", description: "Image URL added to the list." });
    }
  };
  
  const handleRemoveImage = (index: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSaveImages = () => {
    setIsSaving(true);
    
    // Ensure at least one image exists, use placeholder if empty
    const imagesToSave = currentImages.length > 0 ? currentImages : ['/placeholder.svg'];
    
    const updatedProduct = updateMockProductImages(product.id, imagesToSave);
    
    if (updatedProduct) {
      onProductUpdate();
      toast({ title: "Success", description: `Images for ${product.name} updated.` });
    } else {
      toast({ title: "Error", description: "Failed to update product images.", variant: "destructive" });
    }
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Image className="h-5 w-5" />
            <span>Image Management: {product.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: AI Generator & Manual Input */}
          <div className="space-y-6">
            {/* AI Generator */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Wand2 className="h-4 w-4 mr-2" /> AI Image Generator
              </h3>
              <ImageGeneratorForm 
                product={product} 
                onImageSelected={handleImageSelected} 
                onClose={() => { /* Keep modal open */ }}
              />
            </div>
            
            {/* Manual URL Input */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Link className="h-4 w-4 mr-2" /> Add Image via URL
              </h3>
              <div className="space-y-2">
                <Label htmlFor="manualUrl">Image URL / Path</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="manualUrl"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="e.g., /new-mockup.jpg"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddManualImage}
                    disabled={!manualUrl.trim()}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column: Current Images & Editor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Images ({currentImages.length})</h3>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto p-2 border rounded-lg">
              {currentImages.map((url, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img src={url} alt={`Product Image ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 ml-3">
                    <p className="text-sm font-medium truncate">Image {index + 1}</p>
                    <p className="text-xs text-gray-500 truncate">{url}</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {currentImages.length === 0 && (
                <p className="text-center text-gray-500 py-4">No images added yet.</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                onClick={handleSaveImages} 
                disabled={isSaving}
              >
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save All Images
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageManagementModal;