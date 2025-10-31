"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, Copy, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

const ReferralLinkGenerator: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  if (!user || user.role !== 'reseller') {
    return null;
  }

  // Mocking the referral link generation based on user ID
  const referralId = user.id;
  const referralLink = `${window.location.origin}/auth/register?ref=${referralId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Link className="h-5 w-5 text-blue-600" />
          <span>Your Referral Link</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">
          Share this link to track new customer sign-ups and earn commissions.
        </p>
        <div className="flex space-x-2">
          <Input 
            type="text" 
            value={referralLink} 
            readOnly 
            className="flex-1 bg-gray-50"
          />
          <Button onClick={handleCopy} disabled={copied}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralLinkGenerator;