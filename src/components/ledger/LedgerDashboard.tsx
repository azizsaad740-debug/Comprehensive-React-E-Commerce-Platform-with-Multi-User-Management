"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { calculateOverallLedgerSummary } from '@/utils/ledgerUtils';
import { useCheckoutSettingsStore } from '@/stores/checkoutSettingsStore';

interface LedgerSummary {
  totalDebt: number;
  totalCredit: number;
  netBalance: number;
  totalEntities: number;
}

interface LedgerDashboardProps {
  onRefresh: () => void;
}

const LedgerDashboard: React.FC<LedgerDashboardProps> = ({ onRefresh }) => {
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currencySymbol } = useCheckoutSettingsStore();
  
  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      const result = await calculateOverallLedgerSummary();
      setSummary(result);
      setIsLoading(false);
    };
    fetchSummary();
  }, [onRefresh]); // Depend on onRefresh prop to trigger refetch

  if (isLoading || !summary) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <p className="text-xs text-muted-foreground mt-1">Fetching data</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
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