"use client";

import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { PromoCode } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '../../components/data-table/DataTable.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit, Trash2, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock Data
const mockPromoCodes: PromoCode[] = [
  {
    id: 'p1',
    code: 'SUMMER20',
    name: 'Summer Sale 20%',
    discountType: 'percentage',
    discountValue: 20,
    minimumOrderValue: 50,
    usageLimit: 500,
    usedCount: 150,
    validFrom: new Date(Date.now() - 86400000 * 30),
    validTo: new Date(Date.now() + 86400000 * 30),
    isActive: true,
    createdAt: new Date(),
    autoAssignReseller: false,
  },
  {
    id: 'p2',
    code: 'FREESHIP',
    name: 'Free Shipping Promo',
    discountType: 'fixed',
    discountValue: 9.99,
    minimumOrderValue: 0,
    usageLimit: 100,
    usedCount: 95,
    validFrom: new Date(Date.now() - 86400000 * 60),
    validTo: new Date(Date.now() - 86400000 * 5),
    isActive: false,
    createdAt: new Date(),
    autoAssignReseller: false,
  },
  {
    id: 'p3',
    code: 'RESELLER10',
    name: 'Reseller Exclusive 10%',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrderValue: 20,
    usageLimit: 1000,
    usedCount: 50,
    validFrom: new Date(Date.now() - 86400000 * 10),
    validTo: new Date(Date.now() + 86400000 * 90),
    resellerId: 'u2',
    isActive: true,
    createdAt: new Date(),
    autoAssignReseller: true,
  },
];

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

const PromoCodeManagementPage = () => {
  const promoCodes = mockPromoCodes;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Promo Code Management</h1>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Code
          </Button>
        </div>
        <p className="text-gray-600 mb-8">Manage promotional codes, discounts, and usage limits.</p>

        <DataTable 
          columns={columns} 
          data={promoCodes} 
          filterColumnId="code"
          filterPlaceholder="Filter by code..."
        />
      </div>
    </AdminLayout>
  );
};

export default PromoCodeManagementPage;