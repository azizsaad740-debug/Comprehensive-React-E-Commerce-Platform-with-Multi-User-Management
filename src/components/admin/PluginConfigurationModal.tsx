"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Settings, Save, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PluginConfigurationModalProps {
  pluginName: string;
  initialConfig: Record<string, any>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: Record<string, any>) => void;
}

const PluginConfigurationModal: React.FC<PluginConfigurationModalProps> = ({
  pluginName,
  initialConfig,
  isOpen,
  onClose,
  onSave,
}) => {
  const [configString, setConfigString] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      // Pretty print the JSON config for editing
      setConfigString(JSON.stringify(initialConfig, null, 2));
    } catch (e) {
      setConfigString('{}');
    }
  }, [initialConfig, isOpen]);

  const handleSave = () => {
    setIsLoading(true);
    try {
      const newConfig = JSON.parse(configString);
      
      // Simulate API call delay
      setTimeout(() => {
        onSave(newConfig);
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configure: {pluginName}</span>
          </DialogTitle>
        </DialogHeader>
        
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