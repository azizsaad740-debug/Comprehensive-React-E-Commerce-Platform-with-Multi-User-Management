"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QrCode, Link, RefreshCw, X, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import * as QRCodeModule from 'qrcode.react'; // Changed to wildcard import
import { startPOSSession, disconnectPOSSession, getSessionStatus } from '@/utils/posLinkUtils';
import { useToast } from '@/hooks/use-toast';

// Manually resolve the QRCode component from the imported module to handle CJS/ESM interop
const QRCode = (QRCodeModule as any).default || QRCodeModule;

interface MobileScannerLinkProps {
  onSessionStarted: (sessionId: string) => void;
// ... (rest of the file remains unchanged)