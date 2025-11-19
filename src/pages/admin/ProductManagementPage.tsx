"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { Product, ImageSizes } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '../../components/data-table/DataTable.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit, Trash2, Eye, Settings, Image, PlusCircle, RefreshCw, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllMockProducts, updateMockProduct, deleteMockProduct, createMockProduct, getMockProductById } from '@/utils/productUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ProductForm from '@/components/admin/ProductForm';
import ImageManagementModal from '@/components/admin/ImageManagementModal';

// Helper to generate mock ImageSizes from a base URL (copied from productUtils for local use)
const generateMockImageSizes = (baseUrl: string): ImageSizes => ({
  small: `${baseUrl}?size=small`,
  medium: `${baseUrl}?size=medium`,
  large: `${baseUrl}?size=large`,
});

const ProductManagementPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Fetch all products, including inactive ones for admin view
      const fetchedProducts = await getAllMockProducts(true);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast({ title: "Error", description: "Failed to load product data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenImageModal = (product: Product) => {
    setSelectedProduct(product);
    setIsImageModalOpen(true);
  };
  
  const handleOpenEditModal = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
    } else {
      // Create a temporary object for the form to use as initial data for creation
      setSelectedProduct({} as Product); 
    }
    setIsEditModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };
  
  const handleSaveProduct = async (productData: Partial<Product>) => {
    setIsSavingProduct(true);
    
    try {
      let updatedProduct: Product | undefined;
      
      if (productData.id) {
        // Update existing product
        updatedProduct = await updateMockProduct(productData);
      } else {
        // Create new product
        const productToCreate = {
          ...productData,
          images: productData.images || [generateMockImageSizes('/placeholder.svg')], 
          variants: [], 
          customizationOptions: productData.customizationOptions || { fonts: [], maxCharacters: 50 },
          printPaths: productData.printPaths || 1,
          isActive: productData.isActive ?? true,
          tags: productData.tags || [],
        } as Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'variants'>;
        
        updatedProduct = await createMockProduct(productToCreate);
      }
      
      if (updatedProduct) {
        await fetchProducts();
        toast({
          title: "Success",
          description: `Product ${updatedProduct.name} saved successfully.`,
        });
        handleCloseEditModal();
      } else {
        throw new Error("Failed to save product.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProduct(false);
    }
  };
  
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete the product: ${productName}? This action cannot be undone.`)) {
      try {
        const success = await deleteMockProduct(productId);
        if (success) {
          await fetchProducts();
          toast({
            title: "Product Deleted",
            description: `${productName} has been permanently removed.`,
            variant: "destructive",
          });
        } else {
          throw new Error("Deletion failed.");
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete product.",
          variant: "destructive",
        });
      }
    }
  };

  const columns: ColumnDef<Product>[] = useMemo(() => [
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
        const product = row.original;
        return (
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" onClick={() => handleOpenImageModal(product)} title="Manage Images (AI)">
              <Image className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/products/${product.id}`)} title="View Product">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/products/${product.id}/variants`)} title="Manage Variants">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(product)} title="Edit Product">
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              title="Delete Product"
              onClick={() => handleDeleteProduct(product.id, product.name)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [navigate, fetchProducts]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Loading Products...</h1>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <Button onClick={() => handleOpenEditModal()}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </div>
        <p className="text-gray-600 mb-8">Manage inventory, pricing, and product details.</p>

        <DataTable 
          columns={columns} 
          data={products} 
          filterColumnId="name"
          filterPlaceholder="Filter by product name..."
        />
      </div>
      
      {/* Image Management Modal */}
      {selectedProduct && (
        <ImageManagementModal
          product={selectedProduct}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onProductUpdate={fetchProducts}
        />
      )}
      
      {/* Product Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.id ? `Edit Product: ${selectedProduct.name}` : 'Create New Product'}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              initialProduct={selectedProduct.id ? selectedProduct : undefined}
              onSubmit={handleSaveProduct}
              onCancel={handleCloseEditModal}
              isSaving={isSavingProduct}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ProductManagementPage;