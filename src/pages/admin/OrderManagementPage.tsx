"use client";

import React, { useMemo, useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { Order } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '../../components/data-table/DataTable.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Eye, XCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMockOrders, updateMockOrderStatus, cancelOrder } from '@/utils/orderUtils';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

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

interface OrderActions {
  onConfirm: (orderId: string) => void;
  onCancel: (orderId: string) => void;
}

const columns = (actions: OrderActions): ColumnDef<Order>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Order ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      return <div className="text-right font-bold">${amount.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.getValue("status") as Order['status']),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as Order['paymentStatus'];
      return (
        <Badge variant={status === 'paid' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const order = row.original;
      
      const isCancellable = order.status !== 'cancelled' && order.status !== 'delivered';

      return (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/orders/${order.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          {order.status === 'pending' && (
            <Button 
              variant="default" 
              size="sm" 
              title="Confirm Order"
              onClick={() => actions.onConfirm(order.id)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          {isCancellable && (
            <Button 
              variant="destructive" 
              size="sm" 
              title="Cancel Order"
              onClick={() => actions.onCancel(order.id)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];

const OrderManagementPage = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  // Use state for orders to trigger re-renders upon status change
  const [allOrders, setAllOrders] = useState<Order[]>(getMockOrders());

  const updateOrderState = (updatedOrder: Order) => {
    setAllOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const handleConfirmOrder = (orderId: string) => {
    const updatedOrder = updateMockOrderStatus(orderId, 'confirmed');
    if (updatedOrder) {
      updateOrderState(updatedOrder);
      toast({ title: "Order Confirmed", description: `Order #${orderId} is now confirmed.` });
    } else {
      toast({ title: "Error", description: "Failed to confirm order.", variant: "destructive" });
    }
  };

  const handleCancelOrder = (orderId: string) => {
    const updatedOrder = cancelOrder(orderId);
    if (updatedOrder) {
      updateOrderState(updatedOrder);
      toast({ title: "Order Cancelled", description: `Order #${orderId} has been cancelled.`, variant: "destructive" });
    } else {
      toast({ title: "Error", description: "Failed to cancel order.", variant: "destructive" });
    }
  };

  const orderActions: OrderActions = {
    onConfirm: handleConfirmOrder,
    onCancel: handleCancelOrder,
  };

  const orderColumns = useMemo(() => columns(orderActions), [orderActions]);

  const orders = useMemo(() => {
    if (user?.role === 'admin') {
      // Admin sees all orders
      return allOrders;
    }
    if (user?.role === 'reseller') {
      // Reseller sees only orders associated with their ID
      const resellerId = user.id; 
      return allOrders.filter(order => order.resellerId === resellerId);
    }
    return [];
  }, [user, allOrders]);

  const isReseller = user?.role === 'reseller';
  const pageTitle = isReseller ? 'My Referred Orders' : 'Order Management';
  const pageDescription = isReseller 
    ? 'View and manage orders placed by customers referred by you.' 
    : 'View and manage all customer orders.';

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          {!isReseller && <Button variant="outline">Export Orders</Button>}
        </div>
        <p className="text-gray-600 mb-8">
          {pageDescription}
        </p>

        <DataTable 
          columns={orderColumns} 
          data={orders} 
          filterColumnId="id"
          filterPlaceholder="Filter by Order ID..."
        />
      </div>
    </AdminLayout>
  );
};

export default OrderManagementPage;