import { PromoCode } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const initialMockPromoCodes: PromoCode[] = [
  {
    id: 'p1',
    code: 'SUMMER20',
    name: 'Summer Sale 20%',
    discountType: 'percentage',
    discountValue: 20,
    minimumOrderValue: 50,
    usageLimit: 500,
    usedCount: 150,
    validFrom: new Date(Date.now() - 86400000 * 30),
    validTo: new Date(Date.now() + 86400000 * 30),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    autoAssignReseller: false,
  },
  {
    id: 'p2',
    code: 'FREESHIP',
    name: 'Free Shipping Promo',
    discountType: 'fixed',
    discountValue: 9.99,
    minimumOrderValue: 0,
    usageLimit: 100,
    usedCount: 95,
    validFrom: new Date(Date.now() - 86400000 * 60),
    validTo: new Date(Date.now() - 86400000 * 5),
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    autoAssignReseller: false,
  },
  {
    id: 'p3',
    code: 'RESELLER10',
    name: 'Reseller Exclusive 10%',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrderValue: 20,
    usageLimit: 1000,
    usedCount: 50,
    validFrom: new Date(Date.now() - 86400000 * 10),
    validTo: new Date(Date.now() + 86400000 * 90),
    resellerId: 'u2', // Linked to Bob Reseller
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    autoAssignReseller: true,
  },
];

let currentMockPromoCodes: PromoCode[] = initialMockPromoCodes;

export const getAllPromoCodes = (): PromoCode[] => {
  return currentMockPromoCodes;
};

export const getPromoCodesByResellerId = (resellerId: string): PromoCode[] => {
  return currentMockPromoCodes.filter(code => code.resellerId === resellerId);
};

export const createNewPromoCode = (newCodeData: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>): PromoCode => {
  const newCode: PromoCode = {
    ...newCodeData,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    usedCount: 0,
  };
  currentMockPromoCodes.push(newCode);
  return newCode;
};

export const updateMockPromoCode = (updatedCodeData: Partial<PromoCode>): PromoCode | undefined => {
  const index = currentMockPromoCodes.findIndex(code => code.id === updatedCodeData.id);
  if (index !== -1) {
    const existingCode = currentMockPromoCodes[index];
    const updatedCode: PromoCode = {
      ...existingCode,
      ...updatedCodeData,
      discountValue: Number(updatedCodeData.discountValue || existingCode.discountValue),
      minimumOrderValue: Number(updatedCodeData.minimumOrderValue || existingCode.minimumOrderValue),
      usageLimit: Number(updatedCodeData.usageLimit || existingCode.usageLimit),
      updatedAt: new Date(),
    } as PromoCode;
    
    currentMockPromoCodes[index] = updatedCode;
    return updatedCode;
  }
  return undefined;
};

export const deleteMockPromoCode = (codeId: string): boolean => {
  const initialLength = currentMockPromoCodes.length;
  currentMockPromoCodes = currentMockPromoCodes.filter(code => code.id !== codeId);
  return currentMockPromoCodes.length < initialLength;
};