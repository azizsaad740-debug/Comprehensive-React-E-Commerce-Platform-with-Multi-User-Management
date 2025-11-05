"use client";

import React, { useState, useMemo } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { Product } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '../../components/data-table/DataTable.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit, Trash2, Eye, Settings, Image, Wand2, PlusCircle, RefreshCw, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllMockProducts, updateMockProductImages, updateMockProduct } from '@/utils/productUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ImageGeneratorForm from '@/components/admin/ImageGeneratorForm';
import { useToast } from '@/hooks/use-toast';
import ProductForm from '@/components/admin/ProductForm'; // NEW IMPORT

// --- Image Management Modal Component ---

interface ImageManagementModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdate: () => void;
}

const ImageManagementModal: React.FC<ImageManagementModalProps> = ({ product, isOpen, onClose, onProductUpdate }) => {
  const [currentImages, setCurrentImages] = useState(product.images);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Sync images when product prop changes (e.g., modal opens)
  React.useEffect(() => {
    setCurrentImages(product.images);
  }, [product.images]);

  const handleImageSelected = (imageUrl: string) => {
    // Add the new image URL to the list
    setCurrentImages(prev => [imageUrl, ...prev.filter(img => img !== '/placeholder.svg')]);
  };
  
  const handleRemoveImage = (index: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSaveImages = () => {
    setIsSaving(true);
    
    // Ensure at least one image exists, use placeholder if empty
    const imagesToSave = currentImages.length > 0 ? currentImages : ['/placeholder.svg'];
    
    const updatedProduct = updateMockProductImages(product.id, imagesToSave);
    
    if (updatedProduct) {
      onProductUpdate();
      toast({ title: "Success", description: `Images for ${product.name} updated.` });
    } else {
      toast({ title: "Error", description: "Failed to update product images.", variant: "destructive" });
    }
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Image className="h-5 w-5" />
            <span>Image Management: {product.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: AI Generator */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Wand2 className="h-4 w-4 mr-2" /> AI Image Generator
            </h3>
            <ImageGeneratorForm 
              product={product} 
              onImageSelected={handleImageSelected} 
              onClose={() => { /* Keep modal open */ }}
            />
          </div>
          
          {/* Right Column: Current Images & Editor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Images ({currentImages.length})</h3>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto p-2 border rounded-lg">
              {currentImages.map((url, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img src={url} alt={`Product Image ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Image {index + 1}</p>
                    <p className="text-xs text-gray-500 truncate">{url}</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {currentImages.length === 0 && (
                <p className="text-center text-gray-500 py-4">No images added yet.</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                onClick={handleSaveImages} 
                disabled={isSaving}
              >
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save All Images
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Product Management Page ---

const ProductManagementPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use state to hold products to allow re-rendering after updates
  const [products, setProducts] = useState(getAllMockProducts());
  
  // State for Image Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  // State for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const refreshProducts = () => {
    // Force a refresh of the mock data
    setProducts(getAllMockProducts().map(p => ({ ...p })));
  };

  const handleOpenImageModal = (product: Product) => {
    setSelectedProduct(product);
    setIsImageModalOpen(true);
  };
  
  const handleOpenEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };
  
  const handleSaveProduct = (productData: Partial<Product>) => {
    if (!productData.id) {
      // Mock creation logic (simplified)
      const newProduct: Product = {
        id: `p${Date.now()}`,
        name: productData.name || 'New Product',
        sku: productData.sku || 'NEW-SKU',
        description: productData.description || '',
        basePrice: productData.basePrice || 0,
        images: ['/placeholder.svg'],
        category: productData.category || 'General',
        stockQuantity: productData.stockQuantity || 0,
        variants: [],
        customizationOptions: productData.customizationOptions || { fonts: [], maxCharacters: 50 },
        printPaths: productData.printPaths || 1,
        isActive: productData.isActive ?? true,
        tags: productData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Product;
      
      // Manually push to mockProducts array (since updateMockProduct only handles updates)
      getAllMockProducts().push(newProduct);
      
      refreshProducts();
      toast({
        title: "Success",
        description: `Product ${newProduct.name} created successfully.`,
      });
      handleCloseEditModal();
      setIsSavingProduct(false);
      return;
    }
    
    setIsSavingProduct(true);
    
    setTimeout(() => {
      const updatedProduct = updateMockProduct(productData);
      
      if (updatedProduct) {
        refreshProducts();
        toast({
          title: "Success",
          description: `Product ${updatedProduct.name} updated successfully.`,
        });
        handleCloseEditModal();
      } else {
        toast({
          title: "Error",
          description: "Failed to update product.",
          variant: "destructive",
        });
      }
      setIsSavingProduct(false);
    }, 500);
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
            <Button variant="destructive" size="sm" title="Delete Product">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [navigate]);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <Button onClick={() => handleOpenEditModal({} as Product)}>
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
          onProductUpdate={refreshProducts}
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