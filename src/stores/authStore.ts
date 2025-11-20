"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
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
    // If profile doesn't exist, we proceed to check auth user data
  }
  
  // 2. Get the current Supabase user object (contains email)
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) return null;

  // 3. Determine the role.
  let role: UserRole = profileData?.role || 'customer';
  
  // Hardcoded check for the initial superuser ID (must be manually created in Supabase Auth)
  if (authUser.email === 'azizsaad740@gmail.com' || authUser.email === 'superuser@example.com') {
    role = 'superuser';
  }

  // 4. Merge data: Use profile data if available, otherwise use auth data and defaults
  const user: User = {
    id: authUser.id,
    email: authUser.email || '',
    name: profileData?.first_name || authUser.email?.split('@')[0] || 'User',
    role: role,
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
  updateUser: (userData: Partial<User>, newPassword?: string, newEmail?: string) => Promise<void>;
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
          // If profile sync fails, keep authenticated state based on session, but clear user data
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
          // Crucially, we wait for the sync here to ensure the user object is populated
          await get().syncUser(data.user.id);
        } else {
          set({ isLoading: false });
        }
      },
      
      register: async (email: string, password: string, name: string, resellerId?: string) => {
        set({ isLoading: true });
        
        const redirectToUrl = `${window.location.origin}/auth/login`;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: name.split(' ')[0] || name,
              last_name: name.split(' ').slice(1).join(' ') || '',
              role: 'customer',
              resellerId: resellerId || null,
            },
            emailRedirectTo: redirectToUrl,
          }
        });

        if (error) {
          set({ isLoading: false });
          throw new Error(error.message);
        }
        
        if (data.user && data.session) {
             // If immediately signed in, sync the user profile
             await get().syncUser(data.user.id);
        } else {
             // If email confirmation is required, we stop loading and rely on the user confirming later
             set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        await supabase.auth.signOut();
        
        localStorage.removeItem('auth-storage');

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: async (userData: Partial<User>, newPassword?: string, newEmail?: string) => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true });
        
        const authUpdateData: { password?: string, email?: string, data?: Record<string, any> } = {};
        
        if (newPassword) {
            authUpdateData.password = newPassword;
        }
        
        if (newEmail && newEmail !== user.email) {
            authUpdateData.email = newEmail;
        }

        if (userData.name) {
            authUpdateData.data = {
                first_name: userData.name.split(' ')[0],
                last_name: userData.name.split(' ').slice(1).join(' ') || '',
            };
        }
        
        if (Object.keys(authUpdateData).length > 0) {
            const { error: authError } = await supabase.auth.updateUser(authUpdateData);
            
            if (authError) {
                set({ isLoading: false });
                throw new Error(authError.message);
            }
        }

        const profileUpdateData: Record<string, any> = {
          first_name: userData.name?.split(' ')[0] || user.name.split(' ')[0],
          last_name: userData.name?.split(' ').slice(1).join(' ') || user.name.split(' ').slice(1).join(' ') || null,
          phone: userData.phone,
          whatsapp: userData.whatsapp,
          updated_at: new Date().toISOString(),
        };
        
        if (get().hasRole(['admin', 'superuser']) && userData.role) {
            profileUpdateData.role = userData.role;
            profileUpdateData.commission_rate = userData.commissionRate;
            profileUpdateData.reseller_id = userData.resellerId;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdateData)
          .eq('id', userData.id || user.id);

        if (profileError) {
            set({ isLoading: false });
            throw new Error(profileError.message);
        }

        // Sync local store state
        await get().syncUser(userData.id || user.id);
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

        if (user.role === 'superuser') {
          return true;
        }

        switch (user.role) {
          case 'admin':
            return true;
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
          case 'counter':
            return [
              'view_dashboard',
              'pos_sale',
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