"use client";

import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, LayoutGrid, Type, Upload, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const ThemeEditorPage = () => {
  const [themeName, setThemeName] = useState('CustomPrint Default');
  const [primaryColor, setPrimaryColor] = useState('#2563EB');
  const [accentColor, setAccentColor] = useState('#F59E0B');

  const handlePublish = () => {
    alert('Theme changes published! (Mock action)');
  };

  const handleDiscard = () => {
    setThemeName('CustomPrint Default');
    setPrimaryColor('#2563EB');
    setAccentColor('#F59E0B');
    alert('Changes discarded.');
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Palette className="h-6 w-6 mr-3" />
            Theme Editor
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
        <p className="text-gray-600 mb-8">Customize the look and feel of your storefront.</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Theme Settings Navigation */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="colors" orientation="vertical">
                <TabsList className="flex flex-col h-auto p-0 bg-transparent space-y-1">
                  <TabsTrigger value="colors" className="w-full justify-start data-[state=active]:bg-accent">
                    <Palette className="h-4 w-4 mr-2" /> Colors & Branding
                  </TabsTrigger>
                  <TabsTrigger value="typography" className="w-full justify-start data-[state=active]:bg-accent">
                    <Type className="h-4 w-4 mr-2" /> Typography
                  </TabsTrigger>
                  <TabsTrigger value="layout" className="w-full justify-start data-[state=active]:bg-accent">
                    <LayoutGrid className="h-4 w-4 mr-2" /> Layout Presets
                  </TabsTrigger>
                  <TabsTrigger value="assets" className="w-full justify-start data-[state=active]:bg-accent">
                    <Upload className="h-4 w-4 mr-2" /> Assets & Banners
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Theme Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="colors">
              <TabsContent value="colors">
                <Card>
                  <CardHeader>
                    <CardTitle>Colors & Branding</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="themeName">Theme Name</Label>
                      <Input 
                        id="themeName" 
                        value={themeName} 
                        onChange={(e) => setThemeName(e.target.value)} 
                      />
                    </div>
                    
                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input 
                            id="primaryColor" 
                            type="color" 
                            value={primaryColor} 
                            onChange={(e) => setPrimaryColor(e.target.value)} 
                            className="w-12 h-12 p-0 cursor-pointer"
                          />
                          <Input 
                            type="text" 
                            value={primaryColor} 
                            onChange={(e) => setPrimaryColor(e.target.value)} 
                            className="flex-1 font-mono"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="accentColor">Accent Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input 
                            id="accentColor" 
                            type="color" 
                            value={accentColor} 
                            onChange={(e) => setAccentColor(e.target.value)} 
                            className="w-12 h-12 p-0 cursor-pointer"
                          />
                          <Input 
                            type="text" 
                            value={accentColor} 
                            onChange={(e) => setAccentColor(e.target.value)} 
                            className="flex-1 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500">Note: Applying these changes requires publishing the theme.</p>
                  </CardContent>
                </Card>
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

export default ThemeEditorPage;