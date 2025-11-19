"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PromoCode, Product } from '@/types';
import { createNewPromoCode } from '@/utils/promoCodeUtils';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { getAllMockProducts } from '@/utils/productUtils';

interface CreatePromoCodeFormProps {
  onCodeCreated: (code: PromoCode) => void;
}

const CreatePromoCodeForm: React.FC<CreatePromoCodeFormProps> = ({ onCodeCreated }) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const loadProducts = async () => {
      setAllProducts(await getAllMockProducts(false));
    };
    loadProducts();
  }, []);
  
  const availableCategories = useMemo(() => {
    const categories = Array.from(new Set(allProducts.map(p => p.category)));
    return ['all', ...categories];
  }, [allProducts]);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    minimumOrderValue: 0,
    usageLimit: 100,
    validTo: new Date(Date.now() + 86400000 * 30), // Default 30 days validity
    targetCategory: 'all', // NEW FIELD
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, validTo: date }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'reseller') return;

    setIsLoading(true);

    const newCodeData: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'> = {
      ...formData,
      discountValue: Number(formData.discountValue),
      minimumOrderValue: Number(formData.minimumOrderValue),
      usageLimit: Number(formData.usageLimit),
      validFrom: new Date(),
      isActive: true,
      resellerId: user.id,
      autoAssignReseller: true,
      targetCategory: formData.targetCategory, // Include new field
    };

    try {
      const newCode = createNewPromoCode(newCodeData);
      onCodeCreated(newCode);
      
      toast({
        title: "Success",
        description: `Promo code ${newCode.code} created successfully!`,
      });

      // Reset form
      setFormData({
        code: '',
        name: '',
        discountType: 'percentage',
        discountValue: 10,
        minimumOrderValue: 0,
        usageLimit: 100,
        validTo: new Date(Date.now() + 86400000 * 30),
        targetCategory: 'all',
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create promo code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Reseller Promo Code</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Code (e.g., BOB15)</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                required
                maxLength={15}
              />
            </div>
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
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
                onValueChange={(val) => handleChange('discountType', val)}
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
                min={1}
                value={formData.discountValue}
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
                value={formData.usageLimit}
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
                value={formData.minimumOrderValue}
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
            {/* Target Category */}
            <div className="space-y-2">
              <Label htmlFor="targetCategory">Target Category</Label>
              <Select 
                value={formData.targetCategory} 
                onValueChange={(val) => handleChange('targetCategory', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !formData.code || !formData.name}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Creating...' : 'Generate Promo Code'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePromoCodeForm;