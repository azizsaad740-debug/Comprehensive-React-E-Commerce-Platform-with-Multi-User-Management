"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Save, RefreshCw, DollarSign, Package } from 'lucide-react';
import { LedgerEntity, TransactionType, TransactionItemType } from '@/types';
import { addLedgerTransaction } from '@/utils/ledgerUtils';
import { useToast } from '@/hooks/use-toast';

interface TransactionFormProps {
  entity: LedgerEntity;
  onTransactionAdded: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ entity, onTransactionAdded }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'we_gave' as TransactionType,
    itemType: 'cash' as TransactionItemType,
    amount: 0,
    details: '',
    productName: '',
  });

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0 || !formData.details) {
      toast({ title: "Error", description: "Amount must be positive and details are required.", variant: "destructive" });
      return;
    }
    if (formData.itemType === 'product' && !formData.productName) {
      toast({ title: "Error", description: "Product name is required for product transactions.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      setTimeout(() => {
        addLedgerTransaction({
          entityId: entity.id,
          type: formData.type,
          itemType: formData.itemType,
          amount: Number(formData.amount),
          details: formData.details,
          productName: formData.itemType === 'product' ? formData.productName : undefined,
        });
        
        toast({
          title: "Transaction Recorded",
          description: `${entity.name}'s ledger updated.`,
        });

        // Reset form
        setFormData({
          type: 'we_gave',
          itemType: 'cash',
          amount: 0,
          details: '',
          productName: '',
        });
        
        onTransactionAdded();
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to record transaction.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(val: TransactionType) => handleChange('type', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="we_gave">We Gave (Debit)</SelectItem>
                  <SelectItem value="we_received">We Received (Credit)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Item Type */}
            <div className="space-y-2">
              <Label htmlFor="itemType">Item Type</Label>
              <Select 
                value={formData.itemType} 
                onValueChange={(val: TransactionItemType) => handleChange('itemType', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash <DollarSign className="h-4 w-4 inline ml-2" /></SelectItem>
                  <SelectItem value="product">Product <Package className="h-4 w-4 inline ml-2" /></SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({entity.type === 'supplier' ? 'Cost' : 'Value'})</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={0.01}
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', Number(e.target.value))}
                required
              />
            </div>
          </div>
          
          {/* Product Name (Conditional) */}
          {formData.itemType === 'product' && (
            <div className="space-y-2">
              <Label htmlFor="productName">Product/Item Name</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleChange('productName', e.target.value)}
                required
              />
            </div>
          )}
          
          {/* Details */}
          <div className="space-y-2">
            <Label htmlFor="details">Details / Notes</Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) => handleChange('details', e.target.value)}
              rows={2}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Record Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;