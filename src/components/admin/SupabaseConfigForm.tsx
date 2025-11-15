"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, RefreshCw, Database, AlertTriangle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseConfigStore } from '@/stores/supabaseConfigStore';

const SUPABASE_PROJECT_ID = 'wnlveqfnbaempwvymfak';
const SUPABASE_SETTINGS_URL = `https://app.supabase.com/project/${SUPABASE_PROJECT_ID}/settings/api`;

const SupabaseConfigForm: React.FC = () => {
  const { supabaseUrl, supabaseAnonKey, isConfigured, updateConfig } = useSupabaseConfigStore();
  const { toast } = useToast();
  
  const [localUrl, setLocalUrl] = useState(supabaseUrl);
  const [localAnonKey, setLocalAnonKey] = useState(supabaseAnonKey);
  const [isLoading, setIsLoading] = useState(false);
  const [configChanged, setConfigChanged] = useState(false); // Track if changes were made

  useEffect(() => {
    setLocalUrl(supabaseUrl);
    setLocalAnonKey(supabaseAnonKey);
  }, [supabaseUrl, supabaseAnonKey]);
  
  useEffect(() => {
    const changed = localUrl !== supabaseUrl || localAnonKey !== supabaseAnonKey;
    setConfigChanged(changed);
  }, [localUrl, localAnonKey, supabaseUrl, supabaseAnonKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      updateConfig(localUrl.trim(), localAnonKey.trim());
      
      toast({ 
        title: "Supabase Config Saved", 
        description: "Configuration updated. Please refresh the page to re-establish the connection and log in again.",
      });
      setIsLoading(false);
      
      // Prompt user to refresh
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
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
        <div className="mb-4">
          <a href={SUPABASE_SETTINGS_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Supabase Project Settings
            </Button>
          </a>
          <p className="text-xs text-gray-500 mt-2">Use this link to easily find your Project URL and Anon Key.</p>
        </div>
        
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
            <Button type="submit" disabled={isLoading || !localUrl || !localAnonKey || !configChanged}>
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