"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LedgerEntity, LedgerTransaction, TransactionType } from '@/types';
import { calculateEntityBalance, getTransactionsByEntityId } from '@/utils/ledgerUtils';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Package, ArrowUp, ArrowDown, PlusCircle, MinusCircle } from 'lucide-react';
import TransactionForm from './TransactionForm.tsx';
import { Button } from '@/components/ui/button';
import { useCheckoutSettingsStore } from '@/stores/checkoutSettingsStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import TransactionDetailDialog from './TransactionDetailDialog'; // NEW IMPORT

interface EntityLedgerViewProps {
  entity: LedgerEntity;
  onTransactionAdded: () => void;
}

const EntityLedgerView: React.FC<EntityLedgerViewProps> = ({ entity, onTransactionAdded }) => {
  const transactions = getTransactionsByEntityId(entity.id);
  const balance = calculateEntityBalance(entity.id);
  const { currencySymbol } = useCheckoutSettingsStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<TransactionType>('we_gave');
  
  // State for detail dialog
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<LedgerTransaction | null>(null);

  const balanceColor = balance >= 0 ? 'text-green-600' : 'text-red-600';
  const balanceLabel = balance >= 0 ? 'Owes Us (Debt)' : 'We Owe (Credit)';

  const handleOpenForm = (type: TransactionType) => {
    setFormType(type);
    setIsFormOpen(true);
  };
  
  const handleOpenDetail = (transaction: LedgerTransaction) => {
    setSelectedTransaction(transaction);
    setIsDetailOpen(true);
  };
  
  const handleCloseDetail = () => {
    setSelectedTransaction(null);
    setIsDetailOpen(false);
  };

  // Calculate running balance for display
  const transactionsWithRunningBalance = useMemo(() => {
    let runningBalance = 0;
    const reversedTransactions = [...transactions].reverse(); // Process oldest first
    
    const transactionsWithBalance = reversedTransactions.map(t => {
      if (t.type === 'we_gave') {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }
      return { ...t, runningBalance };
    }).reverse(); // Reverse back to newest first
    
    return transactionsWithBalance;
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center justify-between">
            <span>Ledger for {entity.name}</span>
            <Badge variant="secondary" className="capitalize">{entity.type}</Badge>
          </CardTitle>
          <CardDescription>Contact: {entity.contact}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-medium">Current Balance:</h3>
            <div className="text-right">
              <p className={`text-3xl font-bold ${balanceColor}`}>
                {currencySymbol}{Math.abs(balance).toFixed(2)}
              </p>
              <p className={`text-sm ${balanceColor}`}>
                {balanceLabel}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Buttons (FABs) for Mobile/Quick Entry */}
      <div className="fixed bottom-4 right-4 md:hidden flex flex-col space-y-3 z-50">
        <Button 
          className="w-16 h-16 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white"
          onClick={() => handleOpenForm('we_received')}
          title="Record Credit (We Received)"
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
        <Button 
          className="w-16 h-16 rounded-full shadow-lg bg-red-600 hover:bg-red-700 text-white"
          onClick={() => handleOpenForm('we_gave')}
          title="Record Debit (We Gave)"
        >
          <MinusCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No transactions recorded yet.</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Date</TableHead>
                    <TableHead className="min-w-[100px]">Type</TableHead>
                    <TableHead className="text-right min-w-[100px]">Amount</TableHead>
                    <TableHead className="text-right min-w-[120px] hidden sm:table-cell">Running Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsWithRunningBalance.map((t) => {
                    const isDebit = t.type === 'we_gave';
                    const amountColor = isDebit ? 'text-green-600' : 'text-red-600';
                    const balanceColor = t.runningBalance >= 0 ? 'text-green-600' : 'text-red-600';
                    
                    return (
                      <TableRow 
                        key={t.id} 
                        onClick={() => handleOpenDetail(t)}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="text-sm">{t.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={isDebit ? 'destructive' : 'default'} className="capitalize">
                            {t.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${amountColor}`}>
                          {isDebit ? <ArrowUp className="h-3 w-3 inline mr-1" /> : <ArrowDown className="h-3 w-3 inline mr-1" />}
                          {currencySymbol}{t.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${balanceColor} hidden sm:table-cell`}>
                          {currencySymbol}{Math.abs(t.runningBalance).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Transaction Form Sheet (for creation) */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Record {formType === 'we_gave' ? 'Debit (We Gave)' : 'Credit (We Received)'}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <TransactionForm 
              entity={entity} 
              initialType={formType}
              onTransactionAdded={onTransactionAdded} 
              onClose={() => setIsFormOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Transaction Detail Dialog (for view/edit/delete) */}
      {selectedTransaction && (
        <TransactionDetailDialog
          transaction={selectedTransaction}
          entity={entity}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onTransactionUpdated={onTransactionAdded}
        />
      )}
    </div>
  );
};

export default EntityLedgerView;