"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MapPin, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Address } from '@/types';
import { getAddressesByUserId, addOrUpdateAddress, deleteAddress } from '@/utils/userUtils';
import AddressForm from '@/components/profile/AddressForm';

const AddressBookPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/auth/login');
    }
    if (user) {
      // Load addresses for the current user
      setAddresses(getAddressesByUserId(user.id));
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  const refreshAddresses = () => {
    if (user) {
      setAddresses(getAddressesByUserId(user.id));
    }
  };

  const handleSaveAddress = async (addressData: Partial<Address>) => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      addOrUpdateAddress(user.id, addressData);
      refreshAddresses();
      
      toast({
        title: "Success",
        description: addressData.id ? "Address updated successfully!" : "New address added!",
      });
      
      setIsFormOpen(false);
      setEditingAddress(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save address.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    if (!user) return;
    
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        deleteAddress(user.id, addressId);
        refreshAddresses();
        toast({
          title: "Deleted",
          description: "Address removed successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete address.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(undefined);
    setIsFormOpen(true);
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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Address Book</h1>
          <Button variant="outline" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </div>
        
        {isFormOpen ? (
          <div className="mb-8">
            <AddressForm
              initialAddress={editingAddress}
              onSubmit={handleSaveAddress}
              onCancel={() => setIsFormOpen(false)}
              isSaving={isSaving}
            />
          </div>
        ) : (
          <div className="flex justify-end mb-8">
            <Button onClick={handleAddNew}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.length === 0 ? (
            <Card className="md:col-span-2 text-center py-12">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No saved addresses found.</p>
            </Card>
          ) : (
            addresses.map((address) => (
              <Card key={address.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span>{address.isDefault ? 'Default Address' : 'Saved Address'}</span>
                  </CardTitle>
                  {address.isDefault && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Default</Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="font-medium">{address.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {address.street}, {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.country} | Phone: {address.phone}
                  </p>
                  
                  <div className="flex space-x-2 pt-2 border-t mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(address)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteAddress(address.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AddressBookPage;