"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Heart, ShoppingCart, ArrowLeft, Palette, Type } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import CartSidebar from '@/components/cart/CartSidebar';
import { Product, ProductCustomization } from '@/types';

// Mock product data - in real app, this would come from API
const mockProduct: Product = {
  id: '1',
  name: 'Custom T-Shirt',
  sku: 'TS001',
  description: 'High-quality cotton t-shirt perfect for custom printing. Choose from various fonts, colors, and designs to create your unique style.',
  basePrice: 29.99,
  discountedPrice: 24.99,
  images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
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
    },
    {
      id: 'v2',
      name: 'Medium',
      price: 29.99,
      stockQuantity: 30,
      attributes: { size: 'M', color: 'White' }
    },
    {
      id: 'v3',
      name: 'Large',
      price: 29.99,
      stockQuantity: 25,
      attributes: { size: 'L', color: 'White' }
    }
  ],
  customizationOptions: {
    fonts: ['Arial', 'Times New Roman', 'Helvetica', 'Comic Sans', 'Impact'],
    startDesigns: ['Simple', 'Floral', 'Abstract', 'Geometric', 'Vintage'],
    endDesigns: ['Logo', 'Text', 'Pattern', 'Border', 'Frame'],
    maxCharacters: 50,
    allowedColors: ['Red', 'Blue', 'Green', 'Black', 'White', 'Gold', 'Silver']
  },
  printPaths: 1,
  isActive: true,
  tags: ['popular', 'bestseller'],
  createdAt: new Date(),
  updatedAt: new Date()
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const [selectedVariant, setSelectedVariant] = useState(mockProduct.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Customization state
  const [customization, setCustomization] = useState<ProductCustomization>({
    texts: [''],
    font: mockProduct.customizationOptions.fonts[0],
    startDesign: mockProduct.customizationOptions.startDesigns[0],
    endDesign: mockProduct.customizationOptions.endDesigns[0],
    previewImage: '',
    svgFile: ''
  });

  const price = selectedVariant?.price || mockProduct.basePrice;
  const hasDiscount = mockProduct.discountedPrice && mockProduct.discountedPrice < mockProduct.basePrice;
  const finalPrice = hasDiscount ? mockProduct.discountedPrice! : price;

  const handleAddToCart = () => {
    addItem(mockProduct, selectedVariant?.id, quantity, customization);
    toast({
      title: "Added to cart",
      description: `${mockProduct.name} has been added to your cart`,
    });
  };

  const handleTextChange = (index: number, value: string) => {
    const newTexts = [...customization.texts];
    newTexts[index] = value;
    setCustomization(prev => ({ ...prev, texts: newTexts }));
  };

  const addTextField = () => {
    if (customization.texts.length < 3) {
      setCustomization(prev => ({ ...prev, texts: [...prev.texts, ''] }));
    }
  };

  const removeTextField = (index: number) => {
    if (customization.texts.length > 1) {
      const newTexts = customization.texts.filter((_, i) => i !== index);
      setCustomization(prev => ({ ...prev, texts: newTexts }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
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
                src={mockProduct.images[currentImageIndex] || '/placeholder.svg'} 
                alt={mockProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {mockProduct.images.length > 1 && (
              <div className="flex space-x-2">
                {mockProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${mockProduct.name} ${index + 1}`}
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
                <Badge variant="outline">{mockProduct.category}</Badge>
                {mockProduct.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl font-bold mb-2">{mockProduct.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-medium">4.8</span>
                  <span className="text-gray-500">(124 reviews)</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{mockProduct.description}</p>
              
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
              <div>
                <Label htmlFor="variant" className="text-base font-medium">Size</Label>
                <Select value={selectedVariant?.id} onValueChange={(value) => {
                  const variant = mockProduct.variants.find(v => v.id === value);
                  setSelectedVariant(variant);
                }}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProduct.variants.map(variant => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.name} - ${variant.price.toFixed(2)} ({variant.stockQuantity} in stock)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                    max={selectedVariant?.stockQuantity || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(selectedVariant?.stockQuantity || 1, quantity + 1))}
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
                <CardContent className="space-y-6">
                  {/* Text Inputs */}
                  <div>
                    <Label className="text-base font-medium">Custom Text</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Maximum {mockProduct.customizationOptions.maxCharacters} characters per line
                    </p>
                    <div className="space-y-3">
                      {customization.texts.map((text, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder={`Line ${index + 1} text...`}
                            value={text}
                            onChange={(e) => handleTextChange(index, e.target.value)}
                            maxLength={mockProduct.customizationOptions.maxCharacters}
                          />
                          {customization.texts.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeTextField(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      {customization.texts.length < 3 && (
                        <Button variant="outline" onClick={addTextField}>
                          Add Another Line
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Font Selection */}
                  <div>
                    <Label className="text-base font-medium">Font Style</Label>
                    <Select 
                      value={customization.font} 
                      onValueChange={(value) => setCustomization(prev => ({ ...prev, font: value }))}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProduct.customizationOptions.fonts.map(font => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Design Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-base font-medium">Start Design</Label>
                      <Select 
                        value={customization.startDesign} 
                        onValueChange={(value) => setCustomization(prev => ({ ...prev, startDesign: value }))}
                      >
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProduct.customizationOptions.startDesigns.map(design => (
                            <SelectItem key={design} value={design}>
                              {design}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-base font-medium">End Design</Label>
                      <Select 
                        value={customization.endDesign} 
                        onValueChange={(value) => setCustomization(prev => ({ ...prev, endDesign: value }))}
                      >
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProduct.customizationOptions.endDesigns.map(design => (
                            <SelectItem key={design} value={design}>
                              {design}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Preview Area */}
                  <div className="border rounded-lg p-6 bg-gray-50">
                    <h4 className="font-medium mb-3">Live Preview</h4>
                    <div className="bg-white p-4 rounded border text-center min-h-[200px] flex items-center justify-center">
                      <div className="text-center">
                        {customization.texts.filter(text => text.trim()).map((text, index) => (
                          <div key={index} style={{ fontFamily: customization.font }} className="mb-2">
                            {text || 'Your text here'}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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

      <CartSidebar />
    </div>
  );
};

export default ProductDetailPage;