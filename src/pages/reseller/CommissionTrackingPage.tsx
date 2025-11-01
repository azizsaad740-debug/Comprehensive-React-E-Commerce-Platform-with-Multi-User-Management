"use client";

import React, { useMemo } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '../../components/data-table/DataTable.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpDown, DollarSign } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { getResellerCommissionRecords } from '@/utils/orderUtils';
import { CommissionRecord } from '@/types'; // Import CommissionRecord
import CommissionReportButton from '@/components/reseller/CommissionReportButton'; // NEW IMPORT

// Columns definition remains the same, but now uses the imported CommissionRecord type
const columns: ColumnDef<CommissionRecord>[] = [
  {
    accessorKey: "orderId",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Order ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("orderId")}</div>,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.date;
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "saleAmount",
    header: "Sale Amount",
    cell: ({ row }) => {
      const amount = row.getValue("saleAmount") as number;
      return <div className="text-right">${amount.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "rate",
    header: "Rate",
    cell: ({ row }) => {
      const rate = row.getValue("rate") as number;
      return <div>{rate}%</div>;
    },
  },
  {
    accessorKey: "commissionEarned",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Commission
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const commission = row.getValue("commissionEarned") as number;
      return <div className="text-right font-bold text-green-600">${commission.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as CommissionRecord['status'];
      const variant = status === 'paid' ? 'default' : status === 'pending' ? 'secondary' : 'destructive';
      return (
        <Badge variant={variant} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
];

const CommissionTrackingPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // Use the commission rate from the user object, falling back to 15 if user is null/undefined
  const commissionRate = user?.commissionRate || 15;
  const resellerId = user?.id;

  const commissions: CommissionRecord[] = useMemo(() => {
    if (!resellerId) return [];
    return getResellerCommissionRecords(resellerId, commissionRate);
  }, [resellerId, commissionRate]);
  
  const totalPaidEarnings = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.commissionEarned, 0);
    
  const pendingCommissions = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.commissionEarned, 0);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Commission Tracking</h1>
          <div className="flex space-x-2">
            {resellerId && (
              <CommissionReportButton commissions={commissions} resellerId={resellerId} />
            )}
            <Button variant="outline" onClick={() => navigate('/reseller/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
        <p className="text-gray-600 mb-8">View detailed records of your earned commissions.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPaidEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Lifetime earnings (Paid)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${pendingCommissions.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Rate</CardTitle>
              <Badge>Reseller</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{commissionRate}%</div>
              <p className="text-xs text-muted-foreground">Your current commission rate</p>
            </CardContent>
          </Card>
        </div>

        <DataTable 
          columns={columns} 
          data={commissions} 
          filterColumnId="orderId"
          filterPlaceholder="Filter by Order ID..."
        />
      </div>
    </AdminLayout>
  );
};

export default CommissionTrackingPage;