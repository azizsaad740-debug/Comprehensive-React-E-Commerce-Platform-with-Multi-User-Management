"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, RefreshCw, FileText, X, SwitchCamera, Brain } from 'lucide-react';
import { useContentStore } from '@/stores/contentStore';
import { useToast } from '@/hooks/use-toast';
import { StaticPage } from '@/types';
import { Switch } from '@/components/ui/switch';
import AIPopupAgent from './AIPopupAgent'; // NEW IMPORT

interface StaticPageFormProps {
  initialPage: StaticPage;
}

const StaticPageForm: React.FC<StaticPageFormProps> = ({ initialPage }) => {
  const { updateStaticPage } = useContentStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIPopupOpen, setIsAIPopupOpen] = useState(false); // NEW STATE

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
  
  const handleGeneratedText = (text: string) => {
    handleChange('content', text);
  };

  return (
    <>
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
              <div className="flex justify-between items-center">
                <Label htmlFor="content">Content (Supports basic Markdown/HTML)</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAIPopupOpen(true)}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
              </div>
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
      
      <AIPopupAgent
        isOpen={isAIPopupOpen}
        onClose={() => setIsAIPopupOpen(false)}
        taskType="text_generation"
        initialPrompt={`Generate HTML content for the static page titled "${formData.title}". Include sections for introduction, key points, and a conclusion.`}
        context="static page content (HTML/Markdown)"
        onTextGenerated={handleGeneratedText}
      />
    </>
  );
};

export default StaticPageForm;