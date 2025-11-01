"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { getMockUserById } from '@/utils/userUtils'; // Import helper

// Helper function to fetch user profile and merge with auth data
const fetchUserProfile = async (supabaseUser: any): Promise<User | null> => {
  if (!supabaseUser) return null;
  
  // 1. Fetch profile data from public.profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role, reseller_id, first_name, last_name, phone, whatsapp')
    .eq('id', supabaseUser.id)
    .single();
    
  if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means 'no rows found'
    console.error("Error fetching profile:", profileError);
  }
  
  // 2. Determine role and name (Prioritize Supabase profile data)
  const role: UserRole = (profileData?.role as UserRole) || 'customer';
  
  const firstName = profileData?.first_name || supabaseUser.user_metadata?.first_name || '';
  const lastName = profileData?.last_name || supabaseUser.user_metadata?.last_name || '';
  const name = `${firstName} ${lastName}`.trim() || supabaseUser.email;

  // 3. Get mock data for extra fields (like commissionRate, totalEarnings)
  const mockUser = getMockUserById(supabaseUser.id);

  const user: User = {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: name,
    role: role, // Use role determined from Supabase profile
    isActive: true, // Assuming active unless explicitly deactivated
    createdAt: new Date(supabaseUser.created_at),
    updatedAt: new Date(),
    email_verified: supabaseUser.email_confirmed_at !== null,
    
    // Merge profile data and mock data for extra fields
    commissionRate: mockUser?.commissionRate,
    totalEarnings: mockUser?.totalEarnings,
    totalSales: mockUser?.totalSales,
    
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
  updateUser: (userData: Partial<User>) => Promise<void>;
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
          // Force a fresh profile fetch every time the session is set
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
        
        // Clear local storage state explicitly upon successful logout
        localStorage.removeItem('auth-storage');

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: async (userData: Partial<User>) => {
        const { user } = get();
        if (!user) return;

        // 1. Parse name into first_name and last_name for Supabase
        let firstName = user.name.split(' ')[0];
        let lastName = user.name.split(' ').slice(1).join(' ');
        
        if (userData.name) {
            const parts = userData.name.split(' ');
            firstName = parts[0];
            lastName = parts.slice(1).join(' ');
        }

        const profileUpdateData: Record<string, any> = {
            updated_at: new Date().toISOString(),
            first_name: firstName,
            last_name: lastName,
            phone: userData.phone,
            whatsapp: userData.whatsapp,
        };
        
        // Filter out undefined values
        Object.keys(profileUpdateData).forEach(key => profileUpdateData[key] === undefined && delete profileUpdateData[key]);

        // 2. Update Supabase profiles table
        const { error } = await supabase
            .from('profiles')
            .update(profileUpdateData)
            .eq('id', user.id);

        if (error) {
            console.error('Supabase profile update error:', error);
            throw new Error(error.message);
        }

        // 3. Update local store state with merged data
        set({ user: { ...user, ...userData, updatedAt: new Date() } });
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