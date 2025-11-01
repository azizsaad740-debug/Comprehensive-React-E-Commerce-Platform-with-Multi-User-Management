"use client";

import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plug, Upload, Settings, Zap, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Plugin {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'error';
  description: string;
  isBuiltIn: boolean;
}

const mockPlugins: Plugin[] = [
  { id: 'p1', name: 'Stripe Payments', version: '1.2.0', status: 'active', description: 'Enables secure credit card payments via Stripe.', isBuiltIn: true },
  { id: 'p2', name: 'WhatsApp Notifications', version: '2.1.1', status: 'inactive', description: 'Send order updates and alerts via WhatsApp (Requires Twilio).', isBuiltIn: true },
  { id: 'p3', name: 'Google Analytics', version: '1.0.0', status: 'active', description: 'Integrate Google Analytics for traffic tracking.', isBuiltIn: true },
  { id: 'p4', name: 'Custom Shipping Rates', version: '3.0.5', status: 'error', description: 'Define complex shipping rules based on weight and location.', isBuiltIn: false },
];

const PluginManagementPage = () => {
  const [plugins, setPlugins] = useState(mockPlugins);
  const [isUploading, setIsUploading] = useState(false);

  const togglePluginStatus = (id: string) => {
    setPlugins(prev => prev.map(p => 
      p.id === id 
        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } 
        : p
    ));
  };

  const handleUpload = () => {
    setIsUploading(true);
    // Simulate upload and installation delay
    setTimeout(() => {
      setIsUploading(false);
      alert('Plugin upload simulated. Installation successful!');
    }, 1500);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Plug className="h-6 w-6 mr-3" />
            Plugin & Integration Management
          </h1>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isUploading ? 'Uploading...' : 'Upload Plugin Bundle'}
          </Button>
        </div>
        <p className="text-gray-600 mb-8">Manage installed plugins and integrations to extend functionality.</p>

        <Card>
          <CardHeader>
            <CardTitle>Installed Plugins ({plugins.length})</CardTitle>
            <CardDescription>Activate, deactivate, and configure your system integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {plugins.map(plugin => (
              <div key={plugin.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Plug className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">{plugin.name} <Badge variant="outline" className="ml-2 text-xs">{plugin.version}</Badge></h3>
                    <p className="text-sm text-gray-500">{plugin.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={plugin.status === 'active' ? 'default' : plugin.status === 'error' ? 'destructive' : 'secondary'}
                    className="capitalize"
                  >
                    {plugin.status}
                  </Badge>
                  
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  
                  <Button 
                    variant={plugin.status === 'active' ? 'destructive' : 'default'} 
                    size="sm"
                    onClick={() => togglePluginStatus(plugin.id)}
                  >
                    {plugin.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center pt-4">
              <p className="text-sm text-gray-500">Need more features? Check the Plugin Marketplace (Mock link).</p>
              <Button variant="link" className="p-0">
                <Zap className="h-4 w-4 mr-1" />
                Browse Marketplace
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PluginManagementPage;