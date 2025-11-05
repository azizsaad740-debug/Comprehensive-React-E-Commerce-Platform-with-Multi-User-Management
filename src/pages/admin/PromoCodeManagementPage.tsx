"use client";

import React, { useState, useMemo } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { PromoCode } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '../../components/data-table/DataTable.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit, Trash2, PlusCircle, RefreshCw } from 'lucide-react';
import { getAllPromoCodes, createNewPromoCode, updateMockPromoCode, deleteMockPromoCode } from '@/utils/promoCodeUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PromoCodeForm from '@/components/admin/PromoCodeForm';
import { useToast } from '@/hooks/use-toast';

const PromoCodeManagementPage = () => {
  const { toast } = useToast();
  const [promoCodes, setPromoCodes] = useState(getAllPromoCodes());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const refreshCodes = () => {
    setPromoCodes(getAllPromoCodes().map(c => ({ ...c })));
  };

  const handleOpenForm = (code?: PromoCode) => {
    setEditingCode(code);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCode(undefined);
  };

  const handleSaveCode = (codeData: Partial<PromoCode>) => {
    setIsSaving(true);
    
    setTimeout(() => {
      let result: PromoCode | undefined;
      
      if (codeData.id) {
        // Update existing
        result = updateMockPromoCode(codeData);
      } else {
        // Create new
        result = createNewPromoCode(codeData as Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>);
      }

      if (result) {
        refreshCodes();
        toast({
          title: "Success",
          description: `Promo code ${result.code} saved successfully.`,
        });
        handleCloseForm();
      } else {
        toast({
          title: "Error",
          description: "Failed to save promo code.",
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
            <Button variant="outline" size="sm" onClick={() => handleOpenForm(promo)}>
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

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Promo Code Management</h1>
          <Button onClick={() => handleOpenForm()}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Code
          </Button>
        </div>
        <p className="text-gray-600 mb-8">Manage promotional codes, discounts, and usage limits.</p>

        <DataTable 
          columns={columns} 
          data={promoCodes} 
          filterColumnId="code"
          filterPlaceholder="Filter by code..."
        />
      </div>
      
      {/* Promo Code Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCode ? `Edit Promo Code: ${editingCode.code}` : 'Create New Promo Code'}</DialogTitle>
          </DialogHeader>
          <PromoCodeForm
            initialCode={editingCode}
            onSubmit={handleSaveCode}
            onCancel={handleCloseForm}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default PromoCodeManagementPage;