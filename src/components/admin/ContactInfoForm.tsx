"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RefreshCw, MapPin, Phone, Mail } from 'lucide-react';
import { useContentStore } from '@/stores/contentStore';
import { useToast } from '@/hooks/use-toast';

const ContactInfoForm: React.FC = () => {
  const { contactInfo, updateContactInfo } = useContentStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState(contactInfo);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData(contactInfo);
  }, [contactInfo]);

  const handleChange = (field: keyof typeof contactInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      updateContactInfo(formData);
      toast({ title: "Success", description: "Contact information updated." });
      setIsLoading(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Phone className="h-5 w-5" />
          <span>Footer Contact Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> Address</Label>
            <Input id="address" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center"><Phone className="h-4 w-4 mr-2" /> Phone Number</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center"><Mail className="h-4 w-4 mr-2" /> Email Address</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Contact Info
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactInfoForm;