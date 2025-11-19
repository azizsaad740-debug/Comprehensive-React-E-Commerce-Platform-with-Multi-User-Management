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
import { getMockProductById, getProductVariants, addOrUpdateProductVariant, deleteProductVariant } from '@/utils/productUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VariantForm from '@/components/admin/VariantForm';

const VariantManagementPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProductAndVariants = async () => {
    if (!id) return;
    setIsLoading(true);
    
    try {
      const fetchedProduct = await getMockProductById(id);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        const fetchedVariants = await getProductVariants(id);
        setVariants(fetchedVariants);
      } else {
        toast({
          title: "Error",
          description: "Product not found.",
          variant: "destructive",
        });
        navigate('/admin/products');
      }
    } catch (error) {
      console.error("Failed to fetch product/variants:", error);
      toast({
        title: "Error",
        description: "Failed to load product data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductAndVariants();
  }, [id]);

  const handleSaveVariant = async (variantData: Partial<ProductVariant>) => {
    if (!product) return;
    setIsSaving(true);

    try {
      const updatedVariant = await addOrUpdateProductVariant(product.id, variantData);
      
      if (updatedVariant) {
        await fetchProductAndVariants(); // Refresh data
        toast({
          title: "Success",
          description: `Variant ${updatedVariant.name} saved successfully.`,
        });
        setIsFormOpen(false);
        setEditingVariant(undefined);
      } else {
        throw new Error("Failed to save variant.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save variant.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: string, variantName: string) => {
    if (!product) return;
    if (window.confirm(`Are you sure you want to delete variant: ${variantName}?`)) {
      try {
        const success = await deleteProductVariant(variantId);
        if (success) {
          await fetchProductAndVariants(); // Refresh data
          toast({ title: "Deleted", description: `Variant ${variantName} deleted.` });
        } else {
          throw new Error("Deletion failed.");
        }
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to delete variant.", variant: "destructive" });
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
  ], [variants]);


  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Loading Product Variants...</h1>
        </div>
      </AdminLayout>
    );
  }
  
  if (!product) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Product Not Found</h1>
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
            <CardTitle>Product Variants ({variants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={variants} 
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