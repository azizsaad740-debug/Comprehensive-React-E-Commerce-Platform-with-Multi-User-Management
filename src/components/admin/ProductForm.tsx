"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Product, ProductCustomizationOptions, ProductActionButton } from '@/types';
import { Save, X, RefreshCw, Check, ShoppingCart, Palette, Info, MessageSquare, Brain } from 'lucide-react';
import { getAllMockFonts, getAllMockStartDesigns, getAllMockEndDesigns } from '@/utils/customizationUtils';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import AIPopupAgent from './AIPopupAgent'; // NEW IMPORT

interface ProductFormProps {
  initialProduct?: Product;
  onSubmit: (productData: Partial<Product>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const defaultCustomizationOptions: ProductCustomizationOptions = {
  fonts: [],
  startDesigns: [],
  endDesigns: [],
  maxCharacters: 50,
  allowedColors: [],
};

const defaultProductData: Partial<Product> = {
  name: '',
  sku: '',
  description: '',
  basePrice: 0,
  discountedPrice: undefined,
  category: 'Apparel',
  subcategory: '',
  stockQuantity: 0,
  printPaths: 1,
  isActive: true,
  tags: [],
  customizationOptions: defaultCustomizationOptions,
  actionButtons: ['customize', 'quick_add'], // Default
  moreInfoContent: '',
};

const actionButtonOptions: { value: ProductActionButton, label: string, icon: React.ElementType }[] = [
  { value: 'customize', label: 'Customize', icon: Palette },
  { value: 'quick_add', label: 'Quick Add to Cart', icon: ShoppingCart },
  { value: 'contact', label: 'Contact Us', icon: MessageSquare },
  { value: 'more_info', label: 'More Info Popup', icon: Info },
];

const ProductForm: React.FC<ProductFormProps> = ({ initialProduct, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState<Partial<Product>>(() => {
    const initial = initialProduct || defaultProductData;
    // Ensure customizationOptions is initialized
    if (!initial.customizationOptions) {
      initial.customizationOptions = defaultCustomizationOptions;
    }
    if (!initial.actionButtons) {
      initial.actionButtons = defaultProductData.actionButtons;
    }
    return initial;
  });
  
  const [tagsInput, setTagsInput] = useState(initialProduct?.tags?.join(', ') || '');
  const [colorsInput, setColorsInput] = useState(initialProduct?.customizationOptions?.allowedColors?.join(', ') || '');
  const [isAIPopupOpen, setIsAIPopupOpen] = useState(false); // NEW STATE
  
  const mockFonts = getAllMockFonts();
  const mockStartDesigns = getAllMockStartDesigns();
  const mockEndDesigns = getAllMockEndDesigns();

  useEffect(() => {
    const initial = initialProduct || defaultProductData;
    if (!initial.customizationOptions) {
      initial.customizationOptions = defaultCustomizationOptions;
    }
    if (!initial.actionButtons) {
      initial.actionButtons = defaultProductData.actionButtons;
    }
    setFormData(initial);
    setTagsInput(initial.tags?.join(', ') || '');
    setColorsInput(initial.customizationOptions?.allowedColors?.join(', ') || '');
  }, [initialProduct]);

  const handleChange = (field: keyof Product, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCustomizationChange = (field: keyof ProductCustomizationOptions, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      customizationOptions: {
        ...prev.customizationOptions,
        [field]: value,
      } as ProductCustomizationOptions,
    }));
  };
  
  const handleActionButtonToggle = (button: ProductActionButton, checked: boolean) => {
    setFormData(prev => {
      const currentButtons = prev.actionButtons || [];
      let newButtons: ProductActionButton[];
      
      if (checked) {
        newButtons = [...currentButtons, button];
      } else {
        newButtons = currentButtons.filter(b => b !== button);
      }
      
      return { ...prev, actionButtons: newButtons };
    });
  };

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
    const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };
  
  const handleColorsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorsInput(e.target.value);
    const colorsArray = e.target.value.split(',').map(color => color.trim()).filter(color => color.length > 0);
    handleCustomizationChange('allowedColors', colorsArray);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.basePrice || !formData.category) {
      alert('Please fill in required fields (Name, Base Price, Category).');
      return;
    }
    
    // Ensure customization options are correctly structured before submission
    const customizationOptions: ProductCustomizationOptions = {
      ...defaultCustomizationOptions,
      ...formData.customizationOptions,
      maxCharacters: Number(formData.customizationOptions?.maxCharacters || 50),
      allowedColors: formData.customizationOptions?.allowedColors || [],
      // For simplicity in this form, we only allow selecting one of each design/font type
      // We will store the selected ID/Name as a single element array for compatibility with the Product type structure.
      fonts: formData.customizationOptions?.fonts?.length ? [formData.customizationOptions.fonts[0]] : [],
      startDesigns: formData.customizationOptions?.startDesigns?.length ? [formData.customizationOptions.startDesigns[0]] : [],
      endDesigns: formData.customizationOptions?.endDesigns?.length ? [formData.customizationOptions.endDesigns[0]] : [],
    };
    
    const dataToSubmit: Partial<Product> = {
      ...formData,
      basePrice: Number(formData.basePrice),
      discountedPrice: formData.discountedPrice ? Number(formData.discountedPrice) : undefined,
      stockQuantity: Number(formData.stockQuantity),
      printPaths: Number(formData.printPaths),
      tags: formData.tags || [],
      customizationOptions: customizationOptions,
      actionButtons: formData.actionButtons || ['customize', 'quick_add'],
      moreInfoContent: formData.moreInfoContent || undefined,
    };
    
    onSubmit(dataToSubmit);
  };
  
  // Helper to get the first selected font/design ID for the single Select component
  const getFirstSelectedId = (names: string[], mockDesigns: { id: string, name: string }[]): string => {
    if (!names || names.length === 0) return 'none'; // Use 'none' as a non-empty placeholder value
    return mockDesigns.find(d => d.name === names[0])?.id || 'none';
  };
  
  // Helper to handle single selection change and store the name in the array
  const handleSingleDesignSelect = (field: 'fonts' | 'startDesigns' | 'endDesigns', selectedId: string, mockDesigns: { id: string, name: string }[]) => {
    if (selectedId === 'none') {
      handleCustomizationChange(field, []);
      return;
    }
    const selectedName = mockDesigns.find(d => d.id === selectedId)?.name;
    handleCustomizationChange(field, selectedName ? [selectedName] : []);
  };
  
  const handleGeneratedText = (text: string) => {
    handleChange('description', text);
  };

  const hasMoreInfoButton = formData.actionButtons?.includes('more_info');

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 p-4">
        {/* General Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={formData.sku || ''} onChange={(e) => handleChange('sku', e.target.value)} required />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="description">Description</Label>
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
          <Textarea id="description" value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} rows={3} required />
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="basePrice">Base Price ($)</Label>
            <Input id="basePrice" type="number" step="0.01" min="0" value={formData.basePrice || 0} onChange={(e) => handleChange('basePrice', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountedPrice">Discounted Price ($)</Label>
            <Input id="discountedPrice" type="number" step="0.01" min="0" value={formData.discountedPrice || ''} onChange={(e) => handleChange('discountedPrice', e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Initial Stock</Label>
            <Input id="stockQuantity" type="number" min="0" value={formData.stockQuantity || 0} onChange={(e) => handleChange('stockQuantity', Number(e.target.value))} required />
          </div>
        </div>
        
        {/* Categorization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={formData.category || ''} onChange={(e) => handleChange('category', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategory</Label>
            <Input id="subcategory" value={formData.subcategory || ''} onChange={(e) => handleChange('subcategory', e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" value={tagsInput} onChange={handleTagInput} placeholder="e.g., popular, new, sale" />
          </div>
        </div>
        
        {/* Action Buttons Configuration */}
        <div className="border p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Product Page Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actionButtonOptions.map(option => {
              const Icon = option.icon;
              const isChecked = formData.actionButtons?.includes(option.value);
              
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`btn-${option.value}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleActionButtonToggle(option.value, checked as boolean)}
                  />
                  <Label htmlFor={`btn-${option.value}`} className="flex items-center text-sm">
                    <Icon className="h-4 w-4 mr-1 text-gray-500" />
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </div>
          
          {hasMoreInfoButton && (
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="moreInfoContent">More Info Popup Content</Label>
              <Textarea 
                id="moreInfoContent" 
                value={formData.moreInfoContent || ''} 
                onChange={(e) => handleChange('moreInfoContent', e.target.value)} 
                rows={3} 
                placeholder="Enter detailed information for the popup (e.g., material specs, sizing details)."
              />
            </div>
          )}
        </div>
        
        {/* Customization Options */}
        <div className="border p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">Customization Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="printPaths">Number of Print Paths (Text Inputs)</Label>
              <Input id="printPaths" type="number" min="1" value={formData.printPaths || 1} onChange={(e) => handleChange('printPaths', e.target.value)} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="maxCharacters">Max Characters per Path</Label>
              <Input id="maxCharacters" type="number" min="1" value={formData.customizationOptions?.maxCharacters || 50} onChange={(e) => handleCustomizationChange('maxCharacters', Number(e.target.value))} required />
            </div>
          </div>
          
          {/* Allowed Colors */}
          <div className="space-y-2">
            <Label htmlFor="allowedColors">Allowed Colors (comma separated)</Label>
            <Input id="allowedColors" value={colorsInput} onChange={handleColorsInput} placeholder="e.g., Red, Blue, Black" />
          </div>
          
          {/* Font Selection (Single Select) */}
          <div className="space-y-2">
            <Label htmlFor="fonts">Default Font</Label>
            <Select 
              value={getFirstSelectedId(formData.customizationOptions?.fonts || [], mockFonts)}
              onValueChange={(value) => handleSingleDesignSelect('fonts', value, mockFonts)}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Choose a default font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None / Default</SelectItem>
                {mockFonts.map(font => (
                  <SelectItem key={font.id} value={font.id}>
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Start Design Selection (Single Select) */}
          <div className="space-y-2">
            <Label htmlFor="startDesigns">Default Start Design</Label>
            <Select 
              value={getFirstSelectedId(formData.customizationOptions?.startDesigns || [], mockStartDesigns)}
              onValueChange={(value) => handleSingleDesignSelect('startDesigns', value, mockStartDesigns)}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Choose a default start design" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {mockStartDesigns.map(design => (
                  <SelectItem key={design.id} value={design.id}>
                    {design.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* End Design Selection (Single Select) */}
          <div className="space-y-2">
            <Label htmlFor="endDesigns">Default End Design</Label>
            <Select 
              value={getFirstSelectedId(formData.customizationOptions?.endDesigns || [], mockEndDesigns)}
              onValueChange={(value) => handleSingleDesignSelect('endDesigns', value, mockEndDesigns)}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Choose a default end design" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {mockEndDesigns.map(design => (
                  <SelectItem key={design.id} value={design.id}>
                    {design.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={!!formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
            />
            <Label htmlFor="isActive">Product is Active/Visible</Label>
          </div>
          
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : (initialProduct ? 'Update Product' : 'Create Product')}
            </Button>
          </div>
        </div>
      </form>
      
      <AIPopupAgent
        isOpen={isAIPopupOpen}
        onClose={() => setIsAIPopupOpen(false)}
        taskType="text_generation"
        initialPrompt={`Generate a compelling, SEO-friendly product description for a ${formData.name || 'new product'} in the ${formData.category || 'general'} category.`}
        context="product description"
        onTextGenerated={handleGeneratedText}
      />
    </>
  );
};

export default ProductForm;