"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { getMockUserById, updateMockUser, mockUsers, mockPasswords } from '@/utils/userUtils'; // Import mock utilities
import { supabase } from '@/integrations/supabase/client';

// Helper function to simulate fetching user data after login
const findAndLoadUser = async (supabaseUserId: string): Promise<User | null> => {
  // 1. Fetch user data from the public.profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUserId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means 'no rows found'
    console.error("Error fetching profile:", profileError);
    // Fallback: If profile doesn't exist, we might need to create it (handled by trigger, but good to check)
  }
  
  // 2. Get the current Supabase user object (contains email)
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) return null;

  // 3. Merge data: Use profile data if available, otherwise use auth data and mock defaults
  const user: User = {
    id: authUser.id,
    email: authUser.email || '',
    name: profileData?.first_name || authUser.email?.split('@')[0] || 'User',
    role: profileData?.role || 'customer',
    isActive: true, // Assuming Supabase users are active unless explicitly disabled
    createdAt: new Date(authUser.created_at),
    updatedAt: new Date(),
    phone: profileData?.phone || '',
    whatsapp: profileData?.whatsapp || '',
    commissionRate: profileData?.commission_rate || undefined,
    resellerId: profileData?.reseller_id || undefined,
    // totalSales/totalEarnings are mock-only fields, not stored in Supabase profiles yet
  };
  
  return user;
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, resellerId?: string) => Promise<void>;
  logout: () => void;
  syncUser: (supabaseUserId: string) => Promise<void>;
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

      syncUser: async (supabaseUserId: string) => {
        set({ isLoading: true });
        const user = await findAndLoadUser(supabaseUserId);
        
        if (user) {
          set({ user, isAuthenticated: true, isLoading: false });
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          set({ isLoading: false });
          throw new Error(error.message);
        }
        
        if (data.user) {
          await get().syncUser(data.user.id);
        }
      },
      
      register: async (email: string, password: string, name: string, resellerId?: string) => {
        set({ isLoading: true });
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: name.split(' ')[0] || name,
              last_name: name.split(' ').slice(1).join(' ') || '',
              role: 'customer', // Default role
              resellerId: resellerId || null,
            }
          }
        });

        if (error) {
          set({ isLoading: false });
          throw new Error(error.message);
        }
        
        // Note: Supabase automatically signs in after signup. syncUser will handle profile creation/sync.
        if (data.user) {
          await get().syncUser(data.user.id);
        }
      },

      logout: async () => {
        set({ isLoading: true });
        await supabase.auth.signOut();
        
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
        
        // 1. Update Supabase Auth metadata (for name/role if needed, though role is in profile)
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            first_name: userData.name?.split(' ')[0],
            last_name: userData.name?.split(' ').slice(1).join(' '),
          }
        });
        
        if (authError) {
          set({ isLoading: false });
          throw new Error(authError.message);
        }

        // 2. Update public.profiles table
        const profileUpdateData: Record<string, any> = {
          first_name: userData.name?.split(' ')[0],
          last_name: userData.name?.split(' ').slice(1).join(' '),
          phone: userData.phone,
          whatsapp: userData.whatsapp,
          role: userData.role,
          commission_rate: userData.commissionRate,
          reseller_id: userData.resellerId,
          updated_at: new Date().toISOString(),
        };
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdateData)
          .eq('id', user.id);

        if (profileError) {
            set({ isLoading: false });
            throw new Error(profileError.message);
        }

        // 3. Sync local store state
        await get().syncUser(user.id);
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