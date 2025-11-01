"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User as UserIcon, Mail, Phone, MessageSquare, Save, MapPin, Palette } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';

const ProfilePage = () => {
  const { user, isAuthenticated, updateUser, isLoading: authLoading } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<User>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/auth/login');
    }
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
      });
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUser(formData);

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading profile or redirecting...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Email (Read-only for simplicity) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    value={formData.email || ''}
                    className="pl-10 bg-gray-100 cursor-not-allowed"
                    readOnly
                  />
                </div>
                <p className="text-sm text-gray-500">Email cannot be changed here.</p>
              </div>

              <Separator />

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp || ''}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                      className="pl-10"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              {/* Role Display */}
              <div className="pt-4">
                <p className="text-sm font-medium text-gray-700">Account Role: <span className="capitalize font-bold text-primary">{user.role}</span></p>
              </div>

              <Button type="submit" disabled={isSaving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Address Book Link */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Manage your saved shipping and billing addresses.</p>
              <Button variant="outline" onClick={() => navigate('/profile/addresses')}>
                <MapPin className="h-4 w-4 mr-2" />
                Go to Address Book
              </Button>
            </CardContent>
          </Card>
          
          {/* Design Library Link */}
          <Card>
            <CardHeader>
              <CardTitle>Design Library</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">View and reorder products using your saved designs.</p>
              <Button variant="outline" onClick={() => navigate('/profile/designs')}>
                <Palette className="h-4 w-4 mr-2" />
                Go to Design Library
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;