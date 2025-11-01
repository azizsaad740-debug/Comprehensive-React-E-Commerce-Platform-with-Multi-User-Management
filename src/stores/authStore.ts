"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Helper function to fetch user profile and merge with auth data
const fetchUserProfile = async (supabaseUser: any): Promise<User | null> => {
  if (!supabaseUser) return null;

  // 1. Fetch profile data from public.profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role, reseller_id, first_name, last_name, phone, whatsapp')
    .eq('id', supabaseUser.id)
    .single();

  // Fallback role if profile doesn't exist yet (e.g., right after signup before trigger fires)
  const role: UserRole = (profileData?.role as UserRole) || 'customer';
  const name = `${profileData?.first_name || ''} ${profileData?.last_name || ''}`.trim() || supabaseUser.email;

  // Mocking complex fields based on role, as they are not in the basic profile table
  let mockUser: Partial<User> = {};
  if (role === 'admin') {
    mockUser = { commissionRate: undefined, totalEarnings: undefined };
  } else if (role === 'reseller') {
    mockUser = { commissionRate: 15, totalEarnings: 5000 };
  }

  const user: User = {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: name,
    role: role,
    isActive: true, // Assuming active unless explicitly deactivated
    createdAt: new Date(supabaseUser.created_at),
    updatedAt: new Date(),
    email_verified: supabaseUser.email_confirmed_at !== null,
    
    // Merge profile data
    ...mockUser,
    resellerId: profileData?.reseller_id,
    phone: profileData?.phone || '',
    whatsapp: profileData?.whatsapp || '',
  };

  return user;
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, resellerId?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  hasRole: (role: User['role'] | User['role'][]) => boolean;
  hasPermission: (permission: string) => boolean;
  setSession: (session: any | null) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setSession: async (session) => {
        set({ isLoading: true });
        if (session?.user) {
          const user = await fetchUserProfile(session.user);
          set({
            user,
            token: session.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      login: async (email: string, password: string, resellerId?: string) => {
        set({ isLoading: true });
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          set({ isLoading: false });
          throw new Error(error.message);
        }
        
        if (data.session) {
          await get().setSession(data.session);
        }
      },

      logout: async () => {
        set({ isLoading: true });
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          set({ isLoading: false });
          throw new Error(error.message);
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData, updatedAt: new Date() } });
        }
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

        // Role-based permissions
        switch (user.role) {
          case 'admin':
            return true; // Admin has all permissions
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
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);