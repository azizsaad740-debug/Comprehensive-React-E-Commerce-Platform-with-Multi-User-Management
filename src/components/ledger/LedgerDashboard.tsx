"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { calculateOverallLedgerSummary } from '@/utils/ledgerUtils';
import { useCheckoutSettingsStore } from '@/stores/checkoutSettingsStore';

interface LedgerDashboardProps {
  onRefresh: () => void;
}

const LedgerDashboard: React.FC<LedgerDashboardProps> = ({ onRefresh }) => {
  const summary = calculateOverallLedgerSummary();
  const { currencySymbol } = useCheckoutSettingsStore();
  
  const netBalanceColor = summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Total Entities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Entities</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalEntities}</div>
          <p className="text-xs text-muted-foreground">Customers, Resellers, Suppliers, Others</p>
        </CardContent>
      </Card>
      
      {/* Total Debt (Owed to us) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Debt (Owed to Us)</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {currencySymbol}{summary.totalDebt.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Total positive balances</p>
        </CardContent>
      </Card>
      
      {/* Total Credit (We owe) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Credit (We Owe)</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {currencySymbol}{summary.totalCredit.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Total negative balances</p>
        </CardContent>
      </Card>
      
      {/* Net Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          <DollarSign className={`h-4 w-4 ${netBalanceColor}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netBalanceColor}`}>
            {currencySymbol}{summary.netBalance.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Debt minus Credit</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LedgerDashboard;