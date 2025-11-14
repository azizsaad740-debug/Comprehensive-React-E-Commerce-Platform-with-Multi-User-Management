"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllMockUsers } from '@/utils/userUtils';
import { getAllMockProducts } from '@/utils/productUtils';
import { getMockOrders } from '@/utils/orderUtils';
import { User, Product, Order } from '@/types';

type ExportDataType = 'users' | 'products' | 'orders';

interface DataExportButtonProps {
  dataType: ExportDataType;
}

// Helper function to convert data array to CSV string
const convertToCSV = (data: any[], dataType: ExportDataType): string => {
  if (data.length === 0) return "";

  let headers: string[] = [];
  let rows: string[][] = [];

  switch (dataType) {
    case 'users':
      headers = ["ID", "Name", "Email", "Role", "Is Active", "Reseller ID", "Created At"];
      rows = (data as User[]).map(u => [
        u.id,
        u.name,
        u.email,
        u.role,
        u.isActive ? 'Yes' : 'No',
        u.resellerId || 'N/A',
        u.createdAt.toISOString().slice(0, 10)
      ]);
      break;
    case 'products':
      headers = ["ID", "Name", "SKU", "Category", "Base Price", "Discounted Price", "Stock", "Is Active"];
      rows = (data as Product[]).map(p => [
        p.id,
        p.name,
        p.sku,
        p.category,
        p.basePrice.toFixed(2),
        p.discountedPrice?.toFixed(2) || 'N/A',
        p.stockQuantity.toString(),
        p.isActive ? 'Yes' : 'No'
      ]);
      break;
    case 'orders':
      headers = ["ID", "Customer ID", "Reseller ID", "Total Amount", "Status", "Payment Status", "Date"];
      rows = (data as Order[]).map(o => [
        o.id,
        o.customerId,
        o.resellerId || 'N/A',
        o.totalAmount.toFixed(2),
        o.status,
        o.paymentStatus,
        o.createdAt.toISOString().slice(0, 10)
      ]);
      break;
  }

  const csvRows = rows.map(row => 
    row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
  );

  return [headers.join(','), ...csvRows].join('\n');
};

const DataExportButton: React.FC<DataExportButtonProps> = ({ dataType }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const fetchData = (type: ExportDataType) => {
    switch (type) {
      case 'users':
        return getAllMockUsers();
      case 'products':
        return getAllMockProducts();
      case 'orders':
        return getMockOrders();
      default:
        return [];
    }
  };

  const handleDownload = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      try {
        const data = fetchData(dataType);
        const csvContent = convertToCSV(data, dataType);
        
        if (!csvContent) {
          toast({
            title: "No Data",
            description: `No ${dataType} records found to export.`,
          });
          setIsGenerating(false);
          return;
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${dataType}_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Export Complete",
          description: `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} report downloaded successfully.`,
        });

      } catch (error) {
        toast({
          title: "Export Failed",
          description: "An error occurred while generating the report.",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    }, 500);
  };

  return (
    <Button onClick={handleDownload} disabled={isGenerating}>
      {isGenerating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
      Export {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
    </Button>
  );
};

export default DataExportButton;