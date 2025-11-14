"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RefreshCw, Image, X } from 'lucide-react';
import { useBrandingStore } from '@/stores/brandingStore';
import { useToast } from '@/hooks/use-toast';

interface FaviconManagerProps {
  onSave: (url: string) => void;
  isSaving: boolean;
}

const FaviconManager: React.FC<FaviconManagerProps> = ({ onSave, isSaving }) => {
  const { faviconUrl } = useBrandingStore();
  const [localUrl, setLocalUrl] = useState(faviconUrl);
  const { toast } = useToast();

  useEffect(() => {
    setLocalUrl(faviconUrl);
  }, [faviconUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localUrl);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Image className="h-5 w-5" />
          <span>Favicon Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="faviconUrl">Favicon URL / Path (e.g., /favicon.ico)</Label>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border flex-shrink-0">
                {localUrl ? (
                  <img src={localUrl} alt="Favicon Preview" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-400">Fallback</span>
                )}
              </div>
              <Input 
                id="faviconUrl" 
                value={localUrl} 
                onChange={(e) => setLocalUrl(e.target.value)} 
                className="flex-1"
                placeholder="Leave blank for fallback (App Name's first letter)"
              />
            </div>
            <p className="text-xs text-gray-500">Note: Changes require publishing the theme to take effect.</p>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Favicon URL'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FaviconManager;