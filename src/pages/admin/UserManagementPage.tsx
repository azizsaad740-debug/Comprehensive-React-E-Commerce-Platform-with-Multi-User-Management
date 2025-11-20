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
    // Use the updated utility function which now fetches from Supabase
    const fetchedUsers = await getAllMockUsers(); 
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
        // We pass the entire userData object, including the ID of the user being updated, 
        // to authStore.updateUser, which handles the profile update.
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
  
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete the user: ${userName}? This action cannot be undone.`)) {
      try {
        // Use the updated utility function to delete the profile
        const success = await deleteMockUser(userId);
        
        if (success) {
          toast({
            title: "Profile Deleted",
            description: `User profile for ${userName} deleted. Note: Deleting the associated auth.user record requires Supabase Admin privileges.`,
          });
          refreshUsers();
        } else {
          throw new Error("Failed to delete user profile.");
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete user.",
          variant: "destructive",
        });
      }
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
                User data is fetched directly from Supabase Profiles. Role changes are handled via RLS-protected profile updates. 
                For full user management (like deletion of auth.user), a Supabase Service Role Key is required, which is not exposed client-side.
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