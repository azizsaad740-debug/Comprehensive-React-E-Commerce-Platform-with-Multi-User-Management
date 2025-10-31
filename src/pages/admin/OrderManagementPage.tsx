"use client";

import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { Order } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '../../components/data-table/DataTable.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Eye, XCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock Data (Expanded from OrderDetailPage)
const mockOrders: Order[] = [
  {
    id: 'CP-2024-001234', customerId: '1', status: 'shipped', items: [], subtotal: 64.97, discountAmount: 0, taxAmount: 5.20, shippingCost: 9.99, totalAmount: 80.16, paymentMethod: 'Credit Card', paymentStatus: 'paid', shippingAddress: {} as any, deliveryMethod: 'Standard Shipping', designFiles: [], createdAt: new Date(Date.now() - 86400000 * 5), updatedAt: new Date(),
  },
  {
    id: 'CP-2024-001235', customerId: '2', status: 'processing', items: [], subtotal: 150.00, discountAmount: 15.00, taxAmount: 10.80, shippingCost: 0, totalAmount: 145.80, paymentMethod: 'PayPal', paymentStatus: 'paid', shippingAddress: {} as any, deliveryMethod: 'Express Shipping', designFiles: [], createdAt: new Date(Date.now() - 86400000 * 2), updatedAt: new Date(),
  },
  {
    id: 'CP-2024-001236', customerId: '3', status: 'pending', items: [], subtotal: 30.00, discountAmount: 0, taxAmount: 2.40, shippingCost: 9.99, totalAmount: 42.39, paymentMethod: 'Credit Card', paymentStatus: 'pending', shippingAddress: {} as any, deliveryMethod: 'Standard Shipping', designFiles: [], createdAt: new Date(Date.now() - 86400000 * 1), updatedAt: new Date(),
  },
  {
    id: 'CP-2024-001237', customerId: '4', status: 'delivered', items: [], subtotal: 250.00, discountAmount: 0, taxAmount: 20.00, shippingCost: 0, totalAmount: 270.00, paymentMethod: 'Credit Card', paymentStatus: 'paid', shippingAddress: {} as any, deliveryMethod: 'Standard Shipping', designFiles: [], createdAt: new Date(Date.now() - 86400000 * 10), updatedAt: new Date(),
  },
  {
    id: 'CP-2024-001238', customerId: '5', status: 'cancelled', items: [], subtotal: 50.00, discountAmount: 0, taxAmount: 4.00, shippingCost: 9.99, totalAmount: 63.99, paymentMethod: 'Credit Card', paymentStatus: 'failed', shippingAddress: {} as any, deliveryMethod: 'Standard Shipping', designFiles: [], createdAt: new Date(Date.now() - 86400000 * 7), updatedAt: new Date(),
  },
];

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

const columns: ColumnDef<Order>[] = [
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
      return (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          {order.status === 'pending' && (
            <Button variant="default" size="sm" title="Confirm Order">
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          {order.status !== 'cancelled' && (
            <Button variant="destructive" size="sm" title="Cancel Order">
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];

const OrderManagementPage = () => {
  const orders = mockOrders;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Order Management</h1>
          <Button variant="outline">Export Orders</Button>
        </div>
        <p className="text-gray-600 mb-8">View and manage all customer orders.</p>

        <DataTable 
          columns={columns} 
          data={orders} 
          filterColumnId="id"
          filterPlaceholder="Filter by Order ID..."
        />
      </div>
    </AdminLayout>
  );
};

export default OrderManagementPage;