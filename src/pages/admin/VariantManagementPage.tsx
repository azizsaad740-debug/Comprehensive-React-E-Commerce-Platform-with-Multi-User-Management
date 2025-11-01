"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ColumnDef } from "@tanstack/react-table";
import { ProductVariant, Product } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit, Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import { getMockProductById } from '@/utils/productUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Mock function to simulate variant update/delete
const mockUpdateVariant = (variantId: string, data: Partial<ProductVariant>) => {
  console.log(`Updating variant ${variantId} with data:`, data);
  // In a real app, this would call an API
};

const mockDeleteVariant = (variantId: string) => {
  console.log(`Deleting variant ${variantId}`);
  // In a real app, this would call an API
};

const columns: ColumnDef<ProductVariant>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Variant Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "price",
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
      const price = row.getValue("price") as number;
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
    accessorKey: "attributes",
    header: "Attributes",
    cell: ({ row }) => {
      const attributes = row.getValue("attributes") as Record<string, string>;
      return (
        <div className="flex flex-wrap gap-1">
          {Object.entries(attributes).map(([key, value]) => (
            <Badge key={key} variant="outline" className="text-xs">
              {key}: {value}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const variant = row.original;
      const { toast } = useToast();
      
      const handleEdit = () => {
        toast({ title: "Action", description: `Editing variant: ${variant.name}` });
        // Implement modal/form for editing
      };
      
      const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete variant: ${variant.name}?`)) {
          mockDeleteVariant(variant.id);
          toast({ title: "Deleted", description: `Variant ${variant.name} deleted.` });
          // In a real app, trigger a state refresh here
        }
      };
      
      return (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

const VariantManagementPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (id) {
      const fetchedProduct = getMockProductById(id);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
      } else {
        toast({
          title: "Error",
          description: "Product not found.",
          variant: "destructive",
        });
        navigate('/admin/products');
      }
    }
  }, [id, navigate, toast]);

  if (!product) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Loading...</h1>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Variants: {product.name}</h1>
            <p className="text-gray-600">Product ID: {product.id}</p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => navigate('/admin/products')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Variant
            </Button>
          </div>
        </div>
        <p className="text-gray-600 mb-8">Configure different sizes, colors, and pricing for this product.</p>

        <Card>
          <CardHeader>
            <CardTitle>Product Variants ({product.variants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={product.variants} 
              filterColumnId="name"
              filterPlaceholder="Filter by variant name..."
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default VariantManagementPage;