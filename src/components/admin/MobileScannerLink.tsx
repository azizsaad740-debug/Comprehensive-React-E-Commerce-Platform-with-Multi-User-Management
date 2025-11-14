"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QrCode, Link, RefreshCw, X, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode.react';
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
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive && sessionId) {
      // Start polling for connection status
      interval = setInterval(async () => {
        const status = getSessionStatus(sessionId);
        setIsConnected(status);
      }, 1000);
    } else {
      setIsConnected(false);
    }

    return () => clearInterval(interval);
  }, [isSessionActive, sessionId]);

  const handleStartSession = () => {
    const { sessionId, localUrl } = startPOSSession();
    setLocalUrl(localUrl);
    onSessionStarted(sessionId);
    toast({ title: "Session Started", description: "Scan the QR code with a mobile device on the same network." });
  };

  const handleStopSession = () => {
    if (sessionId) {
      disconnectPOSSession(sessionId);
    }
    setLocalUrl(null);
    onSessionStopped();
    setIsConnected(false);
    toast({ title: "Session Ended", description: "Mobile scanner session disconnected." });
  };

  if (isSessionActive && localUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5 text-purple-600" />
            <span>Mobile Scanner Link</span>
          </CardTitle>
          <CardDescription>Scan this QR code with a mobile device on the same local network.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="p-2 border border-gray-300 rounded-lg bg-white">
              <QRCode value={localUrl} size={180} level="H" />
            </div>
          </div>
          
          <div className="text-sm font-mono text-gray-600 truncate">
            {localUrl}
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            {isConnected ? (
              <Badge className="bg-green-500 hover:bg-green-500">
                <CheckCircle className="h-4 w-4 mr-1" /> Connected
              </Badge>
            ) : (
              <Badge variant="secondary">
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> Awaiting Connection
              </Badge>
            )}
          </div>

          <Button onClick={handleStopSession} variant="destructive" className="w-full">
            <X className="h-4 w-4 mr-2" />
            Stop Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Link className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <h3 className="font-semibold text-lg">Remote Mobile Scanner</h3>
        </div>
        <p className="text-sm text-gray-600">
          Use a mobile device camera as a remote scanner for this POS terminal.
        </p>
        <Button onClick={handleStartSession} className="w-full">
          <QrCode className="h-4 w-4 mr-2" />
          Generate Scanner Link
        </Button>
      </CardContent>
    </Card>
  );
};

export default MobileScannerLink;