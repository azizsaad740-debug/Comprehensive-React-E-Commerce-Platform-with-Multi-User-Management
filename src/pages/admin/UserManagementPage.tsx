"use client";

import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { User } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '../../components/data-table/DataTable.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react';

// Mock Data
const mockUsers: User[] = [
  {
    id: 'u1', email: 'admin@example.com', name: 'Alice Admin', role: 'admin', isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: 'u2', email: 'reseller1@example.com', name: 'Bob Reseller', role: 'reseller', isActive: true, createdAt: new Date(), updatedAt: new Date(), commissionRate: 15, totalEarnings: 5000,
  },
  {
    id: 'u3', email: 'customer1@example.com', name: 'Charlie Customer', role: 'customer', isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: 'u4', email: 'inactive@example.com', name: 'Diana Dormant', role: 'customer', isActive: false, createdAt: new Date(), updatedAt: new Date(),
  },
];

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
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
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as User['role'];
      return (
        <Badge variant={role === 'admin' ? 'destructive' : role === 'reseller' ? 'default' : 'secondary'} className="capitalize">
          {role}
        </Badge>
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

const UserManagementPage = () => {
  // In a real app, fetch users here
  const users = mockUsers;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Button>Add New User</Button>
        </div>
        <p className="text-gray-600 mb-8">Manage all customer and reseller accounts.</p>

        <DataTable 
          columns={columns} 
          data={users} 
          filterColumnId="email"
          filterPlaceholder="Filter by email..."
        />
      </div>
    </AdminLayout>
  );
};

export default UserManagementPage;