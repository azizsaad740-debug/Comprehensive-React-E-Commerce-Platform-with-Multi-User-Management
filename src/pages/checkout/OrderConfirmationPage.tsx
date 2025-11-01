"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Truck, CreditCard, Mail } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import CustomizationDisplay from '@/components/products/CustomizationDisplay';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();

  // Mock order data (This should ideally come from a successful checkout state/API response)
  const orderData = {
    orderNumber: 'CP-2024-001234',
    status: 'confirmed',
    estimatedDelivery: 'Dec 15, 2024',
    total: 89.97,
    items: [
      {
        id: '1',
        name: 'Custom T-Shirt',
        variant: 'Medium',
        quantity: 1,
        price: 24.99,
        customization: {
          texts: ['My Custom Text'],
          font: 'Arial',
          startDesign: 'design-s1',
          previewImage: '/placeholder.svg',
          svgFile: 'tshirt_design.svg',
        },
      },
      {
        id: '2',
        name: 'Personalized Mug',
        variant: 'Standard',
        quantity: 2,
        price: 19.99,
        customization: {
          texts: ['Best Mug Ever'],
          font: 'Impact',
          endDesign: 'design-e1',
          previewImage: '/placeholder.svg',
          svgFile: 'mug_design.svg',
        },
      }
    ],
    shipping: {
      address: '123 Main St, Anytown, AT 12345',
      method: 'Standard Shipping',
      cost: 0
    },
    payment: {
      method: 'Credit Card',
      last4: '4567'
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Order Details
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Confirmed
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Order #{orderData.orderNumber}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Processing</p>
                    <p className="text-sm text-gray-500">Your order is being prepared</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Estimated Delivery</p>
                    <p className="text-sm text-gray-500">{orderData.estimatedDelivery}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items Ordered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.items.map((item) => {
                    return (
                      <div key={item.id} className="flex items-start space-x-4 border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-md">
                          <img 
                            src={item.customization.previewImage || '/placeholder.svg'} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.variant}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          
                          {/* Customization Details */}
                          <CustomizationDisplay customization={item.customization} title="Design Details" />
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Shipping & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{orderData.shipping.address}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{orderData.shipping.method}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">
                      {orderData.payment.method} ending in {orderData.payment.last4}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                    <span>${orderData.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{orderData.shipping.cost === 0 ? 'Free' : `$${orderData.shipping.cost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(orderData.total * 0.08).toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>${(orderData.total + (orderData.total * 0.08)).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => navigate('/orders')}
                  >
                    View Order Details
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/products')}
                  >
                    Continue Shopping
                  </Button>
                </div>

                {/* Support */}
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <Mail className="h-4 w-4" />
                    <span>Need help? Contact us</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    We'll send tracking information to your email once your order ships.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmationPage;