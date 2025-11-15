"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QrCode, Link, RefreshCw, X, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import QRCode from 'qrcode.react'; // Standard default import
import { startPOSSession, disconnectPOSSession, getSessionStatus } from '@/utils/posLinkUtils';
import { useToast } from '@/hooks/use-toast';

interface MobileScannerLinkProps {
  onSessionStarted: (sessionId: string) => void;
  onSessionStopped: () => void;
  isSessionActive: boolean;
  sessionId: string | null;
}

const MobileScannerLink: React.FC<MobileScannerLinkProps> = ({ onSessionStarted, onSessionStopped, isSessionActive, sessionId }) => {
  const { toast } = useToast();
  const [localSessionId, setLocalSessionId] = useState<string | null>(sessionId);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    setLocalSessionId(sessionId);
    if (sessionId) {
      // Mock URL generation based on the session ID
      const mockLocalIp = '192.168.1.100';
      setLocalUrl(`http://${mockLocalIp}:8080/admin/pos/scan?session=${sessionId}`);
    } else {
      setLocalUrl(null);
    }
  }, [sessionId]);

  // Polling effect to check if the mobile device has connected
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (localSessionId && !isSessionActive) {
      setIsCheckingStatus(true);
      interval = setInterval(() => {
        const isConnected = getSessionStatus(localSessionId);
        if (isConnected) {
          clearInterval(interval);
          setIsCheckingStatus(false);
          toast({ title: "Mobile Connected", description: "Remote scanner is now active.", duration: 3000 });
        }
      }, 2000);
    } else {
      setIsCheckingStatus(false);
    }

    return () => clearInterval(interval);
  }, [localSessionId, isSessionActive, toast]);

  const handleStartSession = () => {
    const { sessionId, localUrl } = startPOSSession();
    setLocalSessionId(sessionId);
    setLocalUrl(localUrl);
    onSessionStarted(sessionId);
    toast({ title: "Session Started", description: "Scan the QR code with a mobile device.", duration: 3000 });
  };

  const handleStopSession = () => {
    if (localSessionId) {
      disconnectPOSSession(localSessionId);
      setLocalSessionId(null);
      setLocalUrl(null);
      onSessionStopped();
      toast({ title: "Session Ended", description: "Mobile scanner disconnected.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>Mobile Scanner Link</span>
        </CardTitle>
        <CardDescription>Use a mobile device as a remote barcode scanner.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {localSessionId && localUrl ? (
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg border">
              <QRCode value={localUrl} size={180} level="H" />
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium mb-2">Scan this QR Code</p>
              <Badge 
                variant={isSessionActive ? 'default' : 'secondary'} 
                className={isSessionActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
              >
                {isSessionActive ? <CheckCircle className="h-4 w-4 mr-1" /> : isCheckingStatus ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Link className="h-4 w-4 mr-1" />}
                {isSessionActive ? 'Scanner Connected' : isCheckingStatus ? 'Awaiting Connection...' : 'Session Active'}
              </Badge>
            </div>
            
            <Button 
              variant="destructive" 
              onClick={handleStopSession} 
              className="w-full"
              disabled={isCheckingStatus}
            >
              <X className="h-4 w-4 mr-2" />
              End Session
            </Button>
          </div>
        ) : (
          <Button onClick={handleStartSession} className="w-full" disabled={isCheckingStatus}>
            <QrCode className="h-4 w-4 mr-2" />
            Start Remote Session
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileScannerLink;