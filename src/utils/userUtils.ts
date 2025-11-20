import { User, Address, UserRole } from '@/types';
import { getMockOrders } from './orderUtils';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// --- Supabase Type Definitions ---

interface SupabaseProfile {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string; // Joined from auth.users
  role: UserRole;
  phone: string | null;
  whatsapp: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  commission_rate: number | null;
  reseller_id: string | null;
}

// Helper to convert Supabase snake_case to application camelCase
const toAppUser = (sp: SupabaseProfile): User => {
  // NOTE: Supabase profiles table doesn't store 'isActive' directly, 
  // but we assume active if the profile exists and the user is logged in.
  // We use the 'is_active' column if it exists, otherwise default to true.
  const isActive = (sp as any).is_active ?? true; 
  
  return {
    id: sp.id,
    email: sp.email,
    name: `${sp.first_name} ${sp.last_name || ''}`.trim(),
    role: sp.role,
    isActive: isActive,
    createdAt: new Date(sp.created_at),
    updatedAt: new Date(sp.updated_at),
    phone: sp.phone ?? undefined,
    whatsapp: sp.whatsapp ?? undefined,
    commissionRate: sp.commission_rate ?? undefined,
    resellerId: sp.reseller_id ?? undefined,
  };
};

// --- Mock Address Store (in-memory) - Kept temporarily until a Supabase table is created ---
const mockAddresses: Record<string, Address[]> = {
  'u3': [
    {
      id: 'a1', fullName: 'Charlie Admin', phone: '555-1234', street: '123 Main St', city: 'Anytown', state: 'CA', zipCode: '90210', country: 'USA', isDefault: true,
    },
    {
      id: 'a2', fullName: 'Charlie Admin', phone: '555-5678', street: '456 Work Ave', city: 'Tech City', state: 'CA', zipCode: '90001', country: 'USA', isDefault: false,
    },
  ],
  'u5': [
    {
      id: 'a3', fullName: 'Eve Customer', phone: '555-9999', street: '789 Home Ln', city: 'Suburbia', state: 'TX', zipCode: '77001', country: 'USA', isDefault: true,
    },
  ]
};

// --- Supabase CRUD Functions ---

const PROFILE_SELECT_FIELDS = `
  id, first_name, last_name, email, role, phone, whatsapp, is_active, created_at, updated_at, commission_rate, reseller_id
`;

/**
 * Fetches all user profiles (excluding superuser) from Supabase.
 * NOTE: This relies on RLS allowing the current user (admin/superuser) to read all profiles.
 */
export const getAllMockUsers = async (): Promise<User[]> => {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT_FIELDS)
    .neq('role', 'superuser')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching all users:", error);
    // Return empty array on error, relying on Supabase for data
    return [];
  }
  
  return (profiles as SupabaseProfile[]).map(toAppUser);
};

/**
 * Fetches a single user profile by ID from Supabase.
 */
export const getMockUserById = async (userId: string): Promise<User | undefined> => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT_FIELDS)
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching user by ID:", error);
    return undefined;
  }
  
  return profile ? toAppUser(profile as SupabaseProfile) : undefined;
};

/**
 * Updates an existing user profile in Supabase.
 * NOTE: This function is primarily used by the Admin panel.
 */
export const updateMockUser = async (updatedUserData: Partial<User>): Promise<User | undefined> => {
  if (!updatedUserData.id) return undefined;

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  
  if (updatedUserData.name !== undefined) {
    updateData.first_name = updatedUserData.name.split(' ')[0];
    updateData.last_name = updatedUserData.name.split(' ').slice(1).join(' ') || null;
  }
  if (updatedUserData.role !== undefined) updateData.role = updatedUserData.role;
  if (updatedUserData.isActive !== undefined) updateData.is_active = updatedUserData.isActive;
  if (updatedUserData.phone !== undefined) updateData.phone = updatedUserData.phone;
  if (updatedUserData.whatsapp !== undefined) updateData.whatsapp = updatedUserData.whatsapp;
  if (updatedUserData.commissionRate !== undefined) updateData.commission_rate = updatedUserData.commissionRate;
  if (updatedUserData.resellerId !== undefined) updateData.reseller_id = updatedUserData.resellerId;

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', updatedUserData.id)
    .select(PROFILE_SELECT_FIELDS)
    .single();

  if (error) {
    console.error("Error updating user profile:", error);
    throw new Error(error.message);
  }

  return data ? toAppUser(data as SupabaseProfile) : undefined;
};

/**
 * Deletes a user profile.
 * NOTE: Deleting the associated auth.user record requires the Supabase Admin API (Service Role Key).
 * This function only deletes the profile record.
 */
export const deleteMockUser = async (userId: string): Promise<boolean> => {
  // In a real app, you'd call the Admin API to delete auth.user first.
  // Here, we only delete the profile record.
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error("Error deleting user profile:", error);
    throw new Error(error.message);
  }
  
  return true;
};

/**
 * Fetches customers referred by a specific reseller ID.
 */
export const getCustomersByResellerId = async (resellerId: string): Promise<User[]> => {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT_FIELDS)
    .eq('reseller_id', resellerId)
    .eq('role', 'customer');

  if (error) {
    console.error("Error fetching referred customers:", error);
    return [];
  }
  
  const referredCustomers = (profiles as SupabaseProfile[]).map(toAppUser);
  const allOrders = getMockOrders(); // Still using mock orders utility for sales calculation

  return referredCustomers.map(customer => {
    const customerOrders = allOrders.filter(
      order => order.customerId === customer.id && order.status !== 'cancelled'
    );
    
    const totalSales = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      ...customer,
      totalSales: totalSales,
    };
  });
};

// --- Address Mock Functions (Kept for now) ---

export const getAddressesByUserId = (userId: string): Address[] => {
  return mockAddresses[userId] || [];
};

export const addOrUpdateAddress = (userId: string, address: Partial<Address>): Address => {
  if (!mockAddresses[userId]) {
    mockAddresses[userId] = [];
  }

  const existingIndex = mockAddresses[userId].findIndex(a => a.id === address.id);

  const newAddress: Address = {
    id: address.id || uuidv4(),
    fullName: address.fullName || '',
    phone: address.phone || '',
    street: address.street || '',
    city: address.city || '',
    state: address.state || '',
    zipCode: address.zipCode || '',
    country: address.country || 'USA',
    isDefault: address.isDefault ?? false,
  };

  if (newAddress.isDefault) {
    // Ensure only one address is default
    mockAddresses[userId] = mockAddresses[userId].map(a => ({ ...a, isDefault: false }));
  }

  if (existingIndex !== -1 && address.id) {
    // Update existing
    mockAddresses[userId][existingIndex] = { ...mockAddresses[userId][existingIndex], ...newAddress };
  } else {
    // Add new
    mockAddresses[userId].push(newAddress);
  }
  
  return newAddress;
};

export const deleteAddress = (userId: string, addressId: string): boolean => {
  if (!mockAddresses[userId]) return false;
  
  const initialLength = mockAddresses[userId].length;
  mockAddresses[userId] = mockAddresses[userId].filter(a => a.id !== addressId);
  
  // If the deleted address was the default, set the first remaining address as default
  if (initialLength > mockAddresses[userId].length && mockAddresses[userId].length > 0 && !mockAddresses[userId].some(a => a.isDefault)) {
    mockAddresses[userId][0].isDefault = true;
  }
  
  return initialLength > mockAddresses[userId].length;
};