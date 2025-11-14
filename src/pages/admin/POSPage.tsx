"use client";

import React, { useState, useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, User, Package, Plus, Minus, Trash2, CheckCircle, RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllMockUsers } from '@/utils/userUtils';
import { getAllMockProducts, getMockProductById } from '@/utils/productUtils';
import { CartItem, Product, User as UserType, Address, ImageSizes } from '@/types';
import { useCheckoutSettingsStore } from '@/stores/checkoutSettingsStore';
import { createMockOrder } from '@/utils/orderUtils';
import { v4 as uuidv4 } from 'uuid';

// Mock Address for POS orders
const posAddress: Address = {
  id: uuidv4(),
  fullName: 'POS Customer',
  phone: 'N/A',
  street: 'POS Transaction',
  city: 'Admin',
  state: 'CA',
  zipCode: '00000',
  country: 'USA',
  isDefault: true,
};

interface POSCartItem extends CartItem {
  lineTotal: number;
}

const POSPage = () => {
  const { toast } = useToast();
  const { currencySymbol } = useCheckoutSettingsStore();
  const allUsers = getAllMockUsers().filter(u => u.role === 'customer' || u.role === 'reseller');
  const allProducts = getAllMockProducts().filter(p => p.isActive);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isLoading, setIsLoading] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState(''); // NEW: Search term state

  const selectedUser = useMemo(() => allUsers.find(u => u.id === selectedUserId), [selectedUserId, allUsers]);

  const filteredProducts = useMemo(() => {
    if (!productSearchTerm) return allProducts;
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
    );
  }, [allProducts, productSearchTerm]);

  const cartSummary = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
    const taxRate = 0.08;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }, [cart]);

  const handleAddProduct = (productId: string) => {
    const product = getMockProductById(productId);
    if (!product) return;

    const variant = product.variants[0]; // Use first variant for simplicity
    const price = product.discountedPrice || product.basePrice;
    
    // FIX: Access the small size URL for the preview image
    const previewImageUrl = (product.images[0] as ImageSizes)?.small || '/placeholder.svg';

    // Find item based on product ID and variant ID (if available)
    const existingItemIndex = cart.findIndex(item => item.productId === productId && item.variantId === variant?.id);

    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      updatedCart[existingItemIndex].lineTotal = updatedCart[existingItemIndex].quantity * price;
      setCart(updatedCart);
    } else {
      const newItem: POSCartItem = {
        productId: product.id,
        variantId: variant?.id,
        quantity: 1,
        product: product,
        customization: { texts: [], font: '', previewImage: previewImageUrl, svgFile: '' },
        lineTotal: price,
      };
      setCart(prev => [...prev, newItem]);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter((_, i) => i !== index));
      return;
    }
    
    setCart(prev => prev.map((item, i) => {
      if (i === index) {
        const price = item.product.discountedPrice || item.product.basePrice;
        return { ...item, quantity, lineTotal: quantity * price };
      }
      return item;
    }));
  };

  const handleRemoveItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast({ title: "Error", description: "Cart is empty.", variant: "destructive" });
      return;
    }
    if (!selectedUser) {
      toast({ title: "Error", description: "Please select a customer.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // Create a mock order object
      const orderData = {
        customerId: selectedUser.id,
        resellerId: selectedUser.resellerId,
        cartItems: cart,
        shippingAddress: posAddress,
        paymentMethod: paymentMethod,
        subtotal: cartSummary.subtotal,
        discountAmount: 0,
        shippingCost: 0,
        taxAmount: cartSummary.taxAmount,
        totalAmount: cartSummary.total,
        deliveryMethod: 'POS Pickup',
      };

      // This utility function handles order creation, stock reduction, and ledger entry (We Received Cash)
      const newOrder = createMockOrder(orderData);

      toast({
        title: "POS Order Placed",
        description: `Order ${newOrder.id} recorded for ${selectedUser.name}. Stock and Ledger updated.`,
      });

      // Reset POS state
      setCart([]);
      setSelectedUserId(null);
      setPaymentMethod('cash');

    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Failed to process POS order.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <ShoppingCart className="h-6 w-6 mr-3" />
            Point of Sale (POS)
          </h1>
          <Button variant="outline" onClick={() => setIsLoading(false)} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
        <p className="text-gray-600 mb-8">Quickly process in-person sales and manage inventory/ledger simultaneously.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Product Selection */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle>Product Selection</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search product name or SKU..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredProducts.map(product => (
                <Button 
                  key={product.id}
                  variant="outline"
                  className="w-full justify-between h-auto p-3"
                  onClick={() => handleAddProduct(product.id)}
                  disabled={isLoading || product.stockQuantity <= 0}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-xs text-gray-500">Stock: {product.stockQuantity}</span>
                  </div>
                  <span className="font-bold text-primary">
                    {currencySymbol}{(product.discountedPrice || product.basePrice).toFixed(2)}
                  </span>
                </Button>
              ))}
              {filteredProducts.length === 0 && (
                <p className="text-center text-sm text-gray-500 pt-4">No products found matching "{productSearchTerm}"</p>
              )}
            </CardContent>
          </Card>

          {/* Right Column: Cart & Checkout */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <User className="h-5 w-5" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedUserId || ''} 
                  onValueChange={setSelectedUserId}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Customer (Required)" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedUser && (
                  <p className="text-sm text-gray-500 mt-2">Selected: {selectedUser.name} ({selectedUser.role})</p>
                )}
              </CardContent>
            </Card>

            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500">Add products to start a sale.</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item, index) => {
                      const imageUrl = (item.product.images[0] as ImageSizes)?.small || '/placeholder.svg';
                      return (
                      <div key={index} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gray-100 rounded">
                            <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover rounded" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{item.product.name}</p>
                            <p className="text-xs text-gray-500">{item.product.variants[0]?.name || 'Default'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <div className="flex items-center space-x-1">
                            <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => handleQuantityChange(index, item.quantity - 1)} disabled={isLoading}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => handleQuantityChange(index, item.quantity + 1)} disabled={isLoading}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="font-bold w-16 text-right">
                            {currencySymbol}{item.lineTotal.toFixed(2)}
                          </span>
                          <Button size="icon" variant="destructive" className="h-6 w-6" onClick={() => handleRemoveItem(index)} disabled={isLoading}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )})}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment & Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment & Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select 
                    value={paymentMethod} 
                    onValueChange={setPaymentMethod}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Summary */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{currencySymbol}{cartSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>{currencySymbol}{cartSummary.taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Due</span>
                    <span>{currencySymbol}{cartSummary.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action */}
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isLoading || cart.length === 0 || !selectedUser}
                >
                  {isLoading ? <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                  {isLoading ? 'Processing...' : 'Complete Sale'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default POSPage;