"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, RefreshCw, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PromoCode } from '@/types';

interface PromoCodeFormProps {
  initialCode?: PromoCode;
  onSubmit: (codeData: Partial<PromoCode>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const defaultCodeData: Partial<PromoCode> = {
  code: '',
  name: '',
  discountType: 'percentage',
  discountValue: 10,
  minimumOrderValue: 0,
  usageLimit: 100,
  validTo: new Date(Date.now() + 86400000 * 30),
  isActive: true,
  autoAssignReseller: false,
  resellerId: undefined,
};

const PromoCodeForm: React.FC<PromoCodeFormProps> = ({ initialCode, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState<Partial<PromoCode>>(() => {
    // Ensure dates are Date objects if coming from initialCode
    const initial = initialCode ? { 
      ...initialCode, 
      validFrom: initialCode.validFrom ? new Date(initialCode.validFrom) : undefined,
      validTo: initialCode.validTo ? new Date(initialCode.validTo) : undefined,
    } : defaultCodeData;
    return initial;
  });

  useEffect(() => {
    const initial = initialCode ? { 
      ...initialCode, 
      validFrom: initialCode.validFrom ? new Date(initialCode.validFrom) : undefined,
      validTo: initialCode.validTo ? new Date(initialCode.validTo) : undefined,
    } : defaultCodeData;
    setFormData(initial);
  }, [initialCode]);

  const handleChange = (field: keyof PromoCode, value: string | number | boolean | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      handleChange('validTo', date);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name || !formData.validTo) {
      alert('Please fill in all required fields.');
      return;
    }

    const dataToSubmit: Partial<PromoCode> = {
      ...formData,
      discountValue: Number(formData.discountValue),
      minimumOrderValue: Number(formData.minimumOrderValue),
      usageLimit: Number(formData.usageLimit),
      validFrom: formData.validFrom || new Date(),
      isActive: formData.isActive ?? true,
      autoAssignReseller: formData.autoAssignReseller ?? false,
    };

    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Code */}
        <div className="space-y-2">
          <Label htmlFor="code">Code (e.g., ADMIN20)</Label>
          <Input
            id="code"
            value={formData.code || ''}
            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
            required
            maxLength={15}
            disabled={!!initialCode} // Prevent changing code on edit
          />
        </div>
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Discount Type */}
        <div className="space-y-2">
          <Label htmlFor="discountType">Discount Type</Label>
          <Select 
            value={formData.discountType} 
            onValueChange={(val) => handleChange('discountType', val as 'percentage' | 'fixed')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Discount Value */}
        <div className="space-y-2">
          <Label htmlFor="discountValue">Discount Value</Label>
          <Input
            id="discountValue"
            type="number"
            step="0.01"
            min={1}
            value={formData.discountValue || 0}
            onChange={(e) => handleChange('discountValue', Number(e.target.value))}
            required
          />
        </div>
        {/* Usage Limit */}
        <div className="space-y-2">
          <Label htmlFor="usageLimit">Usage Limit</Label>
          <Input
            id="usageLimit"
            type="number"
            min={1}
            value={formData.usageLimit || 0}
            onChange={(e) => handleChange('usageLimit', Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Minimum Order Value */}
        <div className="space-y-2">
          <Label htmlFor="minimumOrderValue">Minimum Order Value ($)</Label>
          <Input
            id="minimumOrderValue"
            type="number"
            min={0}
            value={formData.minimumOrderValue || 0}
            onChange={(e) => handleChange('minimumOrderValue', Number(e.target.value))}
            required
          />
        </div>
        {/* Valid To Date */}
        <div className="space-y-2">
          <Label htmlFor="validTo">Valid Until</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.validTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.validTo ? format(formData.validTo, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.validTo}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* Reseller ID (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="resellerId">Reseller ID (Optional)</Label>
          <Input
            id="resellerId"
            value={formData.resellerId || ''}
            onChange={(e) => handleChange('resellerId', e.target.value)}
            placeholder="u2, etc."
          />
        </div>
      </div>
      
      {/* Status and Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive ?? true}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="h-4 w-4 text-primary border-gray-300 rounded"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoAssignReseller"
              checked={formData.autoAssignReseller ?? false}
              onChange={(e) => handleChange('autoAssignReseller', e.target.checked)}
              className="h-4 w-4 text-primary border-gray-300 rounded"
            />
            <Label htmlFor="autoAssignReseller">Auto-Assign Reseller</Label>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || !formData.code || !formData.name}>
            {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isSaving ? 'Saving...' : (initialCode ? 'Update Code' : 'Create Code')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PromoCodeForm;