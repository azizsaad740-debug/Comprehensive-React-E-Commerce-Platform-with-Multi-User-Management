"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, RefreshCw, FileText, X, SwitchCamera } from 'lucide-react';
import { useContentStore } from '@/stores/contentStore';
import { useToast } from '@/hooks/use-toast';
import { StaticPage } from '@/types';
import { Switch } from '@/components/ui/switch';

interface StaticPageFormProps {
  initialPage: StaticPage;
}

const StaticPageForm: React.FC<StaticPageFormProps> = ({ initialPage }) => {
  const { updateStaticPage } = useContentStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData(initialPage);
  }, [initialPage]);

  const handleChange = (field: keyof StaticPage, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      updateStaticPage(formData);
      toast({ title: "Success", description: `${formData.title} updated.` });
      setIsLoading(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Edit Page: {formData.title}</span>
        </CardTitle>
        <CardDescription>Slug: /{formData.slug}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input id="title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content (Supports basic Markdown/HTML)</Label>
            <Textarea id="content" value={formData.content} onChange={(e) => handleChange('content', e.target.value)} rows={10} required />
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Page is Active/Visible</Label>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Page Content
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StaticPageForm;