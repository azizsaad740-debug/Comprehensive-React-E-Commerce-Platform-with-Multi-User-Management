"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, RefreshCw, Database, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseConfigStore } from '@/stores/supabaseConfigStore';

const SupabaseConfigForm: React.FC = () => {
  const { supabaseUrl, supabaseAnonKey, isConfigured, updateConfig } = useSupabaseConfigStore();
  const { toast } = useToast();
  
  const [localUrl, setLocalUrl] = useState(supabaseUrl);
  const [localAnonKey, setLocalAnonKey] = useState(supabaseAnonKey);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLocalUrl(supabaseUrl);
    setLocalAnonKey(supabaseAnonKey);
  }, [supabaseUrl, supabaseAnonKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      updateConfig(localUrl.trim(), localAnonKey.trim());
      
      // Note: In a real app, we would test the connection here.
      
      toast({ 
        title: "Supabase Config Saved", 
        description: "Connection details updated. Restarting the app may be required for full effect.",
      });
      setIsLoading(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Supabase Integration Settings</span>
        </CardTitle>
        <CardDescription>Configure your self-hosted or native Supabase project connection details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supabaseUrl">Supabase URL</Label>
            <Input 
              id="supabaseUrl" 
              value={localUrl} 
              onChange={(e) => setLocalUrl(e.target.value)} 
              required 
              placeholder="https://your-project-id.supabase.co"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supabaseAnonKey">Supabase Anon Key (Public Publishable Key)</Label>
            <Input 
              id="supabaseAnonKey" 
              value={localAnonKey} 
              onChange={(e) => setLocalAnonKey(e.target.value)} 
              required 
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiI..."
            />
          </div>
          
          {!isConfigured && (
            <div className="flex items-center space-x-2 text-red-500 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Configuration is missing or incomplete. Authentication will fail.</span>
            </div>
          )}
          
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isLoading || !localUrl || !localAnonKey}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Configuration
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SupabaseConfigForm;