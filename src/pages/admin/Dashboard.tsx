"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Users, Package, ArrowRight, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const mockStats = {
  totalRevenue: 125000.50,
  totalOrders: 4500,
  newCustomers: 120,
  lowStockItems: 15,
  monthlyRevenue: 15000.75,
  pendingCommissions: 500.00,
};

const Dashboard = () => {
  const { user, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const role = user?.role || 'guest';

  const ordersPath = hasRole(['admin', 'reseller']) ? '/admin/orders' : '/orders';

  const isReseller = role === 'reseller';
  const isAdmin = role === 'admin';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {isAdmin ? 'Admin Dashboard' : 'Reseller Dashboard'}
        </h1>
        <p className="text-gray-600 mb-8">Welcome back, {user?.name}. Here is an overview of your business.</p>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Revenue/Earnings Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isAdmin ? 'Total Revenue' : 'Total Earnings'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isAdmin ? `$${mockStats.totalRevenue.toLocaleString()}` : `$${user?.totalEarnings?.toLocaleString() || '0.00'}`}
              </div>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? '+20.1% from last month' : `Commission Rate: ${user?.commissionRate || 0}%`}
              </p>
            </CardContent>
          </Card>
          
          {/* Orders Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalOrders.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>
          
          {/* Customers/Pending Commissions Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isAdmin ? 'New Customers' : 'Pending Commissions'}
              </CardTitle>
              {isAdmin ? <Users className="h-4 w-4 text-muted-foreground" /> : <DollarSign className="h-4 w-4 text-yellow-600" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isAdmin ? `+${mockStats.newCustomers}` : `$${mockStats.pendingCommissions.toFixed(2)}`}
              </div>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? '+5% from last month' : 'Awaiting payment confirmation'}
              </p>
            </CardContent>
          </Card>
          
          {/* Low Stock Card (Admin only) */}
          {isAdmin && (
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
          )}
          {isReseller && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${mockStats.monthlyRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total sales this month</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main Content Area (Chart/Activity) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{isAdmin ? 'Revenue Overview' : 'Sales Activity'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 border border-dashed rounded-lg flex items-center justify-center text-gray-500">
                {/* Placeholder for Chart */}
                <p>Chart Placeholder: Monthly {isAdmin ? 'Revenue' : 'Sales'} Data</p>
              </div>
              
              <Separator className="my-6" />
              
              <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
              <p className="text-gray-500 mb-4">Placeholder for recent orders or commission updates.</p>
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
              {hasRole(['admin', 'reseller']) && (
                <Button className="w-full" onClick={() => navigate('/admin/orders')}>
                  Manage Orders
                </Button>
              )}
              {hasRole(['admin', 'reseller']) && (
                <Button className="w-full" onClick={() => navigate('/reseller/commissions')}>
                  View Commissions
                </Button>
              )}
              {isAdmin && (
                <Button className="w-full" onClick={() => navigate('/admin/products')}>Manage Products</Button>
              )}
              <Button className="w-full" variant="outline">View Reports</Button>
              {isAdmin && (
                <Button className="w-full" onClick={() => navigate('/admin/users')}>
                  Manage Users
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;