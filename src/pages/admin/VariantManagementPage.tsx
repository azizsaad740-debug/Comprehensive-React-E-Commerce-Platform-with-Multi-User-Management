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
import { getMockProductById, mockProducts } from '@/utils/productUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VariantForm from '@/components/admin/VariantForm';
import { v4 as uuidv4 } from 'uuid';

// Mock function to simulate variant update/delete
const mockUpdateVariant = (productId: string, variantData: Partial<ProductVariant>): ProductVariant | undefined => {
  const product = mockProducts.find(p => p.id === productId);
  if (!product) return undefined;

  if (variantData.id) {
    // Update existing variant
    const index = product.variants.findIndex(v => v.id === variantData.id);
    if (index !== -1) {
      product.variants[index] = { ...product.variants[index], ...variantData } as ProductVariant;
      return product.variants[index];
    }
  } else {
    // Create new variant
    const newVariant: ProductVariant = {
      id: uuidv4(),
      name: variantData.name || 'New Variant',
      price: variantData.price || 0,
      stockQuantity: variantData.stockQuantity || 0,
      attributes: variantData.attributes || {},
    };
    product.variants.push(newVariant);
    return newVariant;
  }
  return undefined;
};

const mockDeleteVariant = (productId: string, variantId: string): boolean => {
  const product = mockProducts.find(p => p.id === productId);
  if (!product) return false;
  
  const initialLength = product.variants.length;
  product.variants = product.variants.filter(v => v.id !== variantId);
  return product.variants.length < initialLength;
};

const VariantManagementPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const refreshProduct = () => {
    if (id) {
      const fetchedProduct = getMockProductById(id);
      if (fetchedProduct) {
        // Create a deep copy to ensure state updates trigger re-renders correctly
        setProduct(JSON.parse(JSON.stringify(fetchedProduct)));
      } else {
        toast({
          title: "Error",
          description: "Product not found.",
          variant: "destructive",
        });
        navigate('/admin/products');
      }
    }
  };

  useEffect(() => {
    refreshProduct();
  }, [id]);

  const handleSaveVariant = (variantData: Partial<ProductVariant>) => {
    if (!product) return;
    setIsSaving(true);

    setTimeout(() => {
      const updatedVariant = mockUpdateVariant(product.id, variantData);
      
      if (updatedVariant) {
        refreshProduct();
        toast({
          title: "Success",
          description: `Variant ${updatedVariant.name} saved successfully.`,
        });
        setIsFormOpen(false);
        setEditingVariant(undefined);
      } else {
        toast({
          title: "Error",
          description: "Failed to save variant.",
          variant: "destructive",
        });
      }
      setIsSaving(false);
    }, 500);
  };

  const handleDeleteVariant = (variantId: string, variantName: string) => {
    if (!product) return;
    if (window.confirm(`Are you sure you want to delete variant: ${variantName}?`)) {
      if (mockDeleteVariant(product.id, variantId)) {
        refreshProduct();
        toast({ title: "Deleted", description: `Variant ${variantName} deleted.` });
      } else {
        toast({ title: "Error", description: "Failed to delete variant.", variant: "destructive" });
      }
    }
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setIsFormOpen(true);
  };

  const handleNew = () => {
    setEditingVariant(undefined);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingVariant(undefined);
  };

  const columns: ColumnDef<ProductVariant>[] = useMemo(() => [
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
        
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleEdit(variant)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteVariant(variant.id, variant.name)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [product]);


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
            <Button onClick={handleNew}>
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
      
      {/* Variant Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingVariant ? 'Edit Product Variant' : 'Add New Product Variant'}</DialogTitle>
          </DialogHeader>
          <VariantForm
            productId={product.id}
            initialVariant={editingVariant}
            onSubmit={handleSaveVariant}
            onCancel={handleCancel}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default VariantManagementPage;