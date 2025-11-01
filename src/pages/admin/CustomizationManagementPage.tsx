"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Type, LayoutGrid, PlusCircle, Trash2, Edit, Save, RefreshCw, ArrowLeft, Palette } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CustomFont, CustomDesign } from '@/types';
import { 
  getAllMockFonts, 
  addMockFont, 
  updateMockFont, 
  deleteMockFont,
  getAllMockStartDesigns,
  getAllMockEndDesigns,
  addMockDesign,
  updateMockDesign,
  deleteMockDesign
} from '@/utils/customizationUtils';
import { useNavigate } from 'react-router-dom';

// --- Font Management Component ---

interface FontFormProps {
  initialFont?: CustomFont;
  onSave: () => void;
  onCancel: () => void;
}

const FontForm: React.FC<FontFormProps> = ({ initialFont, onSave, onCancel }) => {
  const [name, setName] = useState(initialFont?.name || '');
  const [file, setFile] = useState(initialFont?.file || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !file) return;

    setIsLoading(true);
    setTimeout(() => {
      let result;
      if (initialFont) {
        result = updateMockFont({ ...initialFont, name, file });
      } else {
        result = addMockFont({ name, file });
      }

      if (result) {
        toast({ title: "Success", description: `Font ${name} saved.` });
        onSave();
      } else {
        toast({ title: "Error", description: "Failed to save font.", variant: "destructive" });
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-3 bg-gray-50">
      <h4 className="font-semibold">{initialFont ? 'Edit Font' : 'Add New Font'}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fontName">Name</Label>
          <Input id="fontName" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fontFile">File Path (e.g., roboto.ttf)</Label>
          <Input id="fontFile" value={file} onChange={(e) => setFile(e.target.value)} required />
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Font
        </Button>
      </div>
    </form>
  );
};

const FontManagement: React.FC<{ onRefresh: () => void, fonts: CustomFont[] }> = ({ onRefresh, fonts }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFont, setEditingFont] = useState<CustomFont | undefined>(undefined);
  const { toast } = useToast();

  const handleNew = () => {
    setEditingFont(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (font: CustomFont) => {
    setEditingFont(font);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete font: ${name}?`)) {
      if (deleteMockFont(id)) {
        onRefresh();
        toast({ title: "Deleted", description: `Font ${name} deleted.` });
      } else {
        toast({ title: "Error", description: "Failed to delete font.", variant: "destructive" });
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Type className="h-5 w-5" />
          <span>Available Fonts ({fonts.length})</span>
        </CardTitle>
        <Button onClick={handleNew}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Font
        </Button>
      </CardHeader>
      <CardContent>
        {isFormOpen && (
          <div className="mb-6">
            <FontForm 
              initialFont={editingFont} 
              onSave={() => { onRefresh(); setIsFormOpen(false); setEditingFont(undefined); }} 
              onCancel={() => setIsFormOpen(false)} 
            />
          </div>
        )}
        
        <div className="space-y-3">
          {fonts.map(font => (
            <div key={font.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-8 bg-gray-100 rounded flex items-center justify-center border text-sm font-medium" style={{ fontFamily: font.name }}>
                  AaBb
                </div>
                <div>
                  <h4 className="font-medium">{font.name}</h4>
                  <p className="text-xs text-gray-500">{font.file}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(font)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(font.id, font.name)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// --- Design Management Component ---

interface DesignFormProps {
  initialDesign?: CustomDesign;
  designType: 'start' | 'end';
  onSave: () => void;
  onCancel: () => void;
}

const DesignForm: React.FC<DesignFormProps> = ({ initialDesign, designType, onSave, onCancel }) => {
  const [name, setName] = useState(initialDesign?.name || '');
  const [imageUrl, setImageUrl] = useState(initialDesign?.imageUrl || '');
  const [category, setCategory] = useState(initialDesign?.category || 'Icons');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !imageUrl) return;

    setIsLoading(true);
    setTimeout(() => {
      let result;
      const designData = { name, imageUrl, category };
      
      if (initialDesign) {
        result = updateMockDesign(designType, { ...initialDesign, ...designData });
      } else {
        result = addMockDesign(designType, designData);
      }

      if (result) {
        toast({ title: "Success", description: `Design ${name} saved.` });
        onSave();
      } else {
        toast({ title: "Error", description: "Failed to save design.", variant: "destructive" });
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-3 bg-gray-50">
      <h4 className="font-semibold">{initialDesign ? 'Edit Design' : 'Add New Design'} ({designType.toUpperCase()})</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="designName">Name</Label>
          <Input id="designName" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="designCategory">Category</Label>
          <Input id="designCategory" value={category} onChange={(e) => setCategory(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="designImageUrl">Image URL / Path</Label>
          <Input id="designImageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Design
        </Button>
      </div>
    </form>
  );
};

const DesignManagement: React.FC<{ onRefresh: () => void, startDesigns: CustomDesign[], endDesigns: CustomDesign[] }> = ({ onRefresh, startDesigns, endDesigns }) => {
  const [activeTab, setActiveTab] = useState<'start' | 'end'>('start');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<CustomDesign | undefined>(undefined);
  const { toast } = useToast();

  const designs = activeTab === 'start' ? startDesigns : endDesigns;

  const handleNew = () => {
    setEditingDesign(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (design: CustomDesign) => {
    setEditingDesign(design);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete design: ${name}?`)) {
      if (deleteMockDesign(activeTab, id)) {
        onRefresh();
        toast({ title: "Deleted", description: `Design ${name} deleted.` });
      } else {
        toast({ title: "Error", description: "Failed to delete design.", variant: "destructive" });
      }
    }
  };
  
  const handleSave = () => {
    onRefresh(); 
    setIsFormOpen(false); 
    setEditingDesign(undefined);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <LayoutGrid className="h-5 w-5" />
          <span>Custom Design Elements</span>
        </CardTitle>
        <CardDescription>Manage designs available for the start and end of customization paths.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val as 'start' | 'end'); setIsFormOpen(false); }}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="start">Start Designs ({startDesigns.length})</TabsTrigger>
              <TabsTrigger value="end">End Designs ({endDesigns.length})</TabsTrigger>
            </TabsList>
            <Button onClick={handleNew}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New {activeTab === 'start' ? 'Start' : 'End'} Design
            </Button>
          </div>
          
          {isFormOpen && (
            <div className="mb-6">
              <DesignForm 
                initialDesign={editingDesign} 
                designType={activeTab}
                onSave={handleSave} 
                onCancel={() => setIsFormOpen(false)} 
              />
            </div>
          )}

          <TabsContent value="start" className="mt-0">
            <div className="space-y-3">
              {designs.map(design => (
                <div key={design.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img src={design.imageUrl} alt={design.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium">{design.name}</h4>
                      <p className="text-xs text-gray-500">{design.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(design)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(design.id, design.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="end" className="mt-0">
            <div className="space-y-3">
              {designs.map(design => (
                <div key={design.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img src={design.imageUrl} alt={design.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium">{design.name}</h4>
                      <p className="text-xs text-gray-500">{design.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(design)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(design.id, design.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};


const CustomizationManagementPage = () => {
  const [fonts, setFonts] = useState(getAllMockFonts());
  const [startDesigns, setStartDesigns] = useState(getAllMockStartDesigns());
  const [endDesigns, setEndDesigns] = useState(getAllMockEndDesigns());

  const refreshData = () => {
    setFonts(getAllMockFonts());
    setStartDesigns(getAllMockStartDesigns());
    setEndDesigns(getAllMockEndDesigns());
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Palette className="h-6 w-6 mr-3" />
            Customization Management
          </h1>
        </div>
        <p className="text-gray-600 mb-8">Configure fonts and design elements available in the product customization editor.</p>

        <div className="space-y-8">
          <FontManagement onRefresh={refreshData} fonts={fonts} />
          <DesignManagement onRefresh={refreshData} startDesigns={startDesigns} endDesigns={endDesigns} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default CustomizationManagementPage;