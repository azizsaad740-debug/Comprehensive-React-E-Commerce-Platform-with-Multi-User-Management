"use client";

import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Users, ArrowRight, TrendingUp, Percent } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const mockResellerStats = {
  totalEarnings: 15000.75,
  monthlySales: 3500.50,
  totalOrders: 450,
  pendingCommissions: 500.00,
  activeCustomers: 85,
};

const ResellerDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const commissionRate = user?.commissionRate || 15;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Reseller Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome back, {user?.name}. Track your performance and commissions here.</p>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Earnings Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${mockResellerStats.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Lifetime commissions paid</p>
            </CardContent>
          </Card>
          
          {/* Monthly Sales Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${mockResellerStats.monthlySales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Total sales generated this month</p>
            </CardContent>
          </Card>
          
          {/* Pending Commissions Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${mockResellerStats.pendingCommissions.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting payment confirmation</p>
            </CardContent>
          </Card>
          
          {/* Commission Rate Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
              <Percent className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{commissionRate}%</div>
              <p className="text-xs text-muted-foreground">Your current rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Sales Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Sales Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 border border-dashed rounded-lg flex items-center justify-center text-gray-500">
                {/* Placeholder for Sales Chart */}
                <p>Chart Placeholder: Monthly Sales Data</p>
              </div>
              
              <Separator className="my-6" />
              
              <h3 className="text-lg font-semibold mb-3">Recent Orders</h3>
              <p className="text-gray-500 mb-4">Placeholder for recent orders placed by your customers.</p>
              <Button variant="link" onClick={() => navigate('/admin/orders')} className="p-0">
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
                View My Orders
              </Button>
              <Button className="w-full" onClick={() => navigate('/reseller/commissions')}>
                Track Commissions
              </Button>
              <Button className="w-full" onClick={() => navigate('/profile')}>
                Update Profile
              </Button>
              <Button className="w-full" variant="outline">Generate Reports</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ResellerDashboard;