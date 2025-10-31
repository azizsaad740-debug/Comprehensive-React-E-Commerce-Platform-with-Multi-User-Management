"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Custom T-Shirt',
    sku: 'TS001',
    description: 'High-quality cotton t-shirt perfect for custom printing',
    basePrice: 29.99,
    discountedPrice: 24.99,
    images: ['/placeholder.svg'],
    category: 'Apparel',
    subcategory: 'T-Shirts',
    stockQuantity: 50,
    variants: [
      {
        id: 'v1',
        name: 'Small',
        price: 29.99,
        stockQuantity: 20,
        attributes: { size: 'S', color: 'White' }
      }
    ],
    customizationOptions: {
      fonts: ['Arial', 'Times New Roman'],
      startDesigns: ['Simple', 'Floral'],
      endDesigns: ['Logo', 'Text'],
      maxCharacters: 50
    },
    printPaths: 1,
    isActive: true,
    tags: ['popular'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Personalized Mug',
    sku: 'MG001',
    description: 'Ceramic mug with custom printing',
    basePrice: 19.99,
    images: ['/placeholder.svg'],
    category: 'Drinkware',
    stockQuantity: 100,
    variants: [
      {
        id: 'v2',
        name: 'Standard',
        price: 19.99,
        stockQuantity: 100,
        attributes: { material: 'Ceramic' }
      }
    ],
    customizationOptions: {
      fonts: ['Arial', 'Comic Sans'],
      startDesigns: ['Minimalist', 'Vintage'],
      endDesigns: ['Simple', 'Clean'],
      maxCharacters: 25
    },
    printPaths: 1,
    isActive: true,
    tags: ['new'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

function ProductCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    let filtered = mockProducts.filter(product => 
      product.isActive &&
      (searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === 'all' || product.category === selectedCategory)
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
  }, [searchTerm, selectedCategory, sortBy]);

  const categories = ['all', ...Array.from(new Set(mockProducts.map(p => p.category)))];

  const handleAddToCart = (product: Product) => {
    addItem(product, undefined, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  return (
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

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.slice(1).map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const price = product.discountedPrice || product.basePrice;
          const hasDiscount = product.discountedPrice && product.discountedPrice < product.basePrice;
          
          return (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="aspect-square bg-gray-100">
                  <img 
                    src={product.images[0] || '/placeholder.svg'} 
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

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-green-600">
                      ${price.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.basePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">4.5</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    Customize
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default ProductCatalog;