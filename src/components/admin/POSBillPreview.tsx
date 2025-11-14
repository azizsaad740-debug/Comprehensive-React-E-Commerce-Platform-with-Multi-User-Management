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
import { QRCode } from 'qrcode.react'; // Changed to named import

interface POSBillPreviewProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

// Component for the printable bill content
const PrintableBillContent: React.FC<{ order: Order, settings: POSBillSettings }> = ({ order, settings }) => {
  const { currencySymbol } = useCheckoutSettingsStore();
  const { contactInfo } = useContentStore();
  const now = new Date();

  return (
    <div className="p-4 text-black bg-white w-full max-w-sm mx-auto font-mono text-xs">
      {/* Header */}
      <div className="text-center mb-4 border-b border-dashed pb-4">
        {settings.headerLogoUrl && (
          <img src={settings.headerLogoUrl} alt="Logo" className="h-10 w-auto mx-auto mb-2" />
        )}
        <h1 className="text-lg font-bold uppercase">{settings.headerTitle}</h1>
        <p className="text-xs">{settings.headerTagline}</p>
      </div>

      {/* Order Info */}
      <div className="space-y-1 mb-4">
        <p>Order ID: {order.id}</p>
        <p>Customer: {order.shippingAddress.fullName}</p>
        {settings.showDateTime && (
          <>
            <p>Date: {order.createdAt.toLocaleDateString()}</p>
            <p>Time: {order.createdAt.toLocaleTimeString()}</p>
          </>
        )}
        <p>Payment: {order.paymentMethod}</p>
      </div>

      {/* Items Table */}
      <table className="w-full mb-4">
        <thead>
          <tr className="border-t border-b border-dashed">
            <th className="text-left py-1">Item</th>
            <th className="text-right py-1">Qty</th>
            <th className="text-right py-1">Price</th>
            <th className="text-right py-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index} className="border-b border-dotted">
              <td className="py-1 text-left pr-2">{item.productId === '1' ? 'T-Shirt' : item.productId === '2' ? 'Mug' : 'Product'}</td>
              <td className="py-1 text-right">{item.quantity}</td>
              <td className="py-1 text-right">{currencySymbol}{item.price.toFixed(2)}</td>
              <td className="py-1 text-right">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="space-y-1 mb-4 text-right">
        <p>Subtotal: {currencySymbol}{order.subtotal.toFixed(2)}</p>
        {order.discountAmount > 0 && (
          <p className="text-green-600 font-bold">Discount: -{currencySymbol}{order.discountAmount.toFixed(2)}</p>
        )}
        <p>Tax ({order.taxAmount > 0 ? (order.taxAmount / order.subtotal * 100).toFixed(0) : 0}%): {currencySymbol}{order.taxAmount.toFixed(2)}</p>
        <p className="text-base font-bold border-t border-dashed pt-2">Total: {currencySymbol}{order.totalAmount.toFixed(2)}</p>
        
        {order.promoCodeApplied && (
            <p className="text-xs mt-2">Applied Promo: {order.promoCodeApplied}</p>
        )}
      </div>

      {/* Footer */}
      <div className="text-center border-t border-dashed pt-4 space-y-3">
        <p className="text-xs whitespace-pre-wrap">{settings.footerMessage}</p>
        
        {settings.showQrCode && (
          <div className="flex justify-center">
            <QRCode value={order.id} size={80} level="L" />
          </div>
        )}
        
        {settings.showContactInfo && (
          <div className="space-y-1 text-xs">
            <p className="flex items-center justify-center space-x-1">
              <Phone className="h-3 w-3" /> <span>{contactInfo.phone}</span>
            </p>
            <p className="flex items-center justify-center space-x-1">
              <Mail className="h-3 w-3" /> <span>{contactInfo.email}</span>
            </p>
            <p className="flex items-center justify-center space-x-1">
              <MapPin className="h-3 w-3" /> <span>{order.shippingAddress.city}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


const POSBillPreview: React.FC<POSBillPreviewProps> = ({ order, isOpen, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { posBillSettings } = useThemeStore();

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>POS Receipt</title>');
        // Inject minimal CSS for print formatting
        printWindow.document.write('<style>');
        printWindow.document.write(`
          @page { size: 80mm auto; margin: 0; }
          body { margin: 0; padding: 0; font-family: monospace; font-size: 10px; }
          .bill-content { width: 80mm; margin: 0 auto; padding: 5mm; }
          table { border-collapse: collapse; }
          th, td { padding: 2px 0; }
          .border-dashed { border-style: dashed; }
          .border-dotted { border-style: dotted; }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write('<div class="bill-content">');
        printWindow.document.write(printRef.current.innerHTML);
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span>POS Receipt - {order.id}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 pt-0">
          {/* Printable Area */}
          <div ref={printRef} className="bg-white shadow-inner">
            <PrintableBillContent order={order} settings={posBillSettings} />
          </div>
          
          <Separator className="my-4" />
          
          <Button onClick={handlePrint} className="w-full">
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default POSBillPreview;