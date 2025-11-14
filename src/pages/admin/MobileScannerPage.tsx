"use client";

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BarcodeScannerCamera from '@/components/admin/BarcodeScannerCamera';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, QrCode, ArrowLeft } from 'lucide-react';
import { connectMobileScanner, sendScannedData } from '@/utils/posLinkUtils';
import { useToast } from '@/hooks/use-toast';

const MobileScannerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const query = new URLSearchParams(location.search);
  const sessionId = query.get('session');

  useEffect(() => {
    if (sessionId) {
      const connected = connectMobileScanner(sessionId);
      if (connected) {
        toast({ title: "Connected", description: "Mobile scanner linked to POS terminal.", duration: 2000 });
      } else {
        toast({ title: "Error", description: "Invalid or expired session ID.", variant: "destructive" });
        navigate('/admin/pos');
      }
    } else {
      navigate('/admin/pos');
    }
  }, [sessionId, navigate, toast]);

  const handleProductScanned = (productId: string) => {
    if (sessionId) {
      const sent = sendScannedData(sessionId, productId);
      if (sent) {
        toast({ title: "Sent", description: `Scanned ID ${productId} sent to POS.`, duration: 1500 });
      } else {
        toast({ title: "Error", description: "Failed to send data. Session lost.", variant: "destructive" });
      }
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <span>Invalid Session</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Please scan the QR code on the POS terminal screen.</p>
            <Button onClick={() => navigate('/admin/pos')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Go to POS
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-2">
            <QrCode className="h-6 w-6 text-purple-600" />
            <span>Remote Scanner Active</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">Point your camera at a product barcode or QR code.</p>
          <BarcodeScannerCamera 
            onProductScanned={handleProductScanned} 
            disabled={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileScannerPage;