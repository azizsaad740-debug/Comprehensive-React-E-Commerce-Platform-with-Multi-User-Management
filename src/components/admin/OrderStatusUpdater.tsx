"use client";

import React, { useState } from 'react';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateMockOrderStatus } from '@/utils/orderUtils';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Save } from 'lucide-react';

interface OrderStatusUpdaterProps {
  order: Order;
  onStatusUpdate: (updatedOrder: Order) => void;
}

const statusOptions: Order['status'][] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

const OrderStatusUpdater: React.FC<OrderStatusUpdaterProps> = ({ order, onStatusUpdate }) => {
  const [newStatus, setNewStatus] = useState<Order['status']>(order.status);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdate = () => {
    if (newStatus === order.status) return;

    setIsLoading(true);
    try {
      // Simulate API call
      const updatedOrder = updateMockOrderStatus(order.id, newStatus);
      
      if (updatedOrder) {
        onStatusUpdate(updatedOrder);
        toast({
          title: "Status Updated",
          description: `Order #${order.id} status changed to ${newStatus}.`,
        });
      } else {
        throw new Error("Failed to update order status.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update order status.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <Select value={newStatus} onValueChange={(value: Order['status']) => setNewStatus(value)} disabled={isLoading}>
        <SelectTrigger className="w-[180px] capitalize">
          <SelectValue placeholder="Update Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map(status => (
            <SelectItem key={status} value={status} className="capitalize">
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleUpdate} disabled={isLoading || newStatus === order.status}>
        {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        Save
      </Button>
    </div>
  );
};

export default OrderStatusUpdater;