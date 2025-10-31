import { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'u1', email: 'admin@example.com', name: 'Alice Admin', role: 'admin', isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: 'u2', email: 'reseller1@example.com', name: 'Bob Reseller', role: 'reseller', isActive: true, createdAt: new Date(), updatedAt: new Date(), commissionRate: 15, totalEarnings: 5000,
  },
  {
    id: 'u3', email: 'customer1@example.com', name: 'Charlie Customer', role: 'customer', isActive: true, createdAt: new Date(), updatedAt: new Date(), resellerId: 'u2', // Referred by Bob
  },
  {
    id: 'u4', email: 'inactive@example.com', name: 'Diana Dormant', role: 'customer', isActive: false, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: 'u5', email: 'customer2@example.com', name: 'Eve Customer', role: 'customer', isActive: true, createdAt: new Date(), updatedAt: new Date(), resellerId: 'u2', // Referred by Bob
  },
  {
    id: 'u6', email: 'customer3@example.com', name: 'Frank Customer', role: 'customer', isActive: true, createdAt: new Date(), updatedAt: new Date(),
  },
];

export const getAllMockUsers = (): User[] => mockUsers;

export const getCustomersByResellerId = (resellerId: string): User[] => {
  return mockUsers.filter(user => user.role === 'customer' && user.resellerId === resellerId);
};