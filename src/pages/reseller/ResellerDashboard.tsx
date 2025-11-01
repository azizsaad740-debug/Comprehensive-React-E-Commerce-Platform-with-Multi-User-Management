"use client";

import React, { useMemo } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, ArrowRight, TrendingUp, Percent, Tag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import RevenueChart from '@/components/admin/RevenueChart';
import { getCustomersByResellerId } from '@/utils/userUtils';
import { getPromoCodesByResellerId } from '@/utils/promoCodeUtils';
import ResellerCodeDisplay from '@/components/reseller/ResellerCodeDisplay';
import { getResellerMonthlySales, getResellerTotalReferredSales } from '@/utils/orderUtils';

const ResellerDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const commissionRate = user?.commissionRate || 15;
  const resellerId = user?.id;

  // Calculate real-time (mocked) metrics
  const referredCustomers = resellerId 
    ? getCustomersByResellerId(resellerId) 
    : [];
    
  const activeCustomersCount = referredCustomers.length;

  // Calculate total referred sales dynamically from orders
  const totalReferredSales = resellerId 
    ? getResellerTotalReferredSales(resellerId) 
    : 0;

  const activePromoCodesCount = resellerId 
    ? getPromoCodesByResellerId(resellerId).filter(code => code.isActive).length 
    : 0;
    
  const totalEarnings = user?.totalEarnings || 0;
  
  // Fetch dynamic sales data
  const monthlySalesData = useMemo(() => {
    if (resellerId) {
      return getResellerMonthlySales(resellerId);
    }
    return [];
  }, [resellerId]);

  return (
    <AdminLayout>
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
                ${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Lifetime commissions paid</p>
            </CardContent>
          </Card>
          
          {/* Total Referred Sales Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referred Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalReferredSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Total sales from your customers</p>
            </CardContent>
          </Card>
          
          {/* Active Customers Card (Real Mock Data) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Referred Customers</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeCustomersCount}
              </div>
              <p className="text-xs text-muted-foreground">Customers linked to your ID</p>
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

        {/* Referral Link & Promo Code Display */}
        {user?.id && <ResellerCodeDisplay resellerId={user.id} />}

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Sales Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Sales Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart 
                data={monthlySalesData} 
                dataKey="Monthly Sales" 
                title="Last 7 Months Sales" 
              />
              
              <Separator className="my-6" />
              
              <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate('/admin/orders')}>
                  View My Orders
                </Button>
                <Button variant="outline" onClick={() => navigate('/reseller/commissions')}>
                  Track Commissions
                </Button>
                <Button variant="outline" onClick={() => navigate('/reseller/customers')}>
                  Manage Customers
                </Button>
                <Button variant="outline" onClick={() => navigate('/reseller/promocodes')}>
                  Manage Promo Codes
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions (Simplified) */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => navigate('/reseller/promocodes')}>
                Generate New Promo Code
              </Button>
              <Button className="w-full" onClick={() => navigate('/profile')}>
                Update Profile
              </Button>
              <Button className="w-full" variant="outline">Generate Reports</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ResellerDashboard;