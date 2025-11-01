"use client";

import React, { useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { PromoCode } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit, Trash2, PlusCircle, Tag } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getPromoCodesByResellerId } from '@/utils/promoCodeUtils';
import CreatePromoCodeForm from '@/components/reseller/CreatePromoCodeForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResellerCodeDisplay from '@/components/reseller/ResellerCodeDisplay';

const columns: ColumnDef<PromoCode>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Code
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-bold text-primary">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "discountValue",
    header: "Discount",
    cell: ({ row }) => {
      const promo = row.original;
      const value = promo.discountValue;
      return (
        <div>
          {promo.discountType === 'percentage' ? `${value}% OFF` : `$${value.toFixed(2)} OFF`}
        </div>
      );
    },
  },
  {
    accessorKey: "usedCount",
    header: "Usage",
    cell: ({ row }) => {
      const promo = row.original;
      return (
        <div className="text-sm text-gray-600">
          {promo.usedCount} / {promo.usageLimit || '∞'}
        </div>
      );
    },
  },
  {
    accessorKey: "validTo",
    header: "Expires",
    cell: ({ row }) => {
      const date = row.original.validTo;
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'outline'} className={isActive ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

const ResellerPromoCodePage = () => {
  const { user } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  
  // Initialize state with codes linked to the current reseller
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(
    user?.id ? getPromoCodesByResellerId(user.id) : []
  );

  const handleCodeCreated = (newCode: PromoCode) => {
    setPromoCodes(prev => [...prev, newCode]);
    setIsCreating(false);
  };

  if (!user || user.role !== 'reseller') {
    return <AdminLayout><div className="p-8">Access Denied.</div></AdminLayout>;
  }
  
  // Removed useMemo wrapper around columns

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Promo Codes</h1>
          <Button onClick={() => setIsCreating(!isCreating)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {isCreating ? 'Cancel Creation' : 'Generate New Code'}
          </Button>
        </div>
        <p className="text-gray-600 mb-8">Manage promotional codes linked to your reseller account.</p>

        <ResellerCodeDisplay resellerId={user.id} />

        {isCreating && (
          <div className="mb-8">
            <CreatePromoCodeForm onCodeCreated={handleCodeCreated} />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="h-5 w-5" />
              All Generated Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={promoCodes} 
              filterColumnId="code"
              filterPlaceholder="Filter by code..."
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ResellerPromoCodePage;