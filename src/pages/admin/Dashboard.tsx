"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Users, Package, ArrowRight, Palette, Plug, ShoppingCart, Brain } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import RevenueChart from '@/components/admin/RevenueChart';
import { getAdminMonthlyRevenue, getMockOrders } from '@/utils/orderUtils';
import { getAllMockUsers } from '@/utils/userUtils';
import { getAllMockProducts } from '@/utils/productUtils';
import { useCheckoutSettingsStore } from '@/stores/checkoutSettingsStore';
import { Product } from '@/types';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { currencySymbol } = useCheckoutSettingsStore();

  const allOrders = getMockOrders();
  const allUsers = getAllMockUsers();
  
  // NEW STATE for products
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const loadProducts = async () => {
      // Fetch all products, including inactive ones for admin view
      setAllProducts(await getAllMockProducts(true));
    };
    loadProducts();
  }, []);

<dyad-problem-report summary="26 problems">
<problem file="src/pages/admin/Dashboard.tsx" line="41" column="39" code="2339">Property 'filter' does not exist on type 'Promise&lt;Product[]&gt;'.</problem>
<problem file="src/components/admin/PromoCodeForm.tsx" line="40" column="55" code="2339">Property 'map' does not exist on type 'Promise&lt;Product[]&gt;'.</problem>
<problem file="src/components/admin/PromoCodeForm.tsx" line="219" column="29" code="2322">Type 'unknown' is not assignable to type 'Key'.</problem>
<problem file="src/components/admin/PromoCodeForm.tsx" line="219" column="44" code="2322">Type 'unknown' is not assignable to type 'string'.</problem>
<problem file="src/components/admin/PromoCodeForm.tsx" line="220" column="29" code="2339">Property 'charAt' does not exist on type 'unknown'.</problem>
<problem file="src/components/admin/PromoCodeForm.tsx" line="220" column="64" code="2339">Property 'slice' does not exist on type 'unknown'.</problem>
<problem file="src/components/reseller/CreatePromoCodeForm.tsx" line="31" column="55" code="2339">Property 'map' does not exist on type 'Promise&lt;Product[]&gt;'.</problem>
<problem file="src/components/reseller/CreatePromoCodeForm.tsx" line="231" column="33" code="2322">Type 'unknown' is not assignable to type 'Key'.</problem>
<problem file="src/components/reseller/CreatePromoCodeForm.tsx" line="231" column="48" code="2322">Type 'unknown' is not assignable to type 'string'.</problem>
<problem file="src/components/reseller/CreatePromoCodeForm.tsx" line="232" column="33" code="2339">Property 'charAt' does not exist on type 'unknown'.</problem>
<problem file="src/components/reseller/CreatePromoCodeForm.tsx" line="232" column="68" code="2339">Property 'slice' does not exist on type 'unknown'.</problem>
<problem file="src/pages/profile/DesignLibraryPage.tsx" line="75" column="29" code="2339">Property 'variants' does not exist on type 'Promise&lt;Product&gt;'.</problem>
<problem file="src/pages/profile/DesignLibraryPage.tsx" line="75" column="59" code="2339">Property 'variants' does not exist on type 'Promise&lt;Product&gt;'.</problem>
<problem file="src/pages/profile/DesignLibraryPage.tsx" line="79" column="13" code="2345">Argument of type 'Promise&lt;Product&gt;' is not assignable to parameter of type 'Product'.
  Type 'Promise&lt;Product&gt;' is missing the following properties from type 'Product': id, name, sku, description, and 12 more.</problem>
<problem file="src/pages/profile/DesignLibraryPage.tsx" line="131" column="42" code="2339">Property 'images' does not exist on type 'Promise&lt;Product&gt;'.</problem>
<problem file="src/components/ledger/TransactionForm.tsx" line="71" column="33" code="2339">Property 'find' does not exist on type 'Promise&lt;Product[]&gt;'.</problem>
<problem file="src/components/ledger/TransactionForm.tsx" line="233" column="30" code="2339">Property 'map' does not exist on type 'Promise&lt;Product[]&gt;'.</problem>
<problem file="src/pages/admin/POSPage.tsx" line="55" column="44" code="2339">Property 'filter' does not exist on type 'Promise&lt;Product[]&gt;'.</problem>
<problem file="src/pages/admin/POSPage.tsx" line="123" column="29" code="2339">Property 'variants' does not exist on type 'Promise&lt;Product&gt;'.</problem>
<problem file="src/pages/admin/POSPage.tsx" line="124" column="27" code="2339">Property 'discountedPrice' does not exist on type 'Promise&lt;Product&gt;'.</problem>
<problem file="src/pages/admin/POSPage.tsx" line="124" column="54" code="2339">Property 'basePrice' does not exist on type 'Promise&lt;Product&gt;'.</problem>
<problem file="src/pages/admin/POSPage.tsx" line="126" column="38" code="2339">Property 'images' does not exist on type 'Promise&lt;Product&gt;'.</problem>
<problem file="src/pages/admin/POSPage.tsx" line="128" column="81" code="2339">Property 'id' does not exist on type 'Promise&lt;Product&gt;'.</problem>
<problem file="src/pages/admin/POSPage.tsx" line="137" column="28" code="2339">Property 'id' does not exist on type 'Promise&lt;Product&gt;'.</problem>
<problem file="src/pages/admin/POSPage.tsx" line="140" column="9" code="2740">Type 'Promise&lt;Product&gt;' is missing the following properties from type 'Product': id, name, sku, description, and 12 more.</problem>
<problem file="src/components/admin/DataExportButton.tsx" line="95" column="41" code="2345">Argument of type 'Promise&lt;Product[]&gt; | User[] | Order[]' is not assignable to parameter of type 'any[]'.
  Type 'Promise&lt;Product[]&gt;' is missing the following properties from type 'any[]': length, pop, push, concat, and 29 more.</problem>
</dyad-problem-report>You are absolutely right. My previous fix was incomplete, as I missed updating the synchronous usage of `getAllMockProducts` in several components, and I failed to update the `Dashboard` component correctly.

I will now apply the necessary asynchronous fetching logic and state management to the remaining affected components: `Dashboard`, `PromoCodeForm`, `CreatePromoCodeForm`, `DesignLibraryPage`, `TransactionForm`, `POSPage`, and `DataExportButton`.

Here are the changes:

<dyad-write path="src/pages/admin/Dashboard.tsx" description="Updating Admin Dashboard to fetch products asynchronously and use the resolved state for calculations.">
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Users, Package, ArrowRight, Palette, Plug, ShoppingCart, Brain } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import RevenueChart from '@/components/admin/RevenueChart';
import { getAdminMonthlyRevenue, getMockOrders } from '@/utils/orderUtils';
import { getAllMockUsers } from '@/utils/userUtils';
import { getAllMockProducts } from '@/utils/productUtils';
import { useCheckoutSettingsStore } from '@/stores/checkoutSettingsStore';
import { Product } from '@/types';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { currencySymbol } = useCheckoutSettingsStore();

  const allOrders = getMockOrders();
  const allUsers = getAllMockUsers();
  
  // NEW STATE for products
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const loadProducts = async () => {
      // Fetch all products, including inactive ones for admin view
      setAllProducts(await getAllMockProducts(true));
    };
    loadProducts();
  }, []);

  // Calculate dynamic stats using the resolved allProducts state
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

        {/* Stats Grid: Changed grid-cols-1 md:grid-cols-2 lg:grid-cols-4 */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Revenue Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencySymbol}{mockStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
          {/* Main Content Area (Chart/Activity) - Now col-span-1 on mobile, col-span-2 on large */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-80"> {/* Ensure the container has a fixed height for ResponsiveContainer */}
                <RevenueChart 
                  data={monthlyRevenueData} 
                  dataKey="Monthly Revenue" 
                  title="Last 7 Months Revenue" 
                  currencySymbol={currencySymbol}
                />
              </div>
              
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
              <Button className="w-full" onClick={() => navigate('/admin/pos')}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Point of Sale (POS)
              </Button>
              <Button className="w-full" onClick={() => navigate('/admin/orders')}>
                Manage Orders
              </Button>
              <Button className="w-full" onClick={() => navigate('/admin/products')}>
                Manage Products
              </Button>
              <Button className="w-full" onClick={() => navigate('/admin/ai-bulk')}>
                <Brain className="h-4 w-4 mr-2" />
                AI Bulk Operations
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