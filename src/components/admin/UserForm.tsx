"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { User, UserRole } from '@/types';
import { Save, X, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore'; // NEW IMPORT

interface UserFormProps {
  initialUser: User;
  onSubmit: (userData: Partial<User>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const roleOptions: UserRole[] = ['admin', 'reseller', 'customer', 'counter'];

const UserForm: React.FC<UserFormProps> = ({ initialUser, onSubmit, onCancel, isSaving }) => {
  const { user: currentUser, hasRole } = useAuthStore();
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    setFormData({
      id: initialUser.id,
      name: initialUser.name,
      email: initialUser.email,
      role: initialUser.role,
      isActive: initialUser.isActive,
      commissionRate: initialUser.commissionRate || 0,
      resellerId: initialUser.resellerId || '',
    });
  }, [initialUser]);

  const handleChange = (field: keyof User, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleRoleChange = (role: UserRole) => {
    handleChange('role', role);
    // Reset reseller specific fields if not a reseller
    if (role !== 'reseller') {
      handleChange('commissionRate', 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.role) {
      alert('Please fill in all required fields.');
      return;
    }
    
    const dataToSubmit: Partial<User> = {
      ...formData,
      commissionRate: formData.role === 'reseller' ? Number(formData.commissionRate) : undefined,
      resellerId: formData.role === 'customer' && formData.resellerId ? formData.resellerId : undefined,
    };
    
    onSubmit(dataToSubmit);
  };

  const isReseller = formData.role === 'reseller';
  const isCustomer = formData.role === 'customer';
  
  // Only Superuser can change roles
  const canEditRole = hasRole('superuser');

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={formData.email || ''}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Role and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select 
            value={formData.role} 
            onValueChange={handleRoleChange}
            disabled={!canEditRole || isSaving} // Disable role change if not superuser
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map(role => (
                <SelectItem key={role} value={role} className="capitalize">
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!canEditRole && <p className="text-xs text-red-500">Only Superuser can change roles.</p>}
        </div>
        
        <div className="flex items-center space-x-4 pt-6">
          <Switch
            id="isActive"
            checked={!!formData.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
            disabled={isSaving}
          />
          <Label htmlFor="isActive">User is Active</Label>
        </div>
      </div>
      
      {/* Reseller Specific Fields */}
      {(isReseller || isCustomer) && (
        <div className="border p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">{isReseller ? 'Reseller Settings' : 'Customer Settings'}</h3>
          
          {isReseller && (
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                min={0}
                max={100}
                step={1}
                value={formData.commissionRate || 0}
                onChange={(e) => handleChange('commissionRate', Number(e.target.value))}
                required
                disabled={!canEditRole || isSaving}
              />
            </div>
          )}
          
          {isCustomer && (
            <div className="space-y-2">
              <Label htmlFor="resellerId">Referred by Reseller ID (Optional)</Label>
              <Input
                id="resellerId"
                value={formData.resellerId || ''}
                onChange={(e) => handleChange('resellerId', e.target.value)}
                placeholder="Enter Reseller ID (e.g., u2)"
                disabled={!canEditRole || isSaving}
              />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;