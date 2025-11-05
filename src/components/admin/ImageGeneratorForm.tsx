"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Wand2, Image, Save, X } from 'lucide-react';
import { useImageGenerator } from '@/hooks/useImageGenerator';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';
import { Textarea } from '@/components/ui/textarea';

interface ImageGeneratorFormProps {
  product: Product;
  onImageSelected: (imageUrl: string) => void;
  onClose: () => void;
}

const ImageGeneratorForm: React.FC<ImageGeneratorFormProps> = ({ product, onImageSelected, onClose }) => {
  const { generateImage, isLoading, error } = useImageGenerator();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState(`A high-quality, professional mockup of a ${product.name} with a custom design.`);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Error", description: "Please enter a prompt.", variant: "destructive" });
      return;
    }
    
    const result = await generateImage(prompt);
    
    if (result) {
      setGeneratedImageUrl(result.imageUrl);
      toast({ title: "Success", description: result.message });
    } else if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    }
  };
  
  const handleSelectImage = () => {
    if (generatedImageUrl) {
      setIsSaving(true);
      // Simulate saving the image asset to the system (which would typically involve 
      // calling an asset management utility or API endpoint here).
      setTimeout(() => {
        onImageSelected(generatedImageUrl);
        setIsSaving(false);
        onClose();
      }, 300);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt" className="flex items-center">
              <Wand2 className="h-4 w-4 mr-2" /> AI Image Generation Prompt
            </Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !prompt.trim()}
            className="w-full"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
            Generate Image
          </Button>
          
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>

      {/* Preview and Selection */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Label className="flex items-center">
            <Image className="h-4 w-4 mr-2" /> Generated Preview
          </Label>
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-dashed">
            {generatedImageUrl ? (
              <img 
                src={generatedImageUrl} 
                alt="Generated AI Image" 
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="text-gray-500 text-sm">Image will appear here after generation.</p>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSaving}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" /> Close
            </Button>
            <Button 
              onClick={handleSelectImage} 
              disabled={!generatedImageUrl || isSaving}
              className="flex-1"
            >
              {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isSaving ? 'Saving...' : 'Use This Image'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageGeneratorForm;