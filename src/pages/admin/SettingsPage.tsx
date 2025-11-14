"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, LayoutGrid, Type, Upload, Save, X, Tag, Image, DollarSign, Truck, Home, Link, Plug, Database, FileText, QrCode, Clock, Phone } from 'lucide-react';
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
import { useUISettingsStore, HeaderVisibilitySettings } from '@/stores/uiSettingsStore';
import { Switch } from '@/components/ui/switch';
import { useThemeStore } from '@/stores/themeStore';
import { POSBillSettings } from '@/types';
import FaviconManager from '@/components/admin/FaviconManager'; // NEW IMPORT

// --- POS Bill Settings Form Component ---
const POSBillSettingsForm: React.FC = () => {
  const { posBillSettings, updatePOSBillSettings } = useThemeStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState(posBillSettings);

  useEffect(() => {
    setFormData(posBillSettings);
  }, [posBillSettings]);

  const handleChange = (field: keyof POSBillSettings, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updatePOSBillSettings(formData);
    toast({ title: "Settings Saved", description: "POS Bill customization updated." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>POS Bill Customization</span>
        </CardTitle>
        <CardDescription>Design the header and footer of printed POS receipts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Header Settings */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h4 className="font-semibold">Header Content</h4>
          <div className="space-y-2">
            <Label htmlFor="headerTitle">Title (Brand Name)</Label>
            <Input id="headerTitle" value={formData.headerTitle} onChange={(e) => handleChange('headerTitle', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="headerTagline">Tagline</Label>
            <Input id="headerTagline" value={formData.headerTagline} onChange={(e) => handleChange('headerTagline', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="headerLogoUrl">Logo URL / Path (Small)</Label>
            <Input id="headerLogoUrl" value={formData.headerLogoUrl} onChange={(e) => handleChange('headerLogoUrl', e.target.value)} />
          </div>
        </div>
        
        {/* Footer Settings */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h4 className="font-semibold">Footer Content</h4>
          <div className="space-y-2">
            <Label htmlFor="footerMessage">Thank You / Instructions Note</Label>
            <Textarea id="footerMessage" value={formData.footerMessage} onChange={(e) => handleChange('footerMessage', e.target.value)} rows={3} />
          </div>
        </div>
        
        {/* Visibility Toggles */}
        <div className="space-y-4 border p-4 rounded-lg">
          <h4 className="font-semibold">Visibility Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <Label htmlFor="showQrCode" className="flex items-center space-x-2"><QrCode className="h-4 w-4" /> <span>Show Order QR Code</span></Label>
              <Switch
                id="showQrCode"
                checked={formData.showQrCode}
                onCheckedChange={(checked) => handleChange('showQrCode', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <Label htmlFor="showContactInfo" className="flex items-center space-x-2"><Phone className="h-4 w-4" /> <span>Show Contact Info</span></Label>
              <Switch
                id="showContactInfo"
                checked={formData.showContactInfo}
                onCheckedChange={(checked) => handleChange('showContactInfo', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <Label htmlFor="showDateTime" className="flex items-center space-x-2"><Clock className="h-4 w-4" /> <span>Show Date & Time</span></Label>
              <Switch
                id="showDateTime"
                checked={formData.showDateTime}
                onCheckedChange={(checked) => handleChange('showDateTime', checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Bill Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};


const SettingsPage = () => {
  const { appName, slogan, logoUrl, faviconUrl, updateBranding } = useBrandingStore();
  const { homepageSections, headerVisibility, updateHomepageSections, updateHeaderVisibility } = useUISettingsStore();
  const { primaryColorHex, updateThemeColors } = useThemeStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // --- State for Tab Synchronization ---
  const [activeTab, setActiveTab] = useState('branding');
  
  // Local state for color customization (initialized from store)
  const [primaryColor, setPrimaryColor] = useState(primaryColorHex); 
  const [accentColor, setAccentColor] = useState(primaryColorHex); // Accent defaults to primary
  
  // Local state for branding form
  const [brandingData, setBrandingData] = useState({
    appName: appName,
    slogan: slogan,
    logoUrl: logoUrl,
    faviconUrl: faviconUrl, // NEW
  });
  
  // Local state for UI settings
  const [localHomepageSections, setLocalHomepageSections] = useState(homepageSections);
  const [localHeaderVisibility, setLocalHeaderVisibility] = useState(headerVisibility);
  
  const [isSavingFavicon, setIsSavingFavicon] = useState(false);

  // Sync local color state when store changes (e.g., on initial load or external change)
  useEffect(() => {
    setPrimaryColor(primaryColorHex);
    setAccentColor(primaryColorHex);
  }, [primaryColorHex]);
  
  // Sync local branding state when store changes
  useEffect(() => {
    setBrandingData({
      appName: appName,
      slogan: slogan,
      logoUrl: logoUrl,
      faviconUrl: faviconUrl,
    });
  }, [appName, slogan, logoUrl, faviconUrl]);

  const handleBrandingChange = (field: 'appName' | 'slogan' | 'logoUrl' | 'faviconUrl', value: string) => {
    setBrandingData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveFavicon = (url: string) => {
    setIsSavingFavicon(true);
    setTimeout(() => {
      handleBrandingChange('faviconUrl', url);
      toast({ title: "Favicon URL Saved", description: "Remember to Publish Theme to apply changes." });
      setIsSavingFavicon(false);
    }, 500);
  };
  
  const handleUISectionToggle = (section: keyof typeof homepageSections, checked: boolean) => {
    setLocalHomepageSections(prev => ({ ...prev, [section]: checked }));
  };
  
  const handleHeaderVisibilityToggle = (field: keyof HeaderVisibilitySettings, checked: boolean) => {
    setLocalHeaderVisibility(prev => ({ ...prev, [field]: checked }));
  };

  const handlePublish = () => {
    // 1. Update Branding Store
    updateBranding(brandingData);
    
    // 2. Update UI Settings Store
    updateHomepageSections(localHomepageSections);
    updateHeaderVisibility(localHeaderVisibility);
    
    // 3. Update Theme Store (Colors)
    const primaryHsl = hexToRawHsl(primaryColor);
    if (primaryHsl) {
        updateThemeColors(primaryColor, primaryHsl);
    }
    
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
      faviconUrl: faviconUrl,
    });
    setLocalHomepageSections(homepageSections);
    setLocalHeaderVisibility(headerVisibility);
    
    // Reset local color state to persisted store values
    setPrimaryColor(primaryColorHex); 
    setAccentColor(primaryColorHex);
    
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
                  <TabsTrigger value="pos-bill" className="w-full justify-start data-[state=active]:bg-accent">
                    <FileText className="h-4 w-4 mr-2" /> POS Bill
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
                  <TabsTrigger value="plugins" className="w-full justify-start data-[state=active]:bg-accent">
                    <Plug className="h-4 w-4 mr-2" /> Plugins
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
                    
                    <Separator />
                    
                    <FaviconManager onSave={handleSaveFavicon} isSaving={isSavingFavicon} />
                    
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
              
              {/* POS Bill Tab (NEW) */}
              <TabsContent value="pos-bill">
                <POSBillSettingsForm />
              </TabsContent>
              
              {/* Page Layout Tab */}
              <TabsContent value="layout">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Home className="h-5 w-5" />
                      <span>Page Section Visibility</span>
                    </CardTitle>
                    <CardDescription>Control which sections and navigation elements are visible to customers.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Header Visibility Controls */}
                    <div className="space-y-4 border p-4 rounded-lg">
                      <h4 className="font-semibold flex items-center text-lg">
                        <Link className="h-5 w-5 mr-2" /> Header Navigation
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-2 border rounded-lg">
                          <Label htmlFor="showProductsLink">Products Link</Label>
                          <Switch
                            id="showProductsLink"
                            checked={localHeaderVisibility.showProductsLink}
                            onCheckedChange={(checked) => handleHeaderVisibilityToggle('showProductsLink', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded-lg">
                          <Label htmlFor="showCategoriesLink">Categories Link</Label>
                          <Switch
                            id="showCategoriesLink"
                            checked={localHeaderVisibility.showCategoriesLink}
                            onCheckedChange={(checked) => handleHeaderVisibilityToggle('showCategoriesLink', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded-lg">
                          <Label htmlFor="showAboutLink">About Link</Label>
                          <Switch
                            id="showAboutLink"
                            checked={localHeaderVisibility.showAboutLink}
                            onCheckedChange={(checked) => handleHeaderVisibilityToggle('showAboutLink', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded-lg">
                          <Label htmlFor="showContactLink">Contact Link</Label>
                          <Switch
                            id="showContactLink"
                            checked={localHeaderVisibility.showContactLink}
                            onCheckedChange={(checked) => handleHeaderVisibilityToggle('showContactLink', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded-lg md:col-span-2">
                          <Label htmlFor="showSearchIcon">Search Icon (Mobile/Desktop)</Label>
                          <Switch
                            id="showSearchIcon"
                            checked={localHeaderVisibility.showSearchIcon}
                            onCheckedChange={(checked) => handleHeaderVisibilityToggle('showSearchIcon', checked)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Homepage Visibility Controls */}
                    <div className="space-y-4 border p-4 rounded-lg">
                      <h4 className="font-semibold flex items-center text-lg">
                        <Home className="h-5 w-5 mr-2" /> Homepage Sections
                      </h4>
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
              
              {/* Plugins Tab */}
              <TabsContent value="plugins">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plug className="h-5 w-5" />
                      <span>Plugin Management</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Manage API keys and settings for third-party services like payment gateways and analytics.</p>
                    <Button onClick={() => navigate('/admin/plugins')}>
                      <Plug className="h-4 w-4 mr-2" /> Go to Plugin Management
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