"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, DollarSign, MapPin } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Order, OrderItem, Address } from '@/types';

// Mock Data
const mockShippingAddress: Address = {
  id: 'a1',
  fullName: 'John Doe',
  phone: '555-1234',
  street: '123 Custom St',
  city: 'Design City',
  state: 'DC',
  zipCode: '12345',
  country: 'USA',
  isDefault: true,
};

const mockOrderItems: OrderItem[] = [
  {
    id: 'oi1',
    productId: '1',
    quantity: 1,
    price: 24.99,
    customization: {
      texts: ['My Custom Text'],
      font: 'Arial',
      previewImage: '/placeholder.svg',
      svgFile: 'tshirt_design.svg',
    },
  },
  {
    id: 'oi2',
    productId: '2',
    variantId: 'v2',
    quantity: 2,
    price: 19.99,
    customization: {
      texts: ['Best Mug Ever'],
      font: 'Impact',
      previewImage: '/placeholder.svg',
      svgFile: 'mug_design.svg',
    },
  },
];

const mockOrder: Order = {
  id: 'CP-2024-001234',
  customerId: '1',
  status: 'shipped',
  items: mockOrderItems,
  subtotal: 64.97, // 24.99 + (2 * 19.99)
  discountAmount: 0,
  taxAmount: 5.20, // 8% tax
  shippingCost: 9.99,
  totalAmount: 80.16,
  paymentMethod: 'Credit Card',
  paymentStatus: 'paid',
  shippingAddress: mockShippingAddress,
  deliveryMethod: 'Standard Shipping',
  designFiles: ['tshirt_design.svg', 'mug_design.svg'],
  createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
  updatedAt: new Date(),
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // In a real app, fetch order data using 'id'
  const order = mockOrder; 

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Order Not Found</h1>
          <p className="text-gray-600 mt-2">The order with ID {id} could not be found.</p>
          <Button onClick={() => navigate('/orders')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>;
      case 'processing':
        return <Badge className="bg-indigo-100 text-indigo-800">Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-100 text-purple-800">Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <Button variant="outline" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details & Items (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Order Status
                  {getStatusBadge(order.status)}
                </CardTitle>
                <CardDescription>
                  Placed on {order.createdAt.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="font-medium capitalize">{order.status}</p>
                    <p className="text-sm text-gray-500">
                      {order.status === 'shipped' && 'Tracking number: TRK123456'}
                      {order.status === 'delivered' && 'Delivered successfully'}
                      {order.status === 'confirmed' && 'Preparing for production'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items ({order.items.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={item.id} className="flex items-start space-x-4 border-b pb-4 last:border-b-0 last:pb-0">
                    {/* Mock Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0">
                      <img 
                        src="/placeholder.svg" 
                        alt={`Item ${index + 1}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">
                        {/* Mock product name lookup */}
                        {item.productId === '1' ? 'Custom T-Shirt' : 'Personalized Mug'}
                      </h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      
                      {/* Customization */}
                      <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs text-blue-700 font-medium mb-1">Customization:</p>
                        {item.customization.texts.filter(text => text.trim()).map((text, idx) => (
                          <p key={idx} className="text-xs text-blue-600">
                            "{text}"
                          </p>
                        ))}
                        <p className="text-xs text-blue-600">Font: {item.customization.font}</p>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right">
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping & Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                    Shipping Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="mt-2 text-gray-600">Phone: {order.shippingAddress.phone}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p className="font-medium capitalize">Method: {order.paymentMethod}</p>
                  <p className="text-gray-600">Status: {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</p>
                  <p className="mt-2">Total Charged: <span className="font-bold">${order.totalAmount.toFixed(2)}</span></p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Order Summary (Col 3) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{order.shippingCost === 0 ? 'Free' : `$${order.shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>${order.taxAmount.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
                
                <Button className="w-full mt-4" variant="outline">
                  Download Invoice
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetailPage;