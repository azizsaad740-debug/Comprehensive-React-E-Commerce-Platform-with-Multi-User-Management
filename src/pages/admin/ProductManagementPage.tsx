"use client";

import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { Product } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '../../components/data-table/DataTable.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllMockProducts } from '@/utils/productUtils';

// Columns definition remains the same, but now uses the imported Product type
const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Product Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "basePrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.original.discountedPrice?.toString() || row.getValue("basePrice") as string);
      return <div className="text-right font-mono">${price.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "stockQuantity",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.getValue("stockQuantity") as number;
      return (
        <Badge variant={stock < 10 ? 'destructive' : 'secondary'}>
          {stock}
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
          {isActive ? 'Active' : 'Draft'}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const product = row.original;
      return (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/products/${product.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

const ProductManagementPage = () => {
  // Fetch products from centralized utility
  const products = getAllMockProducts();

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <Button>Add New Product</Button>
        </div>
        <p className="text-gray-600 mb-8">Manage inventory, pricing, and product details.</p>

        <DataTable 
          columns={columns} 
          data={products} 
          filterColumnId="name"
          filterPlaceholder="Filter by product name..."
        />
      </div>
    </AdminLayout>
  );
};

export default ProductManagementPage;