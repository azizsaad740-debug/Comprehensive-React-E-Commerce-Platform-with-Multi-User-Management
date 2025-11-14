"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Save, RefreshCw, DollarSign, Package, X } from 'lucide-react';
import { LedgerEntity, TransactionType, TransactionItemType, LedgerTransaction } from '@/types';
import { addLedgerTransaction, updateLedgerTransaction } from '@/utils/ledgerUtils';
import { useToast } from '@/hooks/use-toast';
import { useCheckoutSettingsStore } from '@/stores/checkoutSettingsStore';
import { getAllMockProducts } from '@/utils/productUtils';

interface TransactionFormProps {
  entity: LedgerEntity;
  initialType: TransactionType;
  initialTransaction?: LedgerTransaction; // NEW: Optional transaction for editing
  onTransactionAdded: () => void;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ entity, initialType, initialTransaction, onTransactionAdded, onClose }) => {
  const { toast } = useToast();
  const { currencySymbol } = useCheckoutSettingsStore();
  const allProducts = getAllMockProducts();
  
  const [isLoading, setIsLoading] = useState(false);
  
  const isEditing = !!initialTransaction;

  const [formData, setFormData] = useState({
    type: initialTransaction?.type || initialType,
    itemType: initialTransaction?.itemType || 'cash' as TransactionItemType,
    amount: initialTransaction?.amount || 0,
    details: initialTransaction?.details || '',
    productId: initialTransaction?.productId || '',
    productName: initialTransaction?.productName || '',
    quantity: initialTransaction?.quantity || 1,
    purchasePrice: initialTransaction?.purchasePrice || 0,
    salePrice: initialTransaction?.salePrice || 0,
  });
  
  useEffect(() => {
    if (initialTransaction) {
      setFormData({
        type: initialTransaction.type,
        itemType: initialTransaction.itemType,
        amount: initialTransaction.amount,
        details: initialTransaction.details,
        productId: initialTransaction.productId || '',
        productName: initialTransaction.productName || '',
        quantity: initialTransaction.quantity || 1,
        purchasePrice: initialTransaction.purchasePrice || 0,
        salePrice: initialTransaction.salePrice || 0,
      });
    }
  }, [initialTransaction]);

  const isProductTransaction = formData.itemType === 'product';
  const isWeGave = formData.type === 'we_gave'; // Giving product/cash (Debit to entity)
  const isWeReceived = formData.type === 'we_received'; // Receiving product/cash (Credit to entity)

  const handleChange = (field: keyof typeof formData, value: string | number | TransactionItemType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductSelect = (productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      setFormData(prev => {
        const defaultPrice = product.basePrice;
        const defaultSalePrice = product.discountedPrice || product.basePrice;
        
        const pricePerUnit = isWeGave ? defaultSalePrice : defaultPrice;
        const newAmount = pricePerUnit * prev.quantity;
        
        return {
          ...prev,
          productId: product.id,
          productName: product.name,
          purchasePrice: defaultPrice,
          salePrice: defaultSalePrice,
          amount: newAmount,
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        productId: '',
        productName: '',
        purchasePrice: 0,
        salePrice: 0,
        amount: 0,
      }));
    }
  };
  
  const handlePriceChange = (field: 'purchasePrice' | 'salePrice', value: number) => {
    setFormData(prev => {
      const newPrices = { ...prev, [field]: value };
      
      // Recalculate total amount based on quantity and transaction type
      const pricePerUnit = isWeGave ? newPrices.salePrice : newPrices.purchasePrice;
      const newAmount = pricePerUnit * newPrices.quantity;
      
      return { ...newPrices, amount: newAmount };
    });
  };
  
  const handleQuantityChange = (quantity: number) => {
    setFormData(prev => {
      const newQuantity = Math.max(1, quantity);
      const pricePerUnit = isWeGave ? prev.salePrice : prev.purchasePrice;
      const newAmount = pricePerUnit * newQuantity;
      
      return { ...prev, quantity: newQuantity, amount: newAmount };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0 || !formData.details) {
      toast({ title: "Error", description: "Amount must be positive and details are required.", variant: "destructive" });
      return;
    }
    if (isProductTransaction && (!formData.productId || formData.quantity <= 0)) {
      toast({ title: "Error", description: "Please select a product and quantity.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      setTimeout(() => {
        const transactionData = {
          entityId: entity.id,
          type: formData.type,
          itemType: formData.itemType,
          amount: Number(formData.amount),
          details: formData.details,
          
          // Product specific fields
          productId: isProductTransaction ? formData.productId : undefined,
          productName: isProductTransaction ? formData.productName : undefined,
          quantity: isProductTransaction ? formData.quantity : undefined,
          purchasePrice: isProductTransaction ? formData.purchasePrice : undefined,
          salePrice: isProductTransaction ? formData.salePrice : undefined,
        };
        
        let result;
        if (isEditing && initialTransaction) {
          result = updateLedgerTransaction({ ...transactionData, id: initialTransaction.id });
        } else {
          result = addLedgerTransaction(transactionData);
        }
        
        if (result) {
          toast({
            title: isEditing ? "Transaction Updated" : "Transaction Recorded",
            description: `${entity.name}'s ledger updated. Stock updated if applicable.`,
          });
          
          onTransactionAdded();
          onClose();
        } else {
          throw new Error(isEditing ? "Failed to update transaction." : "Failed to add transaction.");
        }
        
        setIsLoading(false);
      }, 500);
      
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to record transaction.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Transaction Type (Fixed by FAB) */}
        <div className="space-y-2">
          <Label htmlFor="type">Transaction Type</Label>
          <Input 
            value={isWeGave ? 'We Gave (Debit)' : 'We Received (Credit)'} 
            readOnly 
            className={isWeGave ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
          />
        </div>
        
        {/* Item Type */}
        <div className="space-y-2">
          <Label htmlFor="itemType">Item Type</Label>
          <Select 
            value={formData.itemType} 
            onValueChange={(val: TransactionItemType) => handleChange('itemType', val)}
            disabled={isLoading || isEditing} // Prevent changing item type when editing
          >
            <SelectTrigger>
              <SelectValue placeholder="Select item type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="product">Product</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Product Selection (Conditional) */}
      {isProductTransaction && (
        <Card className="p-4 bg-gray-50 space-y-4">
          <h4 className="font-semibold flex items-center"><Package className="h-4 w-4 mr-2" /> Product Details</h4>
          
          <div className="space-y-2">
            <Label htmlFor="productId">Select Product (for Stock/Inventory)</Label>
            <Select 
              value={formData.productId} 
              onValueChange={handleProductSelect}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a product" />
              </SelectTrigger>
              <SelectContent>
                {allProducts.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} (Stock: {product.stockQuantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pricePerUnit">{isWeGave ? 'Sale Price' : 'Purchase Price'} ({currencySymbol})</Label>
              <Input
                id="pricePerUnit"
                type="number"
                step="0.01"
                min={0}
                value={isWeGave ? formData.salePrice : formData.purchasePrice}
                onChange={(e) => handlePriceChange(isWeGave ? 'salePrice' : 'purchasePrice', Number(e.target.value))}
                required
                disabled={isLoading}
              />
            </div>
          </div>
        </Card>
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
          disabled={isLoading}
        />
      </div>
      
      {/* Final Amount (Read-only for product transactions) */}
      <div className="space-y-2">
        <Label htmlFor="amount">Total Amount ({currencySymbol})</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min={0.01}
          value={formData.amount.toFixed(2)}
          onChange={(e) => {
            if (formData.itemType === 'cash') {
              handleChange('amount', Number(e.target.value));
            }
          }}
          required
          readOnly={isProductTransaction}
          className={isProductTransaction ? 'bg-gray-100' : ''}
          disabled={isLoading}
        />
        {isProductTransaction && <p className="text-xs text-gray-500">Calculated automatically based on quantity and price.</p>}
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          <X className="h-4 w-4 mr-2" /> Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {isEditing ? 'Update Transaction' : 'Record Transaction'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;