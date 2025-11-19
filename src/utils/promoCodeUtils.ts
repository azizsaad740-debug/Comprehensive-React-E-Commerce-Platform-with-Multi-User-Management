import { PromoCode, CartItem } from '@/types';
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
    targetCategory: 'Apparel', // NEW: Applies only to Apparel
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
    targetCategory: 'all', // NEW: Applies to all categories
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
    targetCategory: 'all', // NEW: Applies to all categories
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
    targetCategory: newCodeData.targetCategory || 'all',
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
      targetCategory: updatedCodeData.targetCategory || existingCode.targetCategory || 'all',
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

// Define a type that includes the necessary product fields for promo calculation
interface PromoCartItem extends CartItem {
  category: string;
}

/**
 * Validates a promo code against a cart and calculates the discount.
 * @param codeString The promo code string.
 * @param cartItems The items in the cart (must include product details).
 * @param subtotal The total price of items before tax/shipping.
 * @returns {PromoCode | null, number} The applied code and the discount amount, or null/0.
 */
export const applyPromoCode = (
  codeString: string, 
  cartItems: PromoCartItem[], // UPDATED: Expects items with category
  subtotal: number
): { appliedCode: PromoCode | null, discountAmount: number, error?: string } => {
  const code = currentMockPromoCodes.find(c => c.code.toUpperCase() === codeString.toUpperCase());

  if (!code) {
    return { appliedCode: null, discountAmount: 0, error: "Invalid promo code." };
  }
  if (!code.isActive || code.validTo < new Date() || code.usedCount >= code.usageLimit) {
    return { appliedCode: null, discountAmount: 0, error: "Promo code is inactive or expired." };
  }
  if (subtotal < code.minimumOrderValue) {
    return { appliedCode: null, discountAmount: 0, error: `Minimum order value of ${code.minimumOrderValue.toFixed(2)} not met.` };
  }

  let applicableSubtotal = 0;
  
  if (code.targetCategory && code.targetCategory !== 'all') {
    // Calculate subtotal only for items matching the target category
    applicableSubtotal = cartItems.reduce((sum, item) => {
      if (item.category.toLowerCase() === code.targetCategory?.toLowerCase()) { // FIXED: Use item.category
        const price = item.price; // FIXED: Use item.price
        return sum + (price * item.quantity);
      }
      return sum;
    }, 0);
    
    if (applicableSubtotal === 0) {
        return { appliedCode: null, discountAmount: 0, error: `Code only applies to ${code.targetCategory} products.` };
    }
  } else {
    // Apply to the entire subtotal
    applicableSubtotal = subtotal;
  }

  let discountAmount = 0;

  if (code.discountType === 'percentage') {
    discountAmount = applicableSubtotal * (code.discountValue / 100);
  } else if (code.discountType === 'fixed') {
    discountAmount = code.discountValue;
  }
  
  // Ensure discount doesn't exceed the applicable subtotal
  discountAmount = Math.min(discountAmount, applicableSubtotal);

  return { 
    appliedCode: code, 
    discountAmount: Math.round(discountAmount * 100) / 100 
  };
};

/**
 * Increments the usage count for a promo code.
 * @param codeId The ID of the promo code.
 */
export const incrementPromoCodeUsage = (codeId: string): void => {
    const index = currentMockPromoCodes.findIndex(code => code.id === codeId);
    if (index !== -1) {
        currentMockPromoCodes[index].usedCount += 1;
        currentMockPromoCodes[index].updatedAt = new Date();
    }
};