"use client";

import React, { useState, useMemo } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { PromoCode } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit, Trash2, PlusCircle, Tag } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getPromoCodesByResellerId, deleteMockPromoCode, updateMockPromoCode } from '@/utils/promoCodeUtils';
import CreatePromoCodeForm from '@/components/reseller/CreatePromoCodeForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResellerCodeDisplay from '@/components/reseller/ResellerCodeDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PromoCodeForm from '@/components/admin/PromoCodeForm';
import { useToast } from '@/hooks/use-toast';

const ResellerPromoCodePage = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  // Initialize state with codes linked to the current reseller
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(
    user?.id ? getPromoCodesByResellerId(user.id) : []
  );
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const refreshCodes = () => {
    if (user?.id) {
      setPromoCodes(getPromoCodesByResellerId(user.id).map(c => ({ ...c })));
    }
  };

  const handleCodeCreated = (newCode: PromoCode) => {
    setPromoCodes(prev => [...prev, newCode]);
    setIsCreating(false);
  };
  
  const handleOpenEdit = (code: PromoCode) => {
    setEditingCode(code);
    setIsEditing(true);
  };
  
  const handleCloseEdit = () => {
    setIsEditing(false);
    setEditingCode(undefined);
  };
  
  const handleSaveCode = (codeData: Partial<PromoCode>) => {
    if (!user || !codeData.id) return;
    
    setIsSaving(true);
    
    setTimeout(() => {
      // Ensure resellerId is maintained and autoAssignReseller is true for reseller-created codes
      const dataToUpdate: Partial<PromoCode> = {
        ...codeData,
        resellerId: user.id,
        autoAssignReseller: true,
      };
      
      const updatedCode = updateMockPromoCode(dataToUpdate);

      if (updatedCode) {
        refreshCodes();
        toast({
          title: "Success",
          description: `Promo code ${updatedCode.code} updated successfully.`,
        });
        handleCloseEdit();
      } else {
        toast({
          title: "Error",
          description: "Failed to update promo code.",
          variant: "destructive",
        });
      }
      setIsSaving(false);
    }, 500);
  };
  
  const handleDeleteCode = (codeId: string, codeName: string) => {
    if (window.confirm(`Are you sure you want to delete the promo code: ${codeName}?`)) {
      if (deleteMockPromoCode(codeId)) {
        refreshCodes();
        toast({
          title: "Deleted",
          description: `Promo code ${codeName} deleted.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete promo code.",
          variant: "destructive",
        });
      }
    }
  };

  const columns: ColumnDef<PromoCode>[] = useMemo(() => [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-bold text-primary">{row.getValue("code")}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "discountValue",
      header: "Discount",
      cell: ({ row }) => {
        const promo = row.original;
        const value = promo.discountValue;
        return (
          <div>
            {promo.discountType === 'percentage' ? `${value}% OFF` : `$${value.toFixed(2)} OFF`}
          </div>
        );
      },
    },
    {
      accessorKey: "usedCount",
      header: "Usage",
      cell: ({ row }) => {
        const promo = row.original;
        return (
          <div className="text-sm text-gray-600">
            {promo.usedCount} / {promo.usageLimit || '∞'}
          </div>
        );
      },
    },
    {
      accessorKey: "validTo",
      header: "Expires",
      cell: ({ row }) => {
        const date = row.original.validTo;
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? 'default' : 'outline'} className={isActive ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const promo = row.original;
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleOpenEdit(promo)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteCode(promo.id, promo.code)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [promoCodes]);

  if (!user || user.role !== 'reseller') {
    return <AdminLayout><div className="p-8">Access Denied.</div></AdminLayout>;
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Promo Codes</h1>
          <Button onClick={() => setIsCreating(!isCreating)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {isCreating ? 'Cancel Creation' : 'Generate New Code'}
          </Button>
        </div>
        <p className="text-gray-600 mb-8">Manage promotional codes linked to your reseller account.</p>

        <ResellerCodeDisplay resellerId={user.id} />

        {isCreating && (
          <div className="mb-8">
            <CreatePromoCodeForm onCodeCreated={handleCodeCreated} />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="h-5 w-5" />
              All Generated Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={promoCodes} 
              filterColumnId="code"
              filterPlaceholder="Filter by code..."
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Promo Code Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCode ? `Edit Promo Code: ${editingCode.code}` : 'Edit Promo Code'}</DialogTitle>
          </DialogHeader>
          {editingCode && (
            <PromoCodeForm
              initialCode={editingCode}
              onSubmit={handleSaveCode}
              onCancel={handleCloseEdit}
              isSaving={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ResellerPromoCodePage;