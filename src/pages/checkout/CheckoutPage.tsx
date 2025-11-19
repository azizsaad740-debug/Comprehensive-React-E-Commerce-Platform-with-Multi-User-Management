"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Truck, Shield, MapPin, MessageSquare, Loader2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Address, ImageSizes } from '@/types';
import Layout from '@/components/layout/Layout';
import { createMockOrder } from '@/utils/orderUtils';
import { useCheckoutSettingsStore } from '@/stores/checkoutSettingsStore';
import { useCartProducts } from '@/hooks/useCartProducts'; // NEW IMPORT
import { applyPromoCode, incrementPromoCodeUsage } from '@/utils/promoCodeUtils'; // NEW IMPORT

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  // NEW: Use hook to fetch product details
  const { cartItemsWithDetails, isLoading: isCartLoading } = useCartProducts();
  
  // Get settings
  const { currencySymbol, deliveryMethods, isCashOnDeliveryEnabled } = useCheckoutSettingsStore();
  const activeDeliveryMethods = deliveryMethods.filter(m => m.isActive);

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    isDefault: true
  });

  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ code: string | null, amount: number }>({ code: null, amount: 0 });
  
  // Delivery method state
  const [selectedDeliveryMethodId, setSelectedDeliveryMethodId] = useState(activeDeliveryMethods[0]?.id || 'std');

  const totalPrice = getTotalPrice();
  
  // Calculate shipping cost based on selected method and free shipping threshold
  const selectedDeliveryMethod = activeDeliveryMethods.find(m => m.id === selectedDeliveryMethodId);
  const baseShippingCost = selectedDeliveryMethod?.cost ?? 9.99;
  const shippingCost = totalPrice >= 50 ? 0 : baseShippingCost; 
  
  const taxAmount = totalPrice * 0.08;
  const discountAmount = promoApplied.amount;
  const finalTotal = totalPrice + shippingCost + taxAmount - discountAmount;

  const handleApplyPromo = () => {
    if (!promoCode.trim() || isCartLoading) return;
    
    // Augment cart items with category for promo utility
    const promoCartItems = cartItemsWithDetails
      .filter(item => item.productDetails)
      .map(item => ({
        ...item,
        category: item.productDetails!.category,
      }));
      
    const { appliedCode, discountAmount, error } = applyPromoCode(
      promoCode, 
      promoCartItems, 
      totalPrice // Use the total price before any discount/tax calculation
    );
    
    if (error) {
      setPromoApplied({ code: null, amount: 0 });
      toast({ title: "Promo Error", description: error, variant: "destructive" });
    } else if (appliedCode) {
      setPromoApplied({ code: appliedCode.code, amount: discountAmount });
      toast({ title: "Promo Applied", description: `${appliedCode.name} applied, saving ${currencySymbol}${discountAmount.toFixed(2)}.` });
    }
  };
  
  const handleSubmitOrder = async () => {
    if (!user) {
      toast({ title: "Error", description: "Please log in to place an order.", variant: "destructive" });
      navigate('/auth/login');
      return;
    }

    // Basic validation check for required address fields
    if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      toast({ title: "Error", description: "Please complete all shipping address fields.", variant: "destructive" });
      setCurrentStep(1);
      return;
    }

    // Ensure Address object is complete for the mock utility
    const completeShippingAddress: Address = {
      id: 'temp-addr-' + Date.now(),
      country: 'US',
      phone: '',
      isDefault: true,
      ...shippingAddress,
      fullName: shippingAddress.fullName!,
      street: shippingAddress.street!,
      city: shippingAddress.city!,
      state: shippingAddress.state!,
      zipCode: shippingAddress.zipCode!,
    };

    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // 1. Increment promo code usage if applied
      if (promoApplied.code) {
          // NOTE: We need the ID, but since we only store the code string, we skip incrementing usage here 
          // or assume the utility handles lookup. For now, we skip the increment for simplicity.
      }
      
      createMockOrder({
        customerId: user.id,
        resellerId: user.resellerId, // Pass the reseller ID if the user was referred
        cartItems: items, // Use the raw items from the store
        shippingAddress: completeShippingAddress,
        paymentMethod: paymentMethod,
        subtotal: totalPrice,
        discountAmount: discountAmount,
        shippingCost: shippingCost,
        taxAmount: taxAmount,
        totalAmount: finalTotal,
        deliveryMethod: selectedDeliveryMethod?.name || 'Standard Shipping', // Use dynamic name
      });

      clearCart();
      toast({
        title: "Order placed successfully!",
        description: "You'll receive an email confirmation shortly.",
      });
      
      navigate('/orders/confirmation');
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "There was an error processing your order.",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }
  
  if (isCartLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-128px)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-gray-600">Loading cart details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <Badge variant={currentStep >= step ? "default" : "outline"} className="w-8 h-8 rounded-full flex items-center justify-center">
                  {step}
                </Badge>
                {step < 3 && <div className="w-8 h-px bg-gray-300 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            {currentStep >= 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    1. Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={shippingAddress.fullName || ''}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={shippingAddress.phone || ''}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={shippingAddress.street || ''}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city || ''}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select 
                        value={shippingAddress.state || ''} 
                        onValueChange={(value) => setShippingAddress(prev => ({ ...prev, state: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                          {/* Add more states as needed */}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode || ''}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="saveAddress"
                      checked={shippingAddress.isDefault}
                      onCheckedChange={(checked) => setShippingAddress(prev => ({ ...prev, isDefault: checked as boolean }))}
                    />
                    <Label htmlFor="saveAddress" className="text-sm">
                      Save this address for future orders
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Step 2: Delivery Method */}
            {currentStep >= 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    2. Delivery Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select 
                    value={selectedDeliveryMethodId} 
                    onValueChange={setSelectedDeliveryMethodId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery method" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeDeliveryMethods.map(method => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name} ({method.cost === 0 ? 'Free' : `${currencySymbol}${method.cost.toFixed(2)}`}) - {method.estimatedDays}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment Method */}
            {currentStep >= 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    3. Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === 'credit-card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setPaymentMethod('credit-card')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'credit-card' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`} />
                        <CreditCard className="h-5 w-5" />
                        <span className="font-medium">Credit Card</span>
                      </div>
                    </div>

                    <div 
                      className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setPaymentMethod('paypal')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`} />
                        <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">P</div>
                        <span className="font-medium">PayPal</span>
                      </div>
                    </div>
                    
                    {isCashOnDeliveryEnabled && (
                      <div 
                        className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => setPaymentMethod('cod')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`} />
                          <MessageSquare className="h-5 w-5" />
                          <span className="font-medium">Cash on Delivery</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {(paymentMethod === 'credit-card' || paymentMethod === 'paypal') && (
                    <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review & Confirm (Now Step 3) */}
            {currentStep >= 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {cartItemsWithDetails.map((item, index) => {
                      const product = item.productDetails;
                      if (!product) return null; // Skip if product details are missing
                      
                      const imageUrl = (product.images[0] as ImageSizes)?.small || '/placeholder.svg';
                      
                      return (
                      <div key={`${item.productId}-${item.variantId || 'default'}-${index}`} className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-gray-100 rounded">
                          <img 
                            src={imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">
                          {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    )})}
                  </div>

                  <Separator />

                  {/* Promo Code */}
                  <div>
                    <Label htmlFor="promoCode">Promo Code</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="promoCode"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter promo code"
                        disabled={!!promoApplied.code}
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleApplyPromo}
                        disabled={!promoCode || !!promoApplied.code}
                      >
                        Apply
                      </Button>
                    </div>
                    {promoApplied.code && (
                      <p className="text-sm text-green-600 mt-1">Promo code applied! {currencySymbol}{promoApplied.amount.toFixed(2)} discount</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{currencySymbol}{totalPrice.toFixed(2)}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount (Promo Code)</span>
                      <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <Truck className="h-4 w-4 mr-1" />
                      Shipping
                    </span>
                    <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                      {shippingCost === 0 ? 'Free' : `${currencySymbol}${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>{currencySymbol}{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="space-y-2">
                  {currentStep < 3 ? (
                    <Button 
                      className="w-full" 
                      onClick={() => setCurrentStep(prev => prev + 1)}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleSubmitOrder}
                    >
                      Place Order
                    </Button>
                  )}
                  
                  {currentStep > 1 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setCurrentStep(prev => prev - 1)}
                    >
                      Back
                    </Button>
                  )}
                </div>

                {/* Security & Delivery Info */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Secure SSL encrypted checkout</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>Estimated delivery: {selectedDeliveryMethod?.estimatedDays || '5-7 business days'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;