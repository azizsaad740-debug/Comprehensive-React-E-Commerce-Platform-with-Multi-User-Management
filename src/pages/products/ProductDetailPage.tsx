"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Heart, ShoppingCart, ArrowLeft, Palette } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import { Product, ProductCustomization } from '@/types';
import ProductCustomizationForm from '@/components/products/ProductCustomizationForm.tsx';
import { getMockProductById } from '@/utils/productUtils';

// Helper function to determine if customization is meaningful
const isCustomizationMeaningful = (customization: ProductCustomization, initialCustomization: ProductCustomization): boolean => {
  const hasText = customization.texts.some(text => text.trim().length > 0);
  const hasFontChange = customization.font !== initialCustomization.font;
  const hasStartDesign = customization.startDesign && customization.startDesign !== initialCustomization.startDesign;
  const hasEndDesign = customization.endDesign && customization.endDesign !== initialCustomization.endDesign;
  
  return hasText || hasFontChange || hasStartDesign || hasEndDesign;
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Product['variants'][number] | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [initialCustomization, setInitialCustomization] = useState<ProductCustomization | null>(null);
  const [customization, setCustomization] = useState<ProductCustomization | null>(null);

  useEffect(() => {
    if (id) {
      const fetchedProduct = getMockProductById(id);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        setSelectedVariant(fetchedProduct.variants[0]);
        
        // Initialize customization state based on product options
        const initialCustom: ProductCustomization = {
          texts: [''], // Start with one empty text field
          font: fetchedProduct.customizationOptions.fonts[0] || '',
          startDesign: fetchedProduct.customizationOptions.startDesigns?.[0] || undefined,
          endDesign: fetchedProduct.customizationOptions.endDesigns?.[0] || undefined,
          previewImage: '',
          svgFile: ''
        };
        setInitialCustomization(initialCustom);
        setCustomization(initialCustom);
      } else {
        // Handle product not found
        navigate('/products');
        toast({
          title: "Product Not Found",
          description: `Product with ID ${id} does not exist.`,
          variant: "destructive",
        });
      }
    }
  }, [id, navigate, toast]);

  const handleCustomizationChange = useCallback((newCustomization: ProductCustomization) => {
    setCustomization(newCustomization);
  }, []);

  if (!product || !customization || !initialCustomization) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading product details...</p>
        </div>
      </Layout>
    );
  }

  const price = selectedVariant?.price || product.basePrice;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.basePrice;
  const finalPrice = hasDiscount ? product.discountedPrice! : price;

  const handleAddToCart = () => {
    let customizationToPass: ProductCustomization | undefined = undefined;

    if (isCustomizationMeaningful(customization, initialCustomization)) {
      // Clean up empty text fields if customization is meaningful
      const cleanedCustomization: ProductCustomization = {
        ...customization,
        texts: customization.texts.filter(text => text.trim().length > 0),
      };
      customizationToPass = cleanedCustomization;
    }

    addItem(product, selectedVariant?.id, quantity, customizationToPass);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/products')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={product.images[currentImageIndex] || '/placeholder.svg'} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline">{product.category}</Badge>
                {product.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-medium">4.8</span>
                  <span className="text-gray-500">(124 reviews)</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{product.description}</p>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-green-600">
                    ${finalPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-gray-500 line-through">
                      ${price.toFixed(2)}
                    </span>
                  )}
                </div>
                {hasDiscount && (
                  <Badge variant="destructive">
                    {Math.round(((price - finalPrice) / price) * 100)}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Options */}
            <div className="space-y-4">
              {product.variants.length > 0 && (
                <div>
                  <Label htmlFor="variant" className="text-base font-medium">Variant</Label>
                  <Select value={selectedVariant?.id} onValueChange={(value) => {
                    const variant = product.variants.find(v => v.id === value);
                    setSelectedVariant(variant);
                  }}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.variants.map(variant => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.name} - ${variant.price.toFixed(2)} ({variant.stockQuantity} in stock)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="quantity" className="text-base font-medium">Quantity</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={selectedVariant?.stockQuantity || product.stockQuantity || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(selectedVariant?.stockQuantity || product.stockQuantity || 1, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleAddToCart}
                disabled={!selectedVariant && product.variants.length > 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <Heart className="h-5 w-5 mr-2" />
                Add to Wishlist
              </Button>
            </div>

            {/* Product Features */}
            <div className="border-t pt-6">
              <h3 className="font-medium mb-3">Product Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• High-quality cotton material</li>
                <li>• Machine washable</li>
                <li>• Custom printing available</li>
                <li>• Fast shipping within 3-5 days</li>
                <li>• 30-day return policy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Customization Section */}
        <div className="mt-12">
          <Tabs defaultValue="customization" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="customization">Customization</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customization" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 mr-2" />
                    Customize Your Product
                  </CardTitle>
                  <CardDescription>
                    Add your personal touch with custom text, fonts, and designs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductCustomizationForm
                    product={product}
                    initialCustomization={initialCustomization}
                    onCustomizationChange={handleCustomizationChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-medium">4.8 out of 5</span>
                      <span className="text-gray-500">(124 reviews)</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border-b pb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">Sarah Johnson</span>
                          <span className="text-gray-500 text-sm">2 weeks ago</span>
                        </div>
                        <p className="text-gray-600">
                          "Amazing quality! The printing came out exactly as I designed it. 
                          The t-shirt material feels great and the customization options are fantastic."
                        </p>
                      </div>
                      
                      <div className="border-b pb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">Mike Chen</span>
                          <span className="text-gray-500 text-sm">1 month ago</span>
                        </div>
                        <p className="text-gray-600">
                          "Fast shipping and excellent customer service. The custom design looks 
                          professional and the fabric is very comfortable. Will definitely order again!"
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Material & Care</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• 100% Cotton</li>
                        <li>• Pre-shrunk fabric</li>
                        <li>• Machine washable</li>
                        <li>• Iron on reverse side</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Printing Details</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• High-quality digital printing</li>
                        <li>• Fade-resistant colors</li>
                        <li>• Eco-friendly inks</li>
                        <li>• Professional finish</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Sizing</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Available in S, M, L, XL, XXL</li>
                        <li>• Unisex fit</li>
                        <li>• True to size</li>
                        <li>• Size chart available</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Delivery</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Production: 2-3 business days</li>
                        <li>• Shipping: 3-5 business days</li>
                        <li>• Free shipping on orders over $50</li>
                        <li>• International shipping available</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;