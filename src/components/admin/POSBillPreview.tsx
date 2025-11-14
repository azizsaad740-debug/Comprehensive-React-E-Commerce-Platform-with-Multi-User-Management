"use client";

import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Printer, X, QrCode, Phone, Mail, MapPin } from 'lucide-react';
import { Order, POSBillSettings } from '@/types';
import { useCheckoutSettingsStore } from '@/stores/checkoutSettingsStore';
import { useThemeStore } from '@/stores/themeStore';
import { useContentStore } from '@/stores/contentStore';
import * as QRCodeModule from 'qrcode.react'; // Changed to wildcard import

// Manually resolve the QRCode component from the imported module to handle CJS/ESM interop
const QRCode = (QRCodeModule as any).default || QRCodeModule;

interface POSBillPreviewProps {
  order: Order;
// ... (rest of the file remains unchanged)