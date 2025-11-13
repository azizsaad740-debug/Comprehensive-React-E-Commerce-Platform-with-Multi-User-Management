"use client";

import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, LayoutGrid, Type, Upload, Save, X, Tag, Image, DollarSign, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import ColorInput from '@/components/admin/ColorInput';
import { useBrandingStore } from '@/stores/brandingStore';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import CheckoutSettingsForm from '@/components/admin/CheckoutSettingsForm';

const SettingsPage = () => {
  const { appName, slogan, logoUrl, updateBranding } = useBrandingStore();
  const { toast } = useToast();
  
  // Local state for color customization (separate from branding store)
  const [primaryColor, setPrimaryColor] = useState('#2563EB');
  const [accentColor, setAccentColor] = useState('#F59E0B');
  
  // Local state for branding form
  const [brandingData, setBrandingData] = useState({
    appName: appName,
    slogan: slogan,
    logoUrl: logoUrl,
  });

  const handleBrandingChange = (field: 'appName' | 'slogan' | 'logoUrl', value: string) => {
    setBrandingData(prev => ({ ...prev, [field]: value }));
  };

  const handlePublish = () => {
    // 1. Update Branding Store
    updateBranding(brandingData);
    
    // 2. Apply Color Changes (Mocked - in a real app, this would update CSS variables)
    // For now, we just confirm the action.
    
    toast({
      title: "Theme Published",
      description: "Branding and color changes have been saved and published.",
    });
  };

  const handleDiscard = () => {
    // Reset local state to current store values
    setBrandingData({
      appName: appName,
      slogan: slogan,
      logoUrl: logoUrl,
    });
    setPrimaryColor('#2563EB');
    setAccentColor('#F59E0B');
    toast({
      title: "Changes Discarded",
      description: "Local changes were reset to the last published version.",
    });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Palette className="h-6 w-6 mr-3" />
            System Settings
          </h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={handleDiscard}>
              <X className="h-4 w-4 mr-2" />
              Discard Changes
            </Button>
            <Button onClick={handlePublish}>
              <Save className="h-4 w-4 mr-2" />
              Publish Theme
            </Button>
          </div>
        </div>
        <p className="text-gray-600 mb-8">Customize the look, feel, and core functionality of your storefront.</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Theme Settings Navigation */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Settings Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="branding" orientation="vertical">
                <TabsList className="flex flex-col h-auto p-0 bg-transparent space-y-1">
                  <TabsTrigger value="branding" className="w-full justify-start data-[state=active]:bg-accent">
                    <Tag className="h-4 w-4 mr-2" /> Branding & Identity
                  </TabsTrigger>
                  <TabsTrigger value="colors" className="w-full justify-start data-[state=active]:bg-accent">
                    <Palette className="h-4 w-4 mr-2" /> Colors
                  </TabsTrigger>
                  <TabsTrigger value="checkout" className="w-full justify-start data-[state=active]:bg-accent">
                    <DollarSign className="h-4 w-4 mr-2" /> Checkout & Delivery
                  </TabsTrigger>
                  <TabsTrigger value="typography" className="w-full justify-start data-[state=active]:bg-accent">
                    <Type className="h-4 w-4 mr-2" /> Typography
                  </TabsTrigger>
                  <TabsTrigger value="layout" className="w-full justify-start data-[state=active]:bg-accent">
                    <LayoutGrid className="h-4 w-4 mr-2" /> Layout Presets
                  </TabsTrigger>
                  <TabsTrigger value="assets" className="w-full justify-start data-[state=active]:bg-accent">
                    <Image className="h-4 w-4 mr-2" /> Assets & Banners
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Theme Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="branding">
              
              {/* Branding Tab */}
              <TabsContent value="branding">
                <Card>
                  <CardHeader>
                    <CardTitle>Branding & Identity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="appName">Application Name</Label>
                      <Input 
                        id="appName" 
                        value={brandingData.appName} 
                        onChange={(e) => handleBrandingChange('appName', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="slogan">Slogan / Tagline</Label>
                      <Textarea 
                        id="slogan" 
                        value={brandingData.slogan} 
                        onChange={(e) => handleBrandingChange('slogan', e.target.value)} 
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Logo URL / Path</Label>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center border">
                          {brandingData.logoUrl ? (
                            <Image className="h-8 w-8 text-gray-500" /> /* Mock logo preview */
                          ) : (
                            <span className="text-xs text-gray-400">No Logo</span>
                          )}
                        </div>
                        <Input 
                          id="logoUrl" 
                          value={brandingData.logoUrl} 
                          onChange={(e) => handleBrandingChange('logoUrl', e.target.value)} 
                          className="flex-1"
                          placeholder="/placeholder.svg"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Use the Content & Images section to upload new logos.</p>
                    </div>
                    
                    <p className="text-sm text-gray-500">Note: Changes require publishing the theme to take effect across the site.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Colors Tab */}
              <TabsContent value="colors">
                <Card>
                  <CardHeader>
                    <CardTitle>Colors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ColorInput
                        id="primaryColor"
                        label="Primary Color"
                        value={primaryColor}
                        onChange={setPrimaryColor}
                      />
                      
                      <ColorInput
                        id="accentColor"
                        label="Accent Color"
                        value={accentColor}
                        onChange={setAccentColor}
                      />
                    </div>
                    
                    <p className="text-sm text-gray-500">Note: Applying these changes requires publishing the theme.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Checkout & Delivery Tab (NEW) */}
              <TabsContent value="checkout">
                <CheckoutSettingsForm />
              </TabsContent>
              
              <TabsContent value="typography">
                <Card>
                  <CardHeader><CardTitle>Typography</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Typography selection and font upload features will be implemented here.</p>
                    <Button variant="outline" className="mt-4">Upload Custom Font</Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="layout">
                <Card>
                  <CardHeader><CardTitle>Layout Presets</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Layout presets for homepage and product pages will be managed here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="assets">
                <Card>
                  <CardHeader><CardTitle>Assets & Banners</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Upload hero banners and manage promotional sliders here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;