"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scan, RefreshCw, Camera, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useIsMobile } from '@/hooks/use-mobile';

interface BarcodeScannerCameraProps {
  onProductScanned: (productId: string) => void;
  disabled: boolean;
}

const qrcodeRegionId = "qrcode-reader";

const BarcodeScannerCamera: React.FC<BarcodeScannerCameraProps> = ({ onProductScanned, disabled }) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const startScanner = async () => {
    if (disabled || isScanning) return;

    setIsScanning(true);
    setHasCamera(true);
    
    // Check for camera permission/availability
    try {
      const devices = await Html5QrcodeScanner.getCameras();
      if (devices && devices.length) {
        // Camera found, proceed to initialize scanner
        const html5QrcodeScanner = new Html5QrcodeScanner(
          qrcodeRegionId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            disableFlip: false,
            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.EAN_13,
            ],
          },
          /* verbose= */ false
        );

        scannerRef.current = html5QrcodeScanner;

        const onScanSuccess = (decodedText: string) => {
          // Handle successful scan
          stopScanner();
          onProductScanned(decodedText);
          toast({ title: "Scan Successful", description: `Code: ${decodedText}` });
        };

        const onScanFailure = (errorMessage: string) => {
          // console.warn(`Code scan error = ${errorMessage}`);
        };

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
      } else {
        setHasCamera(false);
        setIsScanning(false);
        toast({ title: "No Camera", description: "No camera device found.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setHasCamera(false);
      setIsScanning(false);
      toast({ title: "Camera Error", description: "Could not access camera. Check permissions.", variant: "destructive" });
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner", error);
      });
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Scan className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="font-semibold text-lg">Camera Scanner</h3>
        </div>
        
        {hasCamera ? (
          <>
            {isScanning ? (
              <>
                <div id={qrcodeRegionId} className="w-full h-64 border border-dashed rounded-lg bg-gray-100 flex items-center justify-center">
                  {/* Scanner view will be injected here */}
                  <p className="text-gray-500 text-sm">Scanning...</p>
                </div>
                <Button 
                  onClick={stopScanner} 
                  variant="destructive" 
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Stop Scanning
                </Button>
              </>
            ) : (
              <Button 
                onClick={startScanner} 
                disabled={disabled}
                className="w-full"
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Camera Scan
              </Button>
            )}
          </>
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">Camera not detected or access denied.</p>
          </div>
        )}
        
        <p className="text-xs text-gray-500">
          Uses device camera to scan QR or Barcodes.
        </p>
      </CardContent>
    </Card>
  );
};

export default BarcodeScannerCamera;