"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { CommissionRecord } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CommissionReportButtonProps {
  commissions: CommissionRecord[];
  resellerId: string;
}

// Function to convert CommissionRecord array to CSV string
const convertToCSV = (data: CommissionRecord[]): string => {
  if (data.length === 0) return "";

  const headers = [
    "Order ID", 
    "Date", 
    "Sale Amount", 
    "Rate (%)", 
    "Commission Earned", 
    "Status"
  ];
  
  const rows = data.map(record => [
    record.orderId,
    record.date.toLocaleDateString('en-US'),
    record.saleAmount.toFixed(2),
    record.rate.toString(),
    record.commissionEarned.toFixed(2),
    record.status.charAt(0).toUpperCase() + record.status.slice(1)
  ].map(field => `"${field}"`).join(','));

  return [headers.join(','), ...rows].join('\n');
};

const CommissionReportButton: React.FC<CommissionReportButtonProps> = ({ commissions, resellerId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    setIsGenerating(true);
    
    // Simulate processing delay
    setTimeout(() => {
      try {
        const csvContent = convertToCSV(commissions);
        
        if (!csvContent) {
          toast({
            title: "No Data",
            description: "No commission records found to generate a report.",
            variant: "default", // Fixed: Changed 'secondary' to 'default'
          });
          setIsGenerating(false);
          return;
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `commission_report_${resellerId}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download Complete",
          description: "Commission report downloaded successfully.",
        });

      } catch (error) {
        toast({
          title: "Download Failed",
          description: "An error occurred while generating the report.",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    }, 500);
  };

  return (
    <Button onClick={handleDownload} disabled={isGenerating || commissions.length === 0}>
      {isGenerating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
      Download CSV Report
    </Button>
  );
};

export default CommissionReportButton;