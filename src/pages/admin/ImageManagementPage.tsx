"use client";

import React, { useState, useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Upload, Trash2, PlusCircle, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ImageAsset } from '@/types';
import { 
  getAllHeroSlides, 
  getAllImageAssets,
  addImageAsset,
  deleteImageAsset
} from '@/utils/imageManagementUtils';
import { Badge } from '@/components/ui/badge';
import HeroSlideManagement from '@/components/admin/HeroSlideManagement'; // NEW IMPORT

// --- Component for managing Image Assets ---

interface ImageAssetManagementProps {
  assets: ImageAsset[];
  onAssetsUpdated: () => void;
}

const ImageAssetManagement: React.FC<ImageAssetManagementProps> = ({ assets, onAssetsUpdated }) => {
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetType, setNewAssetType] = useState<ImageAsset['type']>('product');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName || !newAssetUrl) return;
    
    setIsUploading(true);
    setTimeout(() => {
      addImageAsset(newAssetName, newAssetUrl, newAssetType);
      onAssetsUpdated();
      setNewAssetName('');
      setNewAssetUrl('');
      setIsUploading(false);
      toast({ title: "Success", description: "Image asset added." });
    }, 500);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      deleteImageAsset(id);
      onAssetsUpdated();
      toast({ title: "Deleted", description: "Image asset deleted." });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Assets</CardTitle>
        <CardDescription>Manage product images, banners, and other media assets.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Asset Form */}
        <form onSubmit={handleAddAsset} className="p-4 border rounded-lg space-y-3">
          <h4 className="font-semibold flex items-center"><Upload className="h-4 w-4 mr-2" /> Add New Asset (Mock Upload)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assetName">Name</Label>
              <Input id="assetName" value={newAssetName} onChange={(e) => setNewAssetName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetUrl">Image URL / Path</Label>
              <Input id="assetUrl" value={newAssetUrl} onChange={(e) => setNewAssetUrl(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetType">Type</Label>
              <Select value={newAssetType} onValueChange={(val) => setNewAssetType(val as ImageAsset['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product Image</SelectItem>
                  <SelectItem value="hero">Hero Banner</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={isUploading || !newAssetName || !newAssetUrl}>
            {isUploading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
            Add Asset
          </Button>
        </form>

        {/* Asset List */}
        <div className="space-y-3">
          {assets.map(asset => (
            <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-medium">{asset.name}</h4>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{asset.url}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="capitalize">{asset.type}</Badge>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(asset.id)}>
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


const ImageManagementPage = () => {
  const [assets, setAssets] = useState(getAllImageAssets());
  const [slides, setSlides] = useState(getAllHeroSlides());

  const refreshAssets = () => setAssets(getAllImageAssets());
  const refreshSlides = () => setSlides(getAllHeroSlides());

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Image className="h-6 w-6 mr-3" />
            Image & Content Management
          </h1>
        </div>
        <p className="text-gray-600 mb-8">Manage visual assets and dynamic content sections like the homepage hero slider.</p>

        <Tabs defaultValue="hero">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="hero">
              Hero Slider
            </TabsTrigger>
            <TabsTrigger value="assets">
              <Image className="h-4 w-4 mr-2" /> Image Assets
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="hero" className="mt-6">
            <HeroSlideManagement assets={assets} slides={slides} onRefreshSlides={refreshSlides} />
          </TabsContent>
          
          <TabsContent value="assets" className="mt-6">
            <ImageAssetManagement assets={assets} onAssetsUpdated={refreshAssets} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ImageManagementPage;