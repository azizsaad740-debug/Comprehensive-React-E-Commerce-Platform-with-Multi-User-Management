"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { getMockUserById, updateMockUser, mockUsers, mockPasswords } from '@/utils/userUtils'; // Import mock utilities

// Helper function to simulate fetching user data after login
const findAndLoadUser = (email: string, password: string): User | null => {
  const user = mockUsers.find(u => u.email === email);
  if (user && mockPasswords[email] === password) {
    // Return a fresh copy of the user data, potentially merging with mock data
    const mockData = getMockUserById(user.id);
    return { ...user, ...mockData };
  }
  return null;
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, resellerId?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  hasRole: (role: User['role'] | User['role'][]) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const user = findAndLoadUser(email, password);

        if (!user) {
          set({ isLoading: false });
          throw new Error("Invalid email or password");
        }
        
        if (!user.isActive) {
          set({ isLoading: false });
          throw new Error("Account is inactive");
        }

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: async () => {
        set({ isLoading: true });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Clear local storage state explicitly upon successful logout
        localStorage.removeItem('auth-storage');

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: async (userData: Partial<User>) => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update mock user data in userUtils
        const updatedUser = updateMockUser({ ...user, ...userData });

        if (!updatedUser) {
            set({ isLoading: false });
            throw new Error("Failed to update user profile in mock DB.");
        }

        // Update local store state with merged data
        set({ user: updatedUser, isLoading: false });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      hasRole: (role: User['role'] | User['role'][]) => {
        const { user } = get();
        if (!user) return false;
        return Array.isArray(role) ? role.includes(user.role) : user.role === role;
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;

        // Superuser has all permissions
        if (user.role === 'superuser') {
          return true;
        }

        // Role-based permissions
        switch (user.role) {
          case 'admin':
            return true; // Admin has all standard permissions
          case 'reseller':
            return [
              'view_dashboard',
              'view_orders',
              'update_order_status',
              'view_customers',
              'view_promo_codes',
              'view_commissions',
              'update_profile'
            ].includes(permission);
          case 'customer':
            return [
              'view_products',
              'add_to_cart',
              'view_orders',
              'create_order',
              'update_profile'
            ].includes(permission);
          default:
            return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);