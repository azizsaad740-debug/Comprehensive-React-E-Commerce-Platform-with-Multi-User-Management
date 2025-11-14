"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LedgerTransaction, LedgerEntity } from '@/types';
import { DollarSign, Package, Calendar, FileText, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useCheckoutSettingsStore } from '@/stores/checkoutSettingsStore';
import { deleteLedgerTransaction } from '@/utils/ledgerUtils';
import { useToast } from '@/hooks/use-toast';
import TransactionForm from './TransactionForm';

interface TransactionDetailDialogProps {
  transaction: LedgerTransaction;
  entity: LedgerEntity;
  isOpen: boolean;
  onClose: () => void;
  onTransactionUpdated: () => void;
}

const TransactionDetailDialog: React.FC<TransactionDetailDialogProps> = ({
  transaction,
  entity,
  isOpen,
  onClose,
  onTransactionUpdated,
}) => {
  const { currencySymbol } = useCheckoutSettingsStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isDebit = transaction.type === 'we_gave';
  const amountColor = isDebit ? 'text-green-600' : 'text-red-600';
  const amountSign = isDebit ? '+' : '-';

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this transaction? This action will reverse any associated stock changes.")) {
      setIsDeleting(true);
      setTimeout(() => {
        if (deleteLedgerTransaction(transaction.id)) {
          toast({ title: "Deleted", description: "Transaction removed and stock reversed." });
          onTransactionUpdated();
          onClose();
        } else {
          toast({ title: "Error", description: "Failed to delete transaction.", variant: "destructive" });
        }
        setIsDeleting(false);
      }, 500);
    }
  };
  
  const handleFormSave = () => {
    setIsEditing(false);
    onTransactionUpdated();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setIsEditing(false); // Reset editing state when closing
      }
    }}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isEditing ? 'Edit Transaction' : 'Transaction Details'}
          </DialogTitle>
        </DialogHeader>
        
        {isEditing ? (
          <TransactionForm
            entity={entity}
            initialType={transaction.type}
            initialTransaction={transaction} // Pass the transaction data for editing
            onTransactionAdded={handleFormSave} // Re-use onTransactionAdded for update success
            onClose={() => setIsEditing(false)}
          />
        ) : (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm font-medium text-gray-500">Entity</span>
                  <span className="font-semibold">{entity.name}</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm font-medium text-gray-500 flex items-center"><Calendar className="h-4 w-4 mr-1" /> Date</span>
                  <span className="font-semibold">{transaction.createdAt.toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm font-medium text-gray-500">Type</span>
                  <Badge variant={isDebit ? 'destructive' : 'default'} className="capitalize">
                    {transaction.type.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm font-medium text-gray-500 flex items-center">
                    {transaction.itemType === 'cash' ? <DollarSign className="h-4 w-4 mr-1" /> : <Package className="h-4 w-4 mr-1" />}
                    Item Type
                  </span>
                  <span className="font-semibold capitalize">{transaction.itemType}</span>
                </div>
                
                {transaction.itemType === 'product' && (
                  <>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm font-medium text-gray-500">Product</span>
                      <span className="font-semibold">{transaction.productName} (x{transaction.quantity})</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm font-medium text-gray-500">{isDebit ? 'Sale Price' : 'Purchase Price'}</span>
                      <span className="font-semibold">{currencySymbol}{isDebit ? transaction.salePrice?.toFixed(2) : transaction.purchasePrice?.toFixed(2)}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-gray-700">Total Amount</span>
                  <span className={`text-2xl font-bold ${amountColor}`}>
                    {amountSign}{currencySymbol}{transaction.amount.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-gray-700">{transaction.details}</p>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailDialog;