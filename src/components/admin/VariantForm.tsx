"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductVariant } from '@/types';
import { Save, X, PlusCircle, Trash2 } from 'lucide-react';

interface VariantFormProps {
  initialVariant?: ProductVariant;
  productId: string;
  onSubmit: (variantData: Partial<ProductVariant>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const defaultVariant: Partial<ProductVariant> = {
  name: '',
  price: 0,
  stockQuantity: 0,
  attributes: {},
};

const VariantForm: React.FC<VariantFormProps> = ({ initialVariant, productId, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState<Partial<ProductVariant>>(initialVariant || defaultVariant);
  const [attributes, setAttributes] = useState<Record<string, string>>(initialVariant?.attributes || {});
  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');

  useEffect(() => {
    setFormData(initialVariant || defaultVariant);
    setAttributes(initialVariant?.attributes || {});
  }, [initialVariant]);

  const handleChange = (field: keyof ProductVariant, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAttribute = () => {
    if (newAttributeKey.trim() && newAttributeValue.trim()) {
      setAttributes(prev => ({
        ...prev,
        [newAttributeKey.trim()]: newAttributeValue.trim(),
      }));
      setNewAttributeKey('');
      setNewAttributeValue('');
    }
  };

  const handleRemoveAttribute = (key: string) => {
    setAttributes(prev => {
      const newAttributes = { ...prev };
      delete newAttributes[key];
      return newAttributes;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || formData.stockQuantity === undefined) {
      alert('Please fill in all required fields (Name, Price, Stock).');
      return;
    }
    
    const dataToSubmit: Partial<ProductVariant> = {
      ...formData,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      attributes,
    };
    
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Variant Name</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price || 0}
            onChange={(e) => handleChange('price', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Stock Quantity */}
      <div className="space-y-2">
        <Label htmlFor="stockQuantity">Stock Quantity</Label>
        <Input
          id="stockQuantity"
          type="number"
          min="0"
          value={formData.stockQuantity || 0}
          onChange={(e) => handleChange('stockQuantity', Number(e.target.value))}
          required
        />
      </div>

      {/* Attributes Section */}
      <div className="space-y-4 border p-4 rounded-lg">
        <h4 className="font-semibold">Attributes (e.g., Color, Size)</h4>
        
        {/* Existing Attributes */}
        <div className="space-y-2">
          {Object.entries(attributes).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <Input value={key} readOnly className="w-1/3 bg-gray-100" />
              <Input 
                value={value} 
                onChange={(e) => setAttributes(prev => ({ ...prev, [key]: e.target.value }))}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                onClick={() => handleRemoveAttribute(key)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add New Attribute */}
        <div className="flex items-center space-x-2 pt-2 border-t">
          <Input 
            placeholder="New Key (e.g., material)" 
            value={newAttributeKey} 
            onChange={(e) => setNewAttributeKey(e.target.value)}
            className="w-1/3"
          />
          <Input 
            placeholder="New Value (e.g., ceramic)" 
            value={newAttributeValue} 
            onChange={(e) => setNewAttributeValue(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="secondary" 
            size="icon" 
            onClick={handleAddAttribute}
            disabled={!newAttributeKey.trim() || !newAttributeValue.trim()}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : (initialVariant ? 'Update Variant' : 'Create Variant')}
        </Button>
      </div>
    </form>
  );
};

export default VariantForm;