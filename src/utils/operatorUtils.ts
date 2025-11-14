import { OperatorActivity, User } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { getMockUserById } from './userUtils';

// Mock store for operator activities
let currentOperatorActivities: OperatorActivity[] = [
  {
    id: uuidv4(),
    operatorId: 'u4', // Mock Counter User ID
    type: 'login',
    timestamp: new Date(Date.now() - 86400000 * 2),
    details: 'POS login successful.',
  },
  {
    id: uuidv4(),
    operatorId: 'u4',
    type: 'sale',
    timestamp: new Date(Date.now() - 86400000 * 1.5),
    details: 'Order CP-2024-001240 processed. Total: $55.00',
  },
  {
    id: uuidv4(),
    operatorId: 'u4',
    type: 'logout',
    timestamp: new Date(Date.now() - 86400000 * 1),
    details: 'POS logout.',
  },
];

export const logOperatorActivity = (
  operatorId: string, 
  type: OperatorActivity['type'], 
  details: string
): OperatorActivity => {
  const newActivity: OperatorActivity = {
    id: uuidv4(),
    operatorId,
    type,
    timestamp: new Date(),
    details,
  };
  currentOperatorActivities.unshift(newActivity); // Add to the beginning
  return newActivity;
};

export const getActivitiesByOperatorId = (operatorId: string): OperatorActivity[] => {
  return currentOperatorActivities
    .filter(a => a.operatorId === operatorId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const getAllOperatorActivities = (): OperatorActivity[] => {
  return currentOperatorActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Mock function to get all POS operators (users with role 'counter')
export const getPOSOperators = (allUsers: User[]): User[] => {
  // Since mockUsers is minimal, we rely on the caller passing the full user list
  return allUsers.filter(u => u.role === 'counter');
};

// Mock function to calculate operator sales summary
export const getOperatorSalesSummary = (operatorId: string): { totalSales: number, totalOrders: number } => {
  const salesActivities = currentOperatorActivities.filter(
    a => a.operatorId === operatorId && a.type === 'sale'
  );
  
  let totalSales = 0;
  let totalOrders = salesActivities.length;
  
  salesActivities.forEach(activity => {
    // Simple regex to extract amount from details string (e.g., "Total: $55.00")
    const match = activity.details.match(/Total: \$([\d.]+)/);
    if (match && match[1]) {
      totalSales += parseFloat(match[1]);
    }
  });
  
  return {
    totalSales: Math.round(totalSales * 100) / 100,
    totalOrders,
  };
};