import { User, Address, UserRole } from '@/types';
import { getMockOrders } from './orderUtils'; // Import order utility
import { v4 as uuidv4 } from 'uuid';

// Mock password storage is removed as we rely on Supabase Auth.
export const mockPasswords: Record<string, string> = {
  'u1': 'password', // Mock Admin User
  'u2': 'password', // Mock Reseller User
  'u3': 'password', // Mock Customer User
  'u4': 'password', // Mock Counter User
  'u5': 'password', // Mock Customer User
};

// Mock user list is drastically reduced, keeping only a placeholder for the superuser ID
// NOTE: In a real application, this list would be replaced by database queries.
export const mockUsers: User[] = [
  {
    // This ID is a placeholder for the superuser profile created via SQL migration
    id: '00000000-0000-0000-0000-000000000000', 
    email: 'superuser@example.com', 
    name: 'System Superuser', 
    role: 'superuser', 
    isActive: true, 
    createdAt: new Date(), 
    updatedAt: new Date(),
  },
  // Mock Admin User for testing
  {
    id: 'u1',
    email: 'admin@example.com',
    name: 'Alice Admin',
    role: 'admin',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 50),
    updatedAt: new Date(),
    commissionRate: undefined,
    resellerId: undefined,
  },
  // Mock Reseller User
  {
    id: 'u2',
    email: 'reseller@example.com',
    name: 'Bob Reseller',
    role: 'reseller',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 40),
    updatedAt: new Date(),
    commissionRate: 15,
    resellerId: undefined,
  },
  // Mock Customer User 1 (Referred by u2)
  {
    id: 'u3',
    email: 'charlie@example.com',
    name: 'Charlie Customer',
    role: 'customer',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(),
    resellerId: 'u2',
  },
  // Mock Customer User 2
  {
    id: 'u5',
    email: 'eve@example.com',
    name: 'Eve Customer',
    role: 'customer',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(),
  },
  // Mock Counter User (for POS)
  {
    id: 'u4',
    email: 'pos.counter@example.com',
    name: 'POS Operator 1',
    role: 'counter',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(),
  },
];

// Mock Address Store (in-memory) - Keeping this for non-auth related profile features
const mockAddresses: Record<string, Address[]> = {
  // Keeping mock addresses for existing users (u3, u5) for now, but they won't be accessible 
  // unless the user logs in with those IDs via Supabase.
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

// Mock registration is removed as we rely on Supabase Auth.
export const registerMockUser = (
  email: string, 
  password: string, 
  name: string, 
  role: UserRole = 'customer', 
  resellerId?: string
): User => {
  throw new Error("Mock registration is disabled. Use Supabase Auth.");
};

export const getAllMockUsers = (): User[] => {
  // Filter out the Super User from standard lists
  return mockUsers.filter(user => user.role !== 'superuser');
};

export const getMockUserById = (userId: string): User | undefined => {
  return mockUsers.find(user => user.id === userId);
};

// NOTE: These update/delete functions are now only used by Admin pages 
// and should ideally be replaced by Supabase Admin API calls or RLS-protected profile updates.
// We keep them for mock data consistency but they are functionally limited.
export const updateMockUser = (updatedUserData: Partial<User>): User | undefined => {
  const userIndex = mockUsers.findIndex(user => user.id === updatedUserData.id);
  if (userIndex !== -1) {
    const existingUser = mockUsers[userIndex];
    
    // Prevent updating the Super User's role or status via standard means
    if (existingUser.role === 'superuser' && updatedUserData.role !== 'superuser') {
      throw new Error("Cannot modify Superuser role via standard update.");
    }
    
    const updatedUser: User = {
      ...existingUser,
      ...updatedUserData,
      updatedAt: new Date(),
      // Ensure role-specific fields are handled correctly
      commissionRate: updatedUserData.role === 'reseller' ? Number(updatedUserData.commissionRate) : undefined,
      resellerId: updatedUserData.role === 'customer' ? updatedUserData.resellerId : undefined,
    } as User;
    
    mockUsers[userIndex] = updatedUser;
    return updatedUser;
  }
  return undefined;
};

export const deleteMockUser = (userId: string): boolean => {
  const userToDelete = mockUsers.find(user => user.id === userId);
  if (userToDelete?.role === 'superuser') {
    throw new Error("Cannot delete Superuser.");
  }
  
  const initialLength = mockUsers.length;
  const index = mockUsers.findIndex(user => user.id === userId);
  
  if (index !== -1) {
    mockUsers.splice(index, 1);
  }
  
  return mockUsers.length < initialLength;
};

export const getCustomersByResellerId = (resellerId: string): User[] => {
  // Since mockUsers is empty now, this will return an empty array unless 
  // the user manually adds mock users back or logs in via Supabase.
  const referredCustomers = mockUsers.filter(user => user.role === 'customer' && user.resellerId === resellerId);
  const allOrders = getMockOrders();

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
  
  // Re-sort to ensure default is first, if needed, but simple push/update is fine for mock
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