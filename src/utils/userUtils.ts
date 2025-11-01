import { User, Address } from '@/types';
import { getMockOrders } from './orderUtils'; // Import order utility
import { v4 as uuidv4 } from 'uuid';

export const mockUsers: User[] = [
  {
    id: '64813257-184d-4fbf-ac0a-ebff11be0200', email: 'admin@example.com', name: 'Alice Admin', role: 'admin', isActive: true, createdAt: new Date(), updatedAt: new Date(), email_verified: true,
  },
  {
    id: 'u2', email: 'reseller1@example.com', name: 'Bob Reseller', role: 'reseller', isActive: true, createdAt: new Date(), updatedAt: new Date(), commissionRate: 15, totalEarnings: 5000, email_verified: true,
  },
  {
    id: 'u3', email: 'customer1@example.com', name: 'Charlie Admin', role: 'admin', isActive: true, createdAt: new Date(), updatedAt: new Date(), email_verified: true, // Promoted to Admin
  },
  {
    id: 'u4', email: 'inactive@example.com', name: 'Diana Dormant', role: 'customer', isActive: false, createdAt: new Date(), updatedAt: new Date(), email_verified: true,
  },
  {
    id: 'u5', email: 'customer2@example.com', name: 'Eve Customer', role: 'customer', isActive: true, createdAt: new Date(), updatedAt: new Date(), resellerId: 'u2', totalSales: 890.00, email_verified: true, // Referred by Bob
  },
  {
    id: 'u6', email: 'customer3@example.com', name: 'Frank Customer', role: 'customer', isActive: true, createdAt: new Date(), updatedAt: new Date(), email_verified: true,
  },
];

// Mock Address Store (in-memory)
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

export const getAllMockUsers = (): User[] => mockUsers;

export const getCustomersByResellerId = (resellerId: string): User[] => {
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