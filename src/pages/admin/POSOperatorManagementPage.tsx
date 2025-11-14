"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { User, OperatorActivity } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpDown, User as UserIcon, Clock, DollarSign, ShoppingBag, RefreshCw } from 'lucide-react';
import { getAllMockUsers } from '@/utils/userUtils';
import { getPOSOperators, getAllOperatorActivities, getOperatorSalesSummary } from '@/utils/operatorUtils';
import { useToast } from '@/hooks/use-toast';
import { useCheckoutSettingsStore } from '@/stores/checkoutSettingsStore';
import { Separator } from '@/components/ui/separator';

// --- Activity History Columns ---
const activityColumns: ColumnDef<OperatorActivity>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Time
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("timestamp").toLocaleString()}</div>,
  },
  {
    accessorKey: "type",
    header: "Event Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as OperatorActivity['type'];
      const variant = type === 'login' ? 'default' : type === 'logout' ? 'secondary' : 'destructive';
      return (
        <Badge variant={variant} className="capitalize">
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => <div className="text-sm text-gray-600">{row.getValue("details")}</div>,
  },
];

// --- Main Page Component ---

const POSOperatorManagementPage = () => {
  const { toast } = useToast();
  const { currencySymbol } = useCheckoutSettingsStore();
  
  const [allUsers, setAllUsers] = useState(getAllMockUsers());
  const [allActivities, setAllActivities] = useState(getAllOperatorActivities());
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Simulate fetching all users (including mock counter user 'u4')
    // NOTE: In a real app, this would fetch all users from Supabase profiles.
    // For mock purposes, we manually ensure a counter user exists for demonstration.
    const mockCounterUser = allUsers.find(u => u.id === 'u4');
    if (!mockCounterUser) {
        setAllUsers(prev => [...prev, {
            id: 'u4',
            email: 'pos.counter@example.com',
            name: 'POS Operator 1',
            role: 'counter',
            isActive: true,
            createdAt: new Date(Date.now() - 86400000 * 30),
            updatedAt: new Date(),
        } as User]);
    }
    
    setAllActivities(getAllOperatorActivities());
  }, [refreshKey]);

  const operators = useMemo(() => getPOSOperators(allUsers), [allUsers]);
  const selectedOperator = useMemo(() => operators.find(o => o.id === selectedOperatorId), [operators, selectedOperatorId]);
  
  const selectedOperatorActivities = useMemo(() => {
    if (!selectedOperatorId) return [];
    return allActivities.filter(a => a.operatorId === selectedOperatorId);
  }, [allActivities, selectedOperatorId]);
  
  const selectedOperatorSummary = useMemo(() => {
    if (!selectedOperatorId) return { totalSales: 0, totalOrders: 0 };
    return getOperatorSalesSummary(selectedOperatorId);
  }, [selectedOperatorId, allActivities]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({ title: "Refreshed", description: "Operator data updated." });
  };
  
  const handleSelectOperator = (operatorId: string) => {
    setSelectedOperatorId(operatorId);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <UserIcon className="h-6 w-6 mr-3" />
            POS Operator Management
          </h1>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
        <p className="text-gray-600 mb-8">Monitor activity and performance of users assigned the 'Counter' role.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Operator List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>POS Operators ({operators.length})</CardTitle>
              <CardDescription>Select an operator to view their history.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {operators.map(operator => (
                <div
                  key={operator.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                    selectedOperatorId === operator.id ? 'bg-primary/10 border border-primary/50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectOperator(operator.id)}
                >
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">{operator.name}</span>
                  </div>
                  <Badge variant="secondary">ID: {operator.id}</Badge>
                </div>
              ))}
              {operators.length === 0 && (
                <p className="text-center text-sm text-gray-500 py-4">No POS operators found.</p>
              )}
            </CardContent>
          </Card>

          {/* Right Column: Operator Details & History */}
          <div className="lg:col-span-2 space-y-6">
            {selectedOperator ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{selectedOperator.name} Performance</CardTitle>
                    <CardDescription>Summary of sales and activity.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-green-50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-700">
                            {currencySymbol}{selectedOperatorSummary.totalSales.toFixed(2)}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-blue-50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                          <ShoppingBag className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-700">
                            {selectedOperatorSummary.totalOrders}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <Separator className="my-4" />
                    <p className="text-sm text-gray-600">Email: {selectedOperator.email}</p>
                    <p className="text-sm text-gray-600">Joined: {selectedOperator.createdAt.toLocaleDateString()}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Activity History</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={activityColumns}
                      data={selectedOperatorActivities}
                      filterColumnId="details"
                      filterPlaceholder="Filter by details..."
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center p-12">
                  <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Select a POS Operator from the list to view their activity and sales history.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default POSOperatorManagementPage;