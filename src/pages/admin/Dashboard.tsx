"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Users, Package, ArrowRight, Palette, Plug } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import RevenueChart from '@/components/admin/RevenueChart';
import { getAdminMonthlyRevenue, getMockOrders } from '@/utils/orderUtils';
import { getAllMockUsers } from '@/utils/userUtils';
import { getAllMockProducts } from '@/utils/productUtils';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const allOrders = getMockOrders();
  const allUsers = getAllMockUsers();
  const allProducts = getAllMockProducts();

  // Calculate dynamic stats
  const mockStats = useMemo(() => {
    const activeOrders = allOrders.filter(o => o.status !== 'cancelled');
    
    const totalRevenue = activeOrders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);
      
    const totalOrders = activeOrders.length;
    
    const newCustomers = allUsers.filter(u => 
      u.role === 'customer' && 
      (new Date().getTime() - u.createdAt.getTime()) < (86400000 * 30) // Joined in last 30 days
    ).length;
    
    const lowStockItems = allProducts.filter(p => 
      p.stockQuantity < 10
    ).length;

    return {
      totalRevenue,
      totalOrders,
      newCustomers,
      lowStockItems,
    };
  }, [allOrders, allUsers, allProducts]);

  // Fetch dynamic revenue data
  const monthlyRevenueData = useMemo(() => {
    return getAdminMonthlyRevenue();
  }, [allOrders]);

  const ordersPath = '/admin/orders'; 

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome back, {user?.name}. Here is an overview of the system.</p>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Revenue Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${mockStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">+20.1% from last month (Mock)</p>
            </CardContent>
          </Card>
          
          {/* Total Orders Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalOrders.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+15% from last month (Mock)</p>
            </CardContent>
          </Card>
          
          {/* New Customers Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Customers (30 Days)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{mockStats.newCustomers}</div>
              <p className="text-xs text-muted-foreground">New sign-ups</p>
            </CardContent>
          </Card>
          
          {/* Low Stock Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{mockStats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Action required</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main Content Area (Chart/Activity) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart 
                data={monthlyRevenueData} 
                dataKey="Monthly Revenue" 
                title="Last 7 Months Revenue" 
              />
              
              <Separator className="my-6" />
              
              <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
              <p className="text-gray-500 mb-4">Placeholder for recent orders or system updates.</p>
              <Button variant="link" onClick={() => navigate(ordersPath)} className="p-0">
                View All Orders <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => navigate('/admin/orders')}>
                Manage Orders
              </Button>
              <Button className="w-full" onClick={() => navigate('/admin/products')}>
                Manage Products
              </Button>
              <Button className="w-full" onClick={() => navigate('/admin/users')}>
                Manage Users
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate('/admin/promocodes')}>
                Manage Promo Codes
              </Button>
              <Separator />
              <Button className="w-full" variant="secondary" onClick={() => navigate('/admin/theme')}>
                <Palette className="h-4 w-4 mr-2" />
                Theme Editor
              </Button>
              <Button className="w-full" variant="secondary" onClick={() => navigate('/admin/plugins')}>
                <Plug className="h-4 w-4 mr-2" />
                Plugin Management
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;