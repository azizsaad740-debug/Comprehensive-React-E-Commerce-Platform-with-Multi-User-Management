"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, DollarSign, MapPin, XCircle, User } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Order } from '@/types';
import { getMockOrderById, cancelOrder } from '@/utils/orderUtils';
import { useToast } from '@/hooks/use-toast';
import OrderStatusUpdater from '@/components/admin/OrderStatusUpdater';
import { useAuthStore } from '@/stores/authStore';
import CustomizationDisplay from '@/components/products/CustomizationDisplay';

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  const [order, setOrder] = useState<Order | undefined>(undefined);
  
  useEffect(() => {
    if (id) {
      const fetchedOrder = getMockOrderById(id);
      setOrder(fetchedOrder);
    }
  }, [id]);

  const handleStatusUpdate = (updatedOrder: Order) => {
    setOrder(updatedOrder);
  };

  const handleCancelOrder = () => {
    if (!order || order.status === 'cancelled') return;

    const updatedOrder = cancelOrder(order.id);

    if (updatedOrder) {
      setOrder(updatedOrder);
      toast({
        title: "Order Cancelled",
        description: `Order #${order.id} has been successfully cancelled.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to cancel order.",
        variant: "destructive",
      });
    }
  };

  if (!order) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Order Not Found</h1>
          <p className="text-gray-600 mt-2">The order with ID {id} could not be found.</p>
          <Button onClick={() => navigate('/admin/orders')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'confirmed':
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

  const isCancellable = order.status !== 'cancelled' && order.status !== 'delivered';
  
  const backButtonText = user?.role === 'reseller' ? 'Back to My Referred Orders' : 'Back to Order Management';

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <Button variant="outline" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backButtonText}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details & Items (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Card & Updater */}
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
              <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <OrderStatusUpdater order={order} onStatusUpdate={handleStatusUpdate} />
                
                {isCancellable && (
                  <Button 
                    variant="destructive"
                    onClick={handleCancelOrder}
                    disabled={order.status === 'cancelled'}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-500" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">Customer ID: {order.customerId}</p>
                <p className="text-gray-600">Email: customer{order.customerId}@example.com (Mock)</p>
                {order.resellerId && (
                  <p className="text-gray-600">Reseller ID: {order.resellerId}</p>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items ({order.items.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => {
                  return (
                    <div key={item.id} className="flex items-start space-x-4 border-b pb-4 last:border-b-0 last:pb-0">
                      {/* Mock Image */}
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0">
                        <img 
                          src={item.customization.previewImage || "/placeholder.svg"} 
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
                        <CustomizationDisplay customization={item.customization} />
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
                  );
                })}
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
    </AdminLayout>
  );
};

export default AdminOrderDetailPage;