"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User as UserIcon, Mail, Phone, MessageSquare, Save, MapPin, Palette, Lock, Eye, EyeOff } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';

const ProfilePage = () => {
  const { user, isAuthenticated, updateUser, isLoading: authLoading } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<User>>({});
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setNewEmail(user.email);
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    if (newEmail && newEmail !== user.email) {
        // Supabase requires re-authentication for email change, which is handled internally.
        // The user will receive a confirmation email.
    }

    setIsSaving(true);
    try {
      await updateUser(formData, newPassword || undefined, newEmail || undefined);

      toast({
        title: "Success",
        description: "Profile updated successfully! Check your email if you changed your address.",
      });
      
      // Clear password fields after successful update
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
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
            <CardTitle>Account & Personal Information</CardTitle>
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

              {/* Email Change */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={newEmail || ''}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {newEmail !== user.email && (
                    <p className="text-sm text-orange-500">Changing email requires confirmation via a link sent to the new address.</p>
                )}
              </div>
              
              <Separator />
              
              {/* Password Change */}
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="text-lg font-semibold flex items-center">
                    <Lock className="h-5 w-5 mr-2" /> Change Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Leave blank to keep current password"
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={!newPassword}
                        />
                    </div>
                </div>
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