"use client";

import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Heart, ShoppingCart, Palette, MessageSquare, Info } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import { Product, ProductActionButton, ImageSizes } from '@/types';
import { getAllMockProducts } from '@/utils/productUtils';
import { useCheckoutSettingsStore } from '@/stores/checkoutSettingsStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useContentStore } from '@/stores/contentStore';
import { cn } from '@/lib/utils';
import ProgressiveImage from '@/components/common/ProgressiveImage'; // NEW IMPORT

// Helper to get query parameters
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

function ProductCatalog() {
  const navigate = useNavigate();
  const query = useQuery();
  const urlCategory = query.get('category') || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [sortBy, setSortBy] = useState('name');
  
  const { addItem } = useCartStore();
  const { toast } = useToast();
  const { currencySymbol } = useCheckoutSettingsStore();
  const { contactInfo } = useContentStore();

  // State for More Info Dialog
  const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);
  const [moreInfoContent, setMoreInfoContent] = useState('');
  const [moreInfoTitle, setMoreInfoTitle] = useState('');

  const mockProducts = getAllMockProducts();

  // Update selectedCategory state if the URL changes
  React.useEffect(() => {
    setSelectedCategory(urlCategory);
  }, [urlCategory]);

  const filteredProducts = useMemo(() => {
    let filtered = mockProducts.filter(product => 
      product.isActive &&
      (searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.discountedPrice || a.basePrice) - (b.discountedPrice || b.basePrice);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, sortBy, mockProducts]);

  const categories = ['all', ...Array.from(new Set(mockProducts.map(p => p.category)))];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Update URL query parameter
    const newQuery = new URLSearchParams();
    if (category !== 'all') {
      newQuery.set('category', category.toLowerCase());
    }
    navigate({ search: newQuery.toString() }, { replace: true });
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, product.variants[0]?.id, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };
  
  const handleMoreInfo = (product: Product) => {
    if (product.moreInfoContent) {
      setMoreInfoTitle(product.name);
      setMoreInfoContent(product.moreInfoContent);
      setIsMoreInfoOpen(true);
    } else {
      toast({
        title: "No Information",
        description: "The admin has not provided additional information for this product.",
        variant: "default",
      });
    }
  };
  
  const renderCardButton = (product: Product, buttonType: ProductActionButton) => {
    switch (buttonType) {
      case 'customize':
        return (
          <Button 
            key="customize"
            variant="outline" 
            className="w-full h-8 text-xs" 
            size="sm"
            onClick={() => navigate(`/products/${product.id}`)}
          >
            Customize
          </Button>
        );
      case 'quick_add':
        return (
          <Button 
            key="quick_add"
            className="w-full h-8 text-xs" 
            size="sm"
            onClick={() => handleAddToCart(product)}
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            Quick Add
          </Button>
        );
      case 'contact':
        return (
          <Button 
            key="contact"
            variant="secondary" 
            className="w-full h-8 text-xs" 
            size="sm"
            onClick={() => navigate('/contact')}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Contact
          </Button>
        );
      case 'more_info':
        return (
          <Button 
            key="more_info"
            variant="outline" 
            className="w-full h-8 text-xs" 
            size="sm"
            onClick={() => handleMoreInfo(product)}
          >
            <Info className="h-3 w-3 mr-1" />
            More Info
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Product Catalog</h1>
          <p className="text-gray-600">Discover our customizable products</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.slice(1).map(category => (
                  <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProducts.map((product) => {
            const price = product.discountedPrice || product.basePrice;
            const hasDiscount = product.discountedPrice && product.discountedPrice < product.basePrice;
            const primaryButton = product.actionButtons.find(btn => btn === 'customize' || btn === 'quick_add');
            
            // Determine if we should center the price (only one button visible)
            const singleButtonMode = product.actionButtons.length === 1;
            
            // Use the first image sizes object
            const imageSizes = product.images[0] || { small: '/placeholder.svg', medium: '/placeholder.svg', large: '/placeholder.svg' };

            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative cursor-pointer" onClick={() => navigate(`/products/${product.id}`)}>
                  <div className="aspect-square bg-gray-100">
                    <ProgressiveImage 
                      sizes={imageSizes}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="absolute top-2 left-2">
                    {hasDiscount && (
                      <Badge variant="destructive" className="text-xs">
                        Sale
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <CardHeader className="pb-3 p-3 md:p-6">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs">{product.category}</Badge>
                  </div>
                  <CardTitle className="text-base md:text-lg">{product.name}</CardTitle>
                  <CardDescription className="text-xs hidden md:block">{product.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-0 p-3 md:p-6">
                  <div className={cn(
                    "flex items-center mb-3",
                    singleButtonMode ? "justify-center" : "justify-between"
                  )}>
                    <div className="flex flex-col items-start space-y-0">
                      <span className="text-base font-bold text-green-600">
                        {currencySymbol}{price.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-gray-500 line-through">
                          {currencySymbol}{product.basePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    {/* Primary action button (if only one button is configured, it will be the only element in the row) */}
                    {!singleButtonMode && primaryButton && (
                      <Button size="sm" className="h-8 text-xs" onClick={() => navigate(`/products/${product.id}`)}>
                        {primaryButton === 'customize' ? 'Customize' : 'View Details'}
                      </Button>
                    )}
                  </div>

                  {/* Dynamic Button Row */}
                  <div className={cn(
                    "space-y-2",
                    product.actionButtons.length > 1 ? "grid grid-cols-2 gap-2" : "grid grid-cols-1 gap-2"
                  )}>
                    {product.actionButtons.map(btn => renderCardButton(product, btn))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* More Info Dialog */}
      <Dialog open={isMoreInfoOpen} onOpenChange={setIsMoreInfoOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>More Information: {moreInfoTitle}</span>
            </DialogTitle>
            <DialogDescription>
              Detailed product information provided by the seller.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {moreInfoContent}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default ProductCatalog;