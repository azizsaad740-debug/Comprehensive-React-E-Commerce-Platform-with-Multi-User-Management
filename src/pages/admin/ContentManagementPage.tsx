"use client";

import React, { useState, useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Upload, Trash2, PlusCircle, RefreshCw, FileText, Phone, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ImageAsset, StaticPage } from '@/types';
import { 
  getAllHeroSlides, 
  getAllImageAssets,
  addImageAsset,
  deleteImageAsset
} from '@/utils/imageManagementUtils';
import { Badge } from '@/components/ui/badge';
import HeroSlideManagement from '@/components/admin/HeroSlideManagement';
import ContactInfoForm from '@/components/admin/ContactInfoForm';
import StaticPageForm from '@/components/admin/StaticPageForm';
import FaqManagement from '@/components/admin/FaqManagement';
import { useContentStore } from '@/stores/contentStore';

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
        {/* Add New Asset Form (Simplified Manual Input) */}
        <form onSubmit={handleAddAsset} className="p-4 border rounded-lg space-y-3">
          <h4 className="font-semibold flex items-center"><PlusCircle className="h-4 w-4 mr-2" /> Manually Add Asset</h4>
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
            {isUploading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
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

// --- Component for managing Static Pages ---

const StaticPageManagement: React.FC<{ staticPages: StaticPage[] }> = ({ staticPages }) => {
  const [activePageSlug, setActivePageSlug] = useState(staticPages[0]?.slug || 'about');
  const selectedPage = staticPages.find(p => p.slug === activePageSlug);

  if (!selectedPage) return <p>No static pages configured.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Static Page Content</CardTitle>
        <CardDescription>Edit the content for informational pages linked in the footer and navigation.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activePageSlug} onValueChange={setActivePageSlug}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-6 overflow-x-auto">
            {staticPages.map(page => (
              <TabsTrigger key={page.slug} value={page.slug} className="capitalize">
                {page.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="mt-6">
            {staticPages.map(page => (
              <TabsContent key={page.slug} value={page.slug} className="mt-0">
                <StaticPageForm initialPage={page} />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};


const ContentManagementPage = () => {
  const { staticPages } = useContentStore();
  const [assets, setAssets] = useState(getAllImageAssets());
  const [slides, setSlides] = useState(getAllHeroSlides());

  const refreshAssets = () => setAssets(getAllImageAssets());
  const refreshSlides = () => setSlides(getAllHeroSlides());

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="h-6 w-6 mr-3" />
            Content Management
          </h1>
        </div>
        <p className="text-gray-600 mb-8">Manage visual assets, dynamic content sections, and static page content.</p>

        <Tabs defaultValue="contact">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contact">
              <Phone className="h-4 w-4 mr-2" /> Contact Info
            </TabsTrigger>
            <TabsTrigger value="pages">
              <FileText className="h-4 w-4 mr-2" /> Static Pages
            </TabsTrigger>
            <TabsTrigger value="faq">
              <HelpCircle className="h-4 w-4 mr-2" /> FAQ
            </TabsTrigger>
            <TabsTrigger value="assets">
              <Image className="h-4 w-4 mr-2" /> Assets & Slider
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="contact" className="mt-6">
            <ContactInfoForm />
          </TabsContent>
          
          <TabsContent value="pages" className="mt-6">
            <StaticPageManagement staticPages={staticPages} />
          </TabsContent>
          
          <TabsContent value="faq" className="mt-6">
            <FaqManagement />
          </TabsContent>
          
          <TabsContent value="assets" className="mt-6 space-y-6">
            <HeroSlideManagement assets={assets} slides={slides} onRefreshSlides={refreshSlides} />
            <ImageAssetManagement assets={assets} onAssetsUpdated={refreshAssets} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ContentManagementPage;