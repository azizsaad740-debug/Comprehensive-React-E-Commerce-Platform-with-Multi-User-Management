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
import QRCode from 'qrcode.react'; // Standard default import

interface POSBillPreviewProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

const POSBillPreview: React.FC<POSBillPreviewProps> = ({ order, isOpen, onClose }) => {
  const billRef = useRef<HTMLDivElement>(null);
  const { currencySymbol } = useCheckoutSettingsStore();
  const { posBillSettings } = useThemeStore();
  const { contactInfo } = useContentStore();

  const handlePrint = () => {
    if (billRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>POS Receipt</title>');
        // Inject minimal styling for receipt format
        printWindow.document.write('<style>');
        printWindow.document.write(`
          body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; }
          .receipt { width: 300px; margin: 0 auto; }
          .header, .footer { text-align: center; margin-bottom: 10px; }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .item-name { flex: 1; }
          .item-qty { width: 30px; text-align: center; }
          .item-price { width: 60px; text-align: right; }
          .separator { border-top: 1px dashed #000; margin: 10px 0; }
          .total { font-size: 14px; font-weight: bold; }
          @media print {
            .no-print { display: none; }
          }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write('<div class="receipt">');
        printWindow.document.write(billRef.current.innerHTML);
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };
  
  const orderDate = order.createdAt.toLocaleString();
  const orderTotal = order.totalAmount.toFixed(2);
  const orderSubtotal = (order.totalAmount - order.taxAmount + order.discountAmount).toFixed(2);
  const orderTax = order.taxAmount.toFixed(2);
  const orderDiscount = order.discountAmount.toFixed(2);
  const orderId = order.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>POS Receipt Preview</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div ref={billRef} className="receipt w-full max-w-[300px] mx-auto text-xs text-gray-900">
            
            {/* Header */}
            <div className="header space-y-1">
              {posBillSettings.headerLogoUrl && (
                <img src={posBillSettings.headerLogoUrl} alt="Logo" className="h-8 mx-auto mb-2" />
              )}
              <h3 className="text-sm font-bold uppercase">{posBillSettings.headerTitle}</h3>
              <p className="text-xs">{posBillSettings.headerTagline}</p>
              <Separator className="my-2 border-dashed border-gray-400" />
            </div>
            
            {/* Order Info */}
            <div className="space-y-1 mb-3">
              <p>Order ID: <span className="font-mono">{orderId}</span></p>
              <p>Customer: {order.customerId === 'pos-guest-0000' ? 'Guest' : order.customerId}</p>
              {posBillSettings.showDateTime && <p>Date: {orderDate}</p>}
              <p>Payment: {order.paymentMethod}</p>
            </div>
            
            {/* Items Table */}
            <div className="separator"></div>
            <div className="item font-bold mt-2">
              <span className="item-name">Item</span>
              <span className="item-qty">Qty</span>
              <span className="item-price">Total</span>
            </div>
            <div className="separator"></div>
            
            {order.items.map((item, index) => (
              <div key={index} className="item">
                <span className="item-name">{item.productId === '1' ? 'Custom T-Shirt' : 'Mug'}</span>
                <span className="item-qty">{item.quantity}</span>
                <span className="item-price">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            
            <div className="separator"></div>
            
            {/* Summary */}
            <div className="space-y-1 text-right">
              <div className="flex justify-between"><span>Subtotal:</span><span>{currencySymbol}{orderSubtotal}</span></div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-red-600"><span>Discount:</span><span>-{currencySymbol}{orderDiscount}</span></div>
              )}
              <div className="flex justify-between"><span>Tax:</span><span>{currencySymbol}{orderTax}</span></div>
              <div className="flex justify-between total mt-2"><span>TOTAL:</span><span>{currencySymbol}{orderTotal}</span></div>
            </div>
            
            <div className="separator"></div>
            
            {/* Footer */}
            <div className="footer space-y-2 mt-3">
              {posBillSettings.showQrCode && (
                <div className="flex justify-center mb-3">
                  <QRCode value={orderId} size={80} level="L" />
                </div>
              )}
              
              <p className="text-center">{posBillSettings.footerMessage}</p>
              
              {posBillSettings.showContactInfo && (
                <div className="text-center space-y-1 pt-2 border-t border-dashed">
                  <div className="flex items-center justify-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>{contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>{contactInfo.email}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t space-x-2 no-print">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" /> Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default POSBillPreview;