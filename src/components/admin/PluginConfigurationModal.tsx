"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Settings, Save, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PluginConfigurationModalProps {
  pluginName: string;
  initialConfig: Record<string, any>;
  initialCss?: string;
  initialJs?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: { config: Record<string, any>, customCss?: string, customJs?: string }) => void;
}

const PluginConfigurationModal: React.FC<PluginConfigurationModalProps> = ({
  pluginName,
  initialConfig,
  initialCss,
  initialJs,
  isOpen,
  onClose,
  onSave,
}) => {
  const [configString, setConfigString] = useState('');
  const [customCss, setCustomCss] = useState(initialCss || '');
  const [customJs, setCustomJs] = useState(initialJs || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      // Pretty print the JSON config for editing
      setConfigString(JSON.stringify(initialConfig, null, 2));
    } catch (e) {
      setConfigString('{}');
    }
    setCustomCss(initialCss || '');
    setCustomJs(initialJs || '');
  }, [initialConfig, initialCss, initialJs, isOpen]);

  const handleSave = () => {
    setIsLoading(true);
    try {
      const newConfig = JSON.parse(configString);
      
      // Simulate API call delay
      setTimeout(() => {
        onSave({ 
          config: newConfig, 
          customCss: customCss.trim() || undefined, 
          customJs: customJs.trim() || undefined 
        });
        toast({
          title: "Configuration Saved",
          description: `${pluginName} settings updated successfully.`,
        });
        setIsLoading(false);
        onClose();
      }, 500);

    } catch (e) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Invalid JSON format in configuration.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configure: {pluginName}</span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">JSON Config</TabsTrigger>
            <TabsTrigger value="css">Custom CSS</TabsTrigger>
            <TabsTrigger value="js">Custom JS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="mt-4">
            <div className="space-y-4">
              <Label htmlFor="pluginConfig">Configuration (JSON)</Label>
              <Textarea
                id="pluginConfig"
                value={configString}
                onChange={(e) => setConfigString(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">Edit the plugin settings in JSON format. Be careful with syntax!</p>
            </div>
          </TabsContent>
          
          <TabsContent value="css" className="mt-4">
            <div className="space-y-4">
              <Label htmlFor="customCss">Custom CSS (Scoped to Plugin/Page)</Label>
              <Textarea
                id="customCss"
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                rows={15}
                className="font-mono text-sm"
                placeholder=".my-custom-element { color: red; }"
              />
              <p className="text-xs text-gray-500">This CSS will be injected into the relevant page/section defined by the plugin configuration.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="js" className="mt-4">
            <div className="space-y-4">
              <Label htmlFor="customJs">Custom JavaScript (Scoped to Plugin/Page)</Label>
              <Textarea
                id="customJs"
                value={customJs}
                onChange={(e) => setCustomJs(e.target.value)}
                rows={15}
                className="font-mono text-sm"
                placeholder="console.log('Hello World');"
              />
              <p className="text-xs text-gray-500">This JS will be executed on the relevant page/section defined by the plugin configuration.</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PluginConfigurationModal;