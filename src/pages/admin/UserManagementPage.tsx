"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { User } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '../../components/data-table/DataTable.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { getAllMockUsers, updateMockUser, deleteMockUser } from '@/utils/userUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UserForm from '@/components/admin/UserForm';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';

// NOTE: Since mockUsers is now minimal, we need a way to fetch all users from Supabase.
// This is a simplified mock fetch for demonstration purposes.
const fetchAllUsersFromSupabase = async (): Promise<User[]> => {
    // NOTE: This requires the Supabase Admin API (Service Role Key) which is not exposed client-side.
    // We are simulating this fetch using the client-side API, which is limited to RLS policies.
    // For a real admin panel, this should be done via an Edge Function or server.
    
    // Mocking the list of users based on profiles table (which is RLS protected)
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');
        
    if (profileError) {
        console.error("Error fetching profiles:", profileError);
        return [];
    }
    
    // Since we can't fetch all auth.users, we rely on the profiles table data
    return profiles.map(profile => {
        const email = profile.email || 'N/A';
        
        let role = profile.role || 'customer';
        if (email === 'azizsaad740@gmail.com' || email === 'superuser@example.com') {
            role = 'superuser';
        }
        
        return {
            id: profile.id,
            email: email,
            name: profile.first_name || email.split('@')[0] || 'User',
            role: role,
            isActive: true, // Assuming active if profile exists
            createdAt: new Date(profile.created_at || Date.now()),
            updatedAt: new Date(profile.updated_at || Date.now()),
            commissionRate: profile.commission_rate,
            resellerId: profile.reseller_id,
        } as User;
    }).filter(u => u.role !== 'superuser'); // Filter out superuser from the list view
};


const UserManagementPage = () => {
  const { toast } = useToast();
  const { user: currentUser, hasRole, updateUser } = useAuthStore();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const refreshUsers = async () => {
    setIsFetching(true);
    const fetchedUsers = await fetchAllUsersFromSupabase();
    setUsers(fetchedUsers);
    setIsFetching(false);
  };
  
  useEffect(() => {
      refreshUsers();
  }, []);

  const handleOpenForm = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(undefined);
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    if (!userData.id) return; 

    setIsSaving(true);
    
    try {
        // We pass the entire userData object to authStore.updateUser, which handles the profile update.
        await updateUser(userData);
        
        toast({
            title: "Success",
            description: `User ${userData.name} updated successfully.`,
        });
        handleCloseForm();
        refreshUsers();
        
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.message || "Failed to update user.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleDeleteUser = (userId: string, userName: string) => {
    // NOTE: Deleting users requires Supabase Admin API (Service Role Key)
    if (window.confirm(`Are you sure you want to delete the user: ${userName}? This action cannot be undone.`)) {
      toast({
        title: "Action Blocked",
        description: "User deletion requires Supabase Admin privileges (Service Role Key). Action simulated.",
        variant: "destructive",
      });
      // Simulate deletion success for UI consistency
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  // Redefine columns to include handlers
  const columns: ColumnDef<User>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as User['role'];
        return (
          <Badge variant={role === 'admin' ? 'destructive' : role === 'reseller' ? 'default' : 'secondary'} className="capitalize">
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? 'default' : 'outline'} className={isActive ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        // Only Superuser can edit/delete other admins/superusers (mock logic)
        const isProtected = user.role === 'admin' && !hasRole('superuser'); 
        
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleOpenForm(user)} disabled={isProtected}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id, user.name)} disabled={isProtected}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [hasRole]);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Button onClick={() => alert('User creation is currently handled via registration flow.')} disabled>Add New User</Button>
        </div>
        <p className="text-gray-600 mb-8">Manage all customer and reseller accounts.</p>
        
        <div className="p-4 mb-6 bg-yellow-100 border border-yellow-300 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-1" />
            <p className="text-sm text-yellow-800">
                User data is fetched from Supabase Auth/Profiles. Role changes are handled via RLS-protected profile updates. 
                For full user management (like deletion), a Supabase Service Role Key is required, which is not exposed client-side.
            </p>
        </div>

        <DataTable 
          columns={columns} 
          data={users} 
          filterColumnId="email"
          filterPlaceholder="Filter by email..."
        />
      </div>
      
      {/* User Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? `Edit User: ${editingUser.name}` : 'Add New User'}</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <UserForm
              initialUser={editingUser}
              onSubmit={handleSaveUser}
              onCancel={handleCloseForm}
              isSaving={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UserManagementPage;