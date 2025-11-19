"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Heart, ShoppingCart, ArrowLeft, Palette, MessageSquare, Info, Loader2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import { Product, ProductActionButton, ImageSizes } from '@/types';
import { getMockProductById } from '@/utils/productUtils';
import { useCheckoutSettingsStore } from '@/stores/checkoutSettingsStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ProgressiveImage from '@/components/common/ProgressiveImage';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  // Removed designId check here as the router handles the /design path

  const { addItem } = useCartStore();
  const { toast } = useToast();
  const { currencySymbol } = useCheckoutSettingsStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Product['variants'][number] | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProduct = async () => {
    if (!id) {
      navigate('/products');
      return;
    }
    setIsLoading(true);

    try {
      const fetchedProduct = await getMockProductById(id);
      if (!fetchedProduct) {
        navigate('/products');
        toast({
          title: "Product Not Found",
          description: `Product with ID ${id} does not exist.`,
          variant: "destructive",
        });
        return;
      }

      setProduct(fetchedProduct);
      setSelectedVariant(fetchedProduct.variants[0]);
      
      // Removed: if (designId) { navigate(`/products/${id}/design?designId=${designId}`, { replace: true }); }
      
    } catch (error) {
      console.error("Failed to fetch product:", error);
      toast({ title: "Error", description: "Failed to load product details.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-128px)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
        </div>
      </Layout>
    );
  }

  // --- Price Calculation Logic ---
  const basePrice = selectedVariant?.price || product.basePrice;
  
  const finalPrice = product.discountedPrice && product.discountedPrice < basePrice
    ? product.discountedPrice
    : basePrice;
    
  const hasDiscount = finalPrice < basePrice;
  const originalPrice = basePrice;
  // -------------------------------
  
  const currentImageSizes: ImageSizes = product.images[currentImageIndex] || { small: '/placeholder.svg', medium: '/placeholder.svg', large: '/placeholder.svg' };

  const handleAddToCart = () => {
    addItem(product, selectedVariant?.id, quantity);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };
  
  const handleCustomize = () => {
    navigate(`/products/${product.id}/design`);
  };
  
  const handleContact = () => {
    navigate('/contact');
  };
  
  const handleMoreInfo = () => {
    if (product.moreInfoContent) {
      setIsMoreInfoOpen(true);
    } else {
      toast({
        title: "No Information",
        description: "The admin has not provided additional information for this product.",
        variant: "default",
      });
    }
  };
  
  const renderActionButton = (buttonType: ProductActionButton) => {
    switch (buttonType) {
      case 'customize':
        return (
          <Button 
            key="customize"
            variant="default" 
            className="w-full" 
            size="lg"
            onClick={handleCustomize}
          >
            <Palette className="h-5 w-5 mr-2" />
            Start Customizing
          </Button>
        );
      case 'quick_add':
        return (
          <Button 
            key="quick_add"
            className="w-full" 
            size="lg"
            onClick={handleAddToCart}
            disabled={!selectedVariant && product.variants.length > 0}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Quick Add to Cart
          </Button>
        );
      case 'contact':
        return (
          <Button 
            key="contact"
            variant="outline" 
            className="w-full" 
            size="lg"
            onClick={handleContact}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Contact Us
          </Button>
        );
      case 'more_info':
        return (
          <Button 
            key="more_info"
            variant="outline" 
            className="w-full" 
            size="lg"
            onClick={handleMoreInfo}
          >
            <Info className="h-5 w-5 mr-2" />
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
              <ProgressiveImage 
                sizes={currentImageSizes}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((imageSizes, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={imageSizes.small} // Use small size for thumbnail
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
                    {currencySymbol}{finalPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-gray-500 line-through">
                      {currencySymbol}{originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {hasDiscount && (
                  <Badge variant="destructive">
                    {Math.round(((originalPrice - finalPrice) / originalPrice) * 100)}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Options */}
            <div className="space-y-4">
              {product.variants.length > 0 && (
                <div>
                  <Label htmlFor="variant" className="text-base font-medium">Variant</Label>
                  <Select 
                    value={selectedVariant?.id} 
                    onValueChange={(value) => {
                      const variant = product.variants.find(v => v.id === value);
                      setSelectedVariant(variant);
                    }}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.variants.map(variant => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.name} - {currencySymbol}{variant.price.toFixed(2)} ({variant.stockQuantity} in stock)
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

            {/* Action Buttons (Dynamic) */}
            <div className="space-y-2">
              {product.actionButtons.map(renderActionButton)}
              
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

        {/* Tabs Section (Reviews/Specs remain) */}
        <div className="mt-12">
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="customization" disabled>Customization (Moved to Editor)</TabsTrigger>
            </TabsList>
            
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
                        <li>• Size chart available</li>
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
                        <li>• Free shipping on orders over {currencySymbol}50</li>
                        <li>• International shipping available</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="customization" className="mt-6">
              {/* This tab is now disabled and serves as a placeholder */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* More Info Dialog */}
      <Dialog open={isMoreInfoOpen} onOpenChange={setIsMoreInfoOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>More Information: {product.name}</span>
            </DialogTitle>
            <DialogDescription>
              Detailed product information provided by the seller.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {product.moreInfoContent}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductDetailPage;