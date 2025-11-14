"use client";

import React, { useState, useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, User, Package, Plus, Minus, Trash2, CheckCircle, RefreshCw, Search, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllMockUsers } from '@/utils/userUtils';
import { getAllMockProducts, getMockProductById } from '@/utils/productUtils';
import { CartItem, Product, User as UserType, Address, ImageSizes, POS_GUEST_ID } from '@/types';
import { useCheckoutSettingsStore } from '@/stores/checkoutSettingsStore';
import { createMockOrder } from '@/utils/orderUtils';
import { v4 as uuidv4 } from 'uuid';
import BarcodeManualInput from '@/components/admin/BarcodeManualInput';
import BarcodeScannerCamera from '@/components/admin/BarcodeScannerCamera'; // NEW IMPORT
import { logOperatorActivity } from '@/utils/operatorUtils';
import { useAuthStore } from '@/stores/authStore';
import { useIsMobile } from '@/hooks/use-mobile'; // NEW IMPORT

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

type TaxMode = 'include' | 'exclude' | 'hide';

const POSPage = () => {
  const { toast } = useToast();
  const { currencySymbol } = useCheckoutSettingsStore();
  const { user: operator } = useAuthStore();
  const isMobile = useIsMobile(); // Use hook
  
  const allUsers = getAllMockUsers().filter(u => u.role === 'customer' || u.role === 'reseller');
  const allProducts = getAllMockProducts().filter(p => p.isActive);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isLoading, setIsLoading] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  
  // NEW: Tax state
  const [taxMode, setTaxMode] = useState<TaxMode>('exclude');
  const TAX_RATE = 0.08;

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
    
    let taxAmount = 0;
    let total = subtotal;
    
    if (taxMode !== 'hide') {
      if (taxMode === 'exclude') {
        taxAmount = subtotal * TAX_RATE;
        total = subtotal + taxAmount;
      } else if (taxMode === 'include') {
        // If tax is included, the subtotal already contains the tax amount
        taxAmount = subtotal * (TAX_RATE / (1 + TAX_RATE));
        total = subtotal;
      }
    }
    
    return { 
      subtotal: taxMode === 'include' ? subtotal - taxAmount : subtotal, 
      taxAmount, 
      total,
      displaySubtotal: subtotal, // The sum of line totals before tax adjustment
    };
  }, [cart, taxMode]);

  const handleAddProduct = (productId: string) => {
    const product = getMockProductById(productId);
    if (!product) {
      toast({ title: "Product Not Found", description: `Product ID/SKU ${productId} not found.`, variant: "destructive" });
      return;
    }

    const variant = product.variants[0]; // Use first variant for simplicity
    const price = product.discountedPrice || product.basePrice;
    
    const previewImageUrl = (product.images[0] as ImageSizes)?.small || '/placeholder.svg';

    const existingItemIndex = cart.findIndex(item => item.productId === product.id && item.variantId === variant?.id);

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
    if (!operator) {
        toast({ title: "Error", description: "Operator session expired. Please log in again.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    
    // Determine customer ID for order and ledger
    const customerId = selectedUser?.id || POS_GUEST_ID;
    const customerName = selectedUser?.name || 'POS Guest';

    try {
      // Create a mock order object
      const orderData = {
        customerId: customerId,
        resellerId: selectedUser?.resellerId,
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

      const newOrder = createMockOrder(orderData);
      
      // Log POS Sale Activity
      logOperatorActivity(
          operator.id, 
          'sale', 
          `Order ${newOrder.id} processed for customer ${customerName}. Total: ${currencySymbol}${newOrder.totalAmount.toFixed(2)}`
      );

      toast({
        title: "POS Order Placed",
        description: `Order ${newOrder.id} recorded for ${customerName}. Stock and Ledger updated.`,
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
          <Button variant="outline" onClick={() => { setCart([]); setSelectedUserId(null); setPaymentMethod('cash'); }} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
        <p className="text-gray-600 mb-8">Quickly process in-person sales and manage inventory/ledger simultaneously.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Product Selection */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Camera Scanner (Priority on Mobile) */}
            {isMobile && (
              <BarcodeScannerCamera 
                onProductScanned={handleAddProduct} 
                disabled={isLoading}
              />
            )}
            
            {/* Manual Input (Fallback/Desktop) */}
            <BarcodeManualInput 
              onProductScanned={handleAddProduct} 
              disabled={isLoading}
            />
            
            {/* Product Search */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Product Search</CardTitle>
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
              <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
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
          </div>

          {/* Right Column: Cart & Checkout */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection (Now Optional) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <User className="h-5 w-5" />
                  Customer (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedUserId || ''} 
                  onValueChange={setSelectedUserId}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Customer (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-- POS Guest --</SelectItem>
                    {allUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-2">
                  Selected: {selectedUser ? `${selectedUser.name} (${selectedUser.role})` : 'POS Guest'}
                </p>
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
                {/* Tax Configuration */}
                <div className="space-y-2 border p-3 rounded-lg">
                  <Label htmlFor="taxMode" className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Tax Configuration (Rate: {TAX_RATE * 100}%)</span>
                  </Label>
                  <Select 
                    value={taxMode} 
                    onValueChange={(val) => setTaxMode(val as TaxMode)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exclude">Exclude Tax (Add to Subtotal)</SelectItem>
                      <SelectItem value="include">Include Tax (Subtotal is Total)</SelectItem>
                      <SelectItem value="hide">Hide Tax (No Tax Applied)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
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
                    <span>{currencySymbol}{cartSummary.displaySubtotal.toFixed(2)}</span>
                  </div>
                  
                  {taxMode !== 'hide' && (
                    <div className="flex justify-between">
                      <span>Tax ({TAX_RATE * 100}%)</span>
                      <span>{currencySymbol}{cartSummary.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
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
                  disabled={isLoading || cart.length === 0}
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