"use client";

import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, LayoutGrid, Type, Upload, Save, X, Tag, Image, DollarSign, Truck, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import ColorInput from '@/components/admin/ColorInput';
import { useBrandingStore } from '@/stores/brandingStore';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import CheckoutSettingsForm from '@/components/admin/CheckoutSettingsForm';
import { useNavigate } from 'react-router-dom';
import { hexToRawHsl } from '@/lib/colorUtils';
import { useUISettingsStore } from '@/stores/uiSettingsStore'; // NEW IMPORT
import { Switch } from '@/components/ui/switch'; // Ensure Switch is imported

const SettingsPage = () => {
  const { appName, slogan, logoUrl, updateBranding } = useBrandingStore();
  const { homepageSections, updateHomepageSections } = useUISettingsStore(); // NEW HOOK
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // --- State for Tab Synchronization ---
  const [activeTab, setActiveTab] = useState('branding');
  
  // Local state for color customization (using default Tailwind primary/accent colors for initialization)
  // Note: These hex values are placeholders and don't necessarily match the current HSL values in globals.css
  const [primaryColor, setPrimaryColor] = useState('#FF6B81'); // Salmon Pink approximation
  const [accentColor, setAccentColor] = useState('#FF6B81'); // Salmon Pink approximation (using primary for accent default)
  
  // Local state for branding form
  const [brandingData, setBrandingData] = useState({
    appName: appName,
    slogan: slogan,
    logoUrl: logoUrl,
  });
  
  // Local state for UI settings
  const [localHomepageSections, setLocalHomepageSections] = useState(homepageSections);

  const handleBrandingChange = (field: 'appName' | 'slogan' | 'logoUrl', value: string) => {
    setBrandingData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleUISectionToggle = (section: keyof typeof homepageSections, checked: boolean) => {
    setLocalHomepageSections(prev => ({ ...prev, [section]: checked }));
  };

  const applyColorsToCSS = (primaryHex: string, accentHex: string) => {
    const root = document.documentElement;
    
    const primaryHsl = hexToRawHsl(primaryHex);
    const accentHsl = hexToRawHsl(accentHex);

    if (primaryHsl) {
      root.style.setProperty('--primary', primaryHsl);
      root.style.setProperty('--ring', primaryHsl);
      root.style.setProperty('--accent', primaryHsl);
      root.style.setProperty('--sidebar-primary', primaryHsl);
      root.style.setProperty('--sidebar-ring', primaryHsl);
    }
    
    if (accentHsl) {
      // We can use accent for secondary/muted colors if needed, but for simplicity, 
      // we'll just set a dedicated accent variable if we had one. 
      // Since Tailwind uses primary for most accents, we'll stick to primary for now.
      // If we wanted a separate accent, we'd need to define it in tailwind.config.ts
    }
  };

  const handlePublish = () => {
    // 1. Update Branding Store
    updateBranding(brandingData);
    
    // 2. Update UI Settings Store
    updateHomepageSections(localHomepageSections);
    
    // 3. Apply Color Changes to CSS variables
    applyColorsToCSS(primaryColor, accentColor);
    
    toast({
      title: "Theme Published",
      description: "Branding, colors, and layout changes have been saved and published.",
    });
  };

  const handleDiscard = () => {
    // Reset local state to current store values
    setBrandingData({
      appName: appName,
      slogan: slogan,
      logoUrl: logoUrl,
    });
    setLocalHomepageSections(homepageSections);
    
    // Note: We don't have a persistent store for colors yet, so we reset to the default hex values.
    setPrimaryColor('#FF6B81'); 
    setAccentColor('#FF6B81');
    
    // Re-apply the default colors to the CSS variables to visually reset
    applyColorsToCSS('#FF6B81', '#FF6B81'); 
    
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
              {/* Use Tabs to manage navigation state */}
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
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
                  <TabsTrigger value="layout" className="w-full justify-start data-[state=active]:bg-accent">
                    <LayoutGrid className="h-4 w-4 mr-2" /> Page Layout
                  </TabsTrigger>
                  <TabsTrigger value="typography" className="w-full justify-start data-[state=active]:bg-accent">
                    <Type className="h-4 w-4 mr-2" /> Typography
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
            {/* Use Tabs component for content display, synchronized with activeTab state */}
            <Tabs value={activeTab}>
              
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
                        label="Accent Color (Currently maps to Primary)"
                        value={accentColor}
                        onChange={setAccentColor}
                      />
                    </div>
                    
                    <p className="text-sm text-gray-500">Note: Applying these changes requires publishing the theme.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Checkout & Delivery Tab */}
              <TabsContent value="checkout">
                <CheckoutSettingsForm />
              </TabsContent>
              
              {/* Page Layout Tab (NEW/UPDATED) */}
              <TabsContent value="layout">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Home className="h-5 w-5" />
                      <span>Homepage Section Visibility</span>
                    </CardTitle>
                    <CardDescription>Toggle visibility for predefined sections on the main homepage.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label htmlFor="featuresSection">Features Section ("Why Choose Us?")</Label>
                      <Switch
                        id="featuresSection"
                        checked={localHomepageSections.featuresSection}
                        onCheckedChange={(checked) => handleUISectionToggle('featuresSection', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label htmlFor="featuredProductsSection">Featured Products Section</Label>
                      <Switch
                        id="featuredProductsSection"
                        checked={localHomepageSections.featuredProductsSection}
                        onCheckedChange={(checked) => handleUISectionToggle('featuredProductsSection', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label htmlFor="categoriesPreviewSection">Categories Preview Section</Label>
                      <Switch
                        id="categoriesPreviewSection"
                        checked={localHomepageSections.categoriesPreviewSection}
                        onCheckedChange={(checked) => handleUISectionToggle('categoriesPreviewSection', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label htmlFor="ctaSection">Call to Action (CTA) Section</Label>
                      <Switch
                        id="ctaSection"
                        checked={localHomepageSections.ctaSection}
                        onCheckedChange={(checked) => handleUISectionToggle('ctaSection', checked)}
                      />
                    </div>
                    
                    <p className="text-sm text-gray-500 pt-4">Note: Changes require publishing the theme to take effect.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Typography Tab (Placeholder) */}
              <TabsContent value="typography">
                <Card>
                  <CardHeader><CardTitle>Typography</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Manage global font settings and link to customization fonts.</p>
                    <Button variant="outline" onClick={() => navigate('/admin/customization')}>
                      <Type className="h-4 w-4 mr-2" /> Manage Customization Fonts
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Assets & Banners Tab (Link to dedicated page) */}
              <TabsContent value="assets">
                <Card>
                  <CardHeader><CardTitle>Assets & Banners</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Manage visual assets and the homepage hero slider on the dedicated Content Management page.</p>
                    <Button onClick={() => navigate('/admin/content')}>
                      <Image className="h-4 w-4 mr-2" /> Go to Content Management
                    </Button>
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