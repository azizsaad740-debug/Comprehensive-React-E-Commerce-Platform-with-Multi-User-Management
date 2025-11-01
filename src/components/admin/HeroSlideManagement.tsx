"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, Link, Upload, Trash2, Edit, PlusCircle, RefreshCw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HeroSlide, ImageAsset } from '@/types';
import { 
  updateHeroSlide, 
  createHeroSlide, 
  deleteHeroSlide,
} from '@/utils/imageManagementUtils';

// --- Component for managing Hero Slides ---

interface HeroSlideFormProps {
  initialSlide?: HeroSlide;
  onSave: (slide: HeroSlide) => void;
  onCancel: () => void;
  assets: ImageAsset[];
}

const HeroSlideForm: React.FC<HeroSlideFormProps> = ({ initialSlide, onSave, onCancel, assets }) => {
  const [formData, setFormData] = useState<Omit<HeroSlide, 'id'>>(initialSlide || {
    heading: '',
    subheading: '',
    imageUrl: '',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    isActive: true,
    sortOrder: 99,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageSource, setImageSource] = useState<'asset' | 'url'>(
    initialSlide?.imageUrl && initialSlide.imageUrl.startsWith('/') ? 'asset' : 'url'
  );

  const handleChange = (field: keyof HeroSlide, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const slideToSave = { ...formData, sortOrder: Number(formData.sortOrder) };
      
      if (initialSlide) {
        onSave(updateHeroSlide({ ...initialSlide, ...slideToSave }));
      } else {
        onSave(createHeroSlide(slideToSave));
      }
      setIsLoading(false);
    }, 500);
  };

  const availableAssets = assets.filter(a => a.type === 'hero' || a.type === 'other');

  return (
    <Card className="mt-4 border-primary/50">
      <CardHeader>
        <CardTitle>{initialSlide ? 'Edit Slide' : 'Create New Slide'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heading">Heading</Label>
              <Input id="heading" value={formData.heading} onChange={(e) => handleChange('heading', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input id="sortOrder" type="number" value={formData.sortOrder} onChange={(e) => handleChange('sortOrder', Number(e.target.value))} required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subheading">Subheading</Label>
            <Textarea id="subheading" value={formData.subheading} onChange={(e) => handleChange('subheading', e.target.value)} required />
          </div>
          
          {/* Image Selection */}
          <div className="space-y-2">
            <Label>Image Source</Label>
            <Select value={imageSource} onValueChange={(val: 'asset' | 'url') => {
              setImageSource(val);
              // Clear URL if switching source type
              setFormData(prev => ({ ...prev, imageUrl: '' }));
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select image source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">Select from Assets</SelectItem>
                <SelectItem value="url">Enter URL Manually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {imageSource === 'asset' && (
            <div className="space-y-2">
              <Label htmlFor="assetSelect">Select Asset</Label>
              <Select 
                value={formData.imageUrl} 
                onValueChange={handleImageSelect}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an uploaded image asset" />
                </SelectTrigger>
                <SelectContent>
                  {availableAssets.map(asset => (
                    <SelectItem key={asset.id} value={asset.url}>
                      {asset.name} ({asset.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {imageSource === 'url' && (
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" value={formData.imageUrl} onChange={(e) => handleChange('imageUrl', e.target.value)} required />
              <p className="text-xs text-gray-500">Enter a full URL or path (e.g., /placeholder.svg)</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buttonText">Button Text</Label>
              <Input id="buttonText" value={formData.buttonText} onChange={(e) => handleChange('buttonText', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonLink">Button Link (URL)</Label>
              <Input id="buttonLink" value={formData.buttonLink} onChange={(e) => handleChange('buttonLink', e.target.value)} required />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Label>Status:</Label>
            <Select 
              value={formData.isActive ? 'active' : 'inactive'} 
              onValueChange={(val) => handleChange('isActive', val === 'active')}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !formData.imageUrl}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {initialSlide ? 'Update Slide' : 'Create Slide'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

interface HeroSlideManagementProps {
  assets: ImageAsset[];
  slides: HeroSlide[];
  onRefreshSlides: () => void;
}

const HeroSlideManagement: React.FC<HeroSlideManagementProps> = ({ assets, slides, onRefreshSlides }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | undefined>(undefined);
  const { toast } = useToast();

  const handleSave = (slide: HeroSlide) => {
    onRefreshSlides(); // Refresh from mock utility
    setIsFormOpen(false);
    setEditingSlide(undefined);
    toast({ title: "Success", description: `Hero slide ${slide.heading} saved.` });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this slide?")) {
      deleteHeroSlide(id);
      onRefreshSlides();
      toast({ title: "Deleted", description: "Hero slide deleted." });
    }
  };
  
  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setIsFormOpen(true);
  };
  
  const handleNew = () => {
    setEditingSlide(undefined);
    setIsFormOpen(true);
  };
  
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingSlide(undefined);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <SlidersHorizontal className="h-5 w-5" />
          <span>Hero Slides ({slides.length})</span>
        </CardTitle>
        <Button onClick={handleNew}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Slide
        </Button>
      </CardHeader>
      <CardContent>
        {isFormOpen && (
          <HeroSlideForm 
            initialSlide={editingSlide} 
            onSave={handleSave} 
            onCancel={handleCancel} 
            assets={assets}
          />
        )}
        
        <div className="space-y-4 mt-4">
          {slides.map(slide => (
            <div key={slide.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <img src={slide.imageUrl} alt={slide.heading} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold">{slide.heading}</h3>
                  <p className="text-sm text-gray-500 truncate max-w-xs">{slide.subheading}</p>
                  <p className="text-xs text-gray-400">Link: {slide.buttonLink}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant={slide.isActive ? 'default' : 'outline'} className="capitalize">
                  {slide.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="secondary">Order: {slide.sortOrder}</Badge>
                
                <Button variant="outline" size="sm" onClick={() => handleEdit(slide)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(slide.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HeroSlideManagement;