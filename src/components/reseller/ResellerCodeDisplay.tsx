"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, Tag, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPromoCodesByResellerId } from '@/utils/promoCodeUtils';

interface ResellerCodeDisplayProps {
  resellerId: string;
}

const ResellerCodeDisplay: React.FC<ResellerCodeDisplayProps> = ({ resellerId }) => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const promoCodes = getPromoCodesByResellerId(resellerId);
  
  // Find the primary auto-assigned code
  const primaryCode = promoCodes.find(code => code.autoAssignReseller);

  // Mocking the referral link generation based on user ID
  const referralLink = `${window.location.origin}/auth/register?ref=${resellerId}`;

  const handleCopy = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      toast({ title: "Copied!", description: "Promo code copied to clipboard." });
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      toast({ title: "Copied!", description: "Referral link copied to clipboard." });
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Primary Promo Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Tag className="h-5 w-5 text-purple-600" />
            <span>Your Primary Promo Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {primaryCode ? (
            <>
              <p className="text-sm text-gray-600">
                Share this code to give customers {primaryCode.discountValue}% off and ensure you earn commission.
              </p>
              <div className="flex space-x-2">
                <div className="flex-1 p-3 bg-gray-100 rounded-md border border-dashed font-mono text-lg font-bold text-primary truncate">
                  {primaryCode.code}
                </div>
                <Button onClick={() => handleCopy(primaryCode.code, 'code')} disabled={copiedCode}>
                  {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No primary auto-assigned code found.</p>
          )}
        </CardContent>
      </Card>

      {/* Referral Link Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Link className="h-5 w-5 text-blue-600" />
            <span>Your Referral Link</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Share this link to automatically link new sign-ups to your account.
          </p>
          <div className="flex space-x-2">
            <div className="flex-1 p-3 bg-gray-100 rounded-md border border-dashed font-mono text-sm text-gray-700 truncate">
              {referralLink}
            </div>
            <Button onClick={() => handleCopy(referralLink, 'link')} disabled={copiedLink}>
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResellerCodeDisplay;