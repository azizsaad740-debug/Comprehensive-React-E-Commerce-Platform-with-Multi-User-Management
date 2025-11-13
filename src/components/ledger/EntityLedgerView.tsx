"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LedgerEntity, LedgerTransaction } from '@/types';
import { calculateEntityBalance, getTransactionsByEntityId } from '@/utils/ledgerUtils';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Package, ArrowUp, ArrowDown } from 'lucide-react';
import TransactionForm from './TransactionForm.tsx';
import { Button } from '@/components/ui/button';

interface EntityLedgerViewProps {
  entity: LedgerEntity;
  onTransactionAdded: () => void;
}

const EntityLedgerView: React.FC<EntityLedgerViewProps> = ({ entity, onTransactionAdded }) => {
  const transactions = getTransactionsByEntityId(entity.id);
  const balance = calculateEntityBalance(entity.id);
  
  const balanceColor = balance >= 0 ? 'text-green-600' : 'text-red-600';
  const balanceLabel = balance >= 0 ? 'Owes Us (Debt)' : 'We Owe (Credit)';

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
                ${Math.abs(balance).toFixed(2)}
              </p>
              <p className={`text-sm ${balanceColor}`}>
                {balanceLabel}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Transaction Form */}
      <Card>
        <CardHeader>
          <CardTitle>Record New Transaction</CardTitle>
        </CardHeader>
        <TransactionForm entity={entity} onTransactionAdded={onTransactionAdded} />
      </Card>

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
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Running Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsWithRunningBalance.map((t) => {
                    const isDebit = t.type === 'we_gave';
                    const amountColor = isDebit ? 'text-green-600' : 'text-red-600';
                    const balanceColor = t.runningBalance >= 0 ? 'text-green-600' : 'text-red-600';
                    
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="text-sm">{t.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={isDebit ? 'default' : 'secondary'} className="capitalize">
                            {t.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm capitalize flex items-center space-x-1">
                          {t.itemType === 'cash' ? <DollarSign className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                          <span>{t.itemType === 'product' ? t.productName : 'Cash'}</span>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${amountColor}`}>
                          {isDebit ? <ArrowUp className="h-3 w-3 inline mr-1" /> : <ArrowDown className="h-3 w-3 inline mr-1" />}
                          ${t.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{t.details}</TableCell>
                        <TableCell className={`text-right font-bold ${balanceColor}`}>
                          ${Math.abs(t.runningBalance).toFixed(2)}
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
    </div>
  );
};

export default EntityLedgerView;