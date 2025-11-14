"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Scan, RefreshCw, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BarcodeManualInputProps {
  onProductScanned: (productId: string) => void;
  disabled: boolean;
}

const BarcodeManualInput: React.FC<BarcodeManualInputProps> = ({ onProductScanned, disabled }) => {
  const [scanInput, setScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const handleScan = () => {
    if (!scanInput.trim()) {
      toast({ title: "Error", description: "Please enter a product ID/SKU to simulate scan.", variant: "destructive" });
      return;
    }
    
    setIsScanning(true);
    
    // Simulate hardware scan delay
    setTimeout(() => {
      const scannedId = scanInput.trim();
      onProductScanned(scannedId);
      setScanInput('');
      setIsScanning(false);
      toast({ title: "Scan Successful", description: `Product ID ${scannedId} added to cart.` });
    }, 500);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="font-semibold text-lg">Manual ID / SKU Input</h3>
        </div>
        
        <div className="flex space-x-2">
          <Input
            placeholder="Enter Product ID/SKU (e.g., 1, 2, 3)"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            disabled={disabled || isScanning}
          />
          <Button 
            onClick={handleScan} 
            disabled={disabled || isScanning || !scanInput.trim()}
            size="icon"
          >
            {isScanning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500">
          Use this for desktop input or if camera scanning is unavailable.
        </p>
      </CardContent>
    </Card>
  );
};

export default BarcodeManualInput;