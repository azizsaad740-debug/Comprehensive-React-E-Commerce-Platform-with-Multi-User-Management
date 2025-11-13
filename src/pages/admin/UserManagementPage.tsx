"use client";

import React, { useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { User } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { DataTable } from '../../components/data-table/DataTable.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react';
import { getAllMockUsers, updateMockUser, deleteMockUser } from '@/utils/userUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UserForm from '@/components/admin/UserForm';
import { useToast } from '@/hooks/use-toast';

const UserManagementPage = () => {
  // Fetch users from centralized utility (which now filters out superuser)
  const [users, setUsers] = useState(getAllMockUsers());
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const refreshUsers = () => {
    // Force a refresh of the mock data
    setUsers(getAllMockUsers().map(u => ({ ...u })));
  };

  const handleOpenForm = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(undefined);
  };

  const handleSaveUser = (userData: Partial<User>) => {
    if (!userData.id) return; // Should only be editing existing users here

    setIsSaving(true);
    
    setTimeout(() => {
      try {
        const updatedUser = updateMockUser(userData);
        
        if (updatedUser) {
          refreshUsers();
          toast({
            title: "Success",
            description: `User ${updatedUser.name} updated successfully.`,
          });
          handleCloseForm();
        } else {
          toast({
            title: "Error",
            description: "Failed to update user.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }, 500);
  };
  
  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete the user: ${userName}? This action cannot be undone.`)) {
      try {
        if (deleteMockUser(userId)) {
          refreshUsers();
          toast({
            title: "User Deleted",
            description: `${userName} has been permanently removed.`,
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  // Redefine columns to include handlers
  const columns: ColumnDef<User>[] = [
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
        // Prevent regular admins from editing or deleting other admins/superusers (mock logic)
        const isProtected = user.role === 'admin' || user.role === 'superuser'; 
        
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
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Button onClick={() => alert('User creation is currently handled via registration flow.')} disabled>Add New User</Button>
        </div>
        <p className="text-gray-600 mb-8">Manage all customer and reseller accounts.</p>

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