"use client";

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, ShoppingBag, Palette, Truck, Heart } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import { getAllMockProducts, getMockProductById } from '@/utils/productUtils';
import { Product } from '@/types';
import HeroSlideshow from '@/components/layout/HeroSlideshow'; // Import new component

const features = [
  {
    icon: <Palette className="h-6 w-6" />,
    title: 'Custom Designs',
    description: 'Create unique designs with our easy-to-use customization tools'
  },
  {
    icon: <ShoppingBag className="h-6 w-6" />,
    title: 'Premium Quality',
    description: 'High-quality materials and printing for lasting results'
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Fast Shipping',
    description: 'Quick delivery to your doorstep with tracking'
  }
];

const Index = () => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const allProducts = getAllMockProducts();
  
  // Use specific product IDs for featured products
  const featuredProductIds = ['1', '2', '3']; 
  
  const featuredProducts = useMemo(() => {
    return featuredProductIds
      .map(id => getMockProductById(id))
      .filter((p): p is Product => !!p);
  }, [allProducts]);


  const handleAddToCart = (product: Product) => {
    // For quick add, we assume the first variant and no customization
    addItem(product, product.variants[0]?.id, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  return (
    <Layout>
      {/* Hero Section - Now Dynamic Slideshow */}
      <HeroSlideshow />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose CustomPrint?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most popular customizable products with thousands of happy customers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => {
              const price = product.discountedPrice || product.basePrice;
              const originalPrice = product.basePrice;
              
              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-100 relative">
                    <img 
                      src={product.images[0] || '/placeholder.svg'} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{product.category}</Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">
                          4.8 (124) {/* Mock rating/reviews */}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-green-600">
                          ${price.toFixed(2)}
                        </span>
                        {originalPrice > price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Button size="sm" onClick={() => navigate(`/products/${product.id}`)}>
                        Customize
                      </Button>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleAddToCart(product)}
                      >
                        Quick Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/products')}
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Apparel', 'Drinkware', 'Accessories', 'Home & Living'].map((category) => (
              <Card 
                key={category} 
                className="text-center hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/products?category=${category.toLowerCase()}`)}
              >
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-medium">{category}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have created amazing custom products with us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => navigate('/auth/register')}
            >
              Get Started Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => navigate('/products')}
            >
              Browse Products
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;