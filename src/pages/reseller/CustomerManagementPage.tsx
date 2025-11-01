"use client";

import React, { useMemo } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { User } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '../../components/data-table/DataTable.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Eye, Mail } from 'lucide-react';
import { getCustomersByResellerId } from '@/utils/userUtils';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

// Columns definition for Reseller view (simplified actions)
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "createdAt",
    header: "Joined Date",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "totalSales",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Sales
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      // totalSales is now dynamically calculated and attached to the user object
      const sales = row.original.totalSales || 0; 
      return <div className="font-bold text-right">${sales.toFixed(2)}</div>;
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
    cell: ({ row }) => {
      const navigate = useNavigate();
      const user = row.original;
      return (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => alert(`Viewing orders for ${user.name}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.location.href = `mailto:${user.email}`}>
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

const CustomerManagementPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const customers = useMemo(() => {
    if (!user || user.role !== 'reseller') return [];
    // Filter customers referred by the current reseller (u2 in mock data)
    return getCustomersByResellerId(user.id);
  }, [user]);

  if (!user || user.role !== 'reseller') {
    return <AdminLayout><div className="p-8">Access Denied.</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Customers</h1>
          <Button variant="outline" onClick={() => navigate('/reseller/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
        <p className="text-gray-600 mb-8">View and manage customers who signed up using your referral link or promo code.</p>

        <DataTable 
          columns={columns} 
          data={customers} 
          filterColumnId="email"
          filterPlaceholder="Filter by email..."
        />
      </div>
    </AdminLayout>
  );
};

export default CustomerManagementPage;