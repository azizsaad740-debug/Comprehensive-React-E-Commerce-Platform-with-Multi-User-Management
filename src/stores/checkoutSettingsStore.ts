import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DeliveryMethod {
  id: string;
  name: string;
  cost: number;
  estimatedDays: string;
  isActive: boolean;
}

export interface CheckoutSettingsState {
  currency: string;
  currencySymbol: string;
  deliveryMethods: DeliveryMethod[];
  isCashOnDeliveryEnabled: boolean;
  thankYouNoteInstruction: string;
  
  updateSettings: (data: Partial<CheckoutSettingsState>) => void;
  updateDeliveryMethod: (method: DeliveryMethod) => void;
  addDeliveryMethod: (method: Omit<DeliveryMethod, 'id'>) => void;
  deleteDeliveryMethod: (id: string) => void;
}

const initialDeliveryMethods: DeliveryMethod[] = [
  { id: 'std', name: 'Standard Shipping', cost: 9.99, estimatedDays: '5-7 business days', isActive: true },
  { id: 'exp', name: 'Express Shipping', cost: 25.00, estimatedDays: '1-2 business days', isActive: true },
  { id: 'pickup', name: 'Local Pickup', cost: 0, estimatedDays: 'Same day', isActive: false },
];

export const useCheckoutSettingsStore = create<CheckoutSettingsState>()(
  persist(
    (set, get) => ({
      currency: 'PKR',
      currencySymbol: 'Rs',
      deliveryMethods: initialDeliveryMethods,
      isCashOnDeliveryEnabled: false,
      thankYouNoteInstruction: 'Your order is confirmed! Please check your email for tracking details. Contact support if you have any questions.',

      updateSettings: (data) => {
        set((state) => ({ ...state, ...data }));
      },
      
      updateDeliveryMethod: (updatedMethod) => {
        set((state) => ({
          deliveryMethods: state.deliveryMethods.map(method => 
            method.id === updatedMethod.id ? updatedMethod : method
          ),
        }));
      },
      
      addDeliveryMethod: (newMethodData) => {
        const newMethod: DeliveryMethod = {
          ...newMethodData,
          id: Math.random().toString(36).substring(2, 9), // Simple mock ID
        };
        set((state) => ({
          deliveryMethods: [...state.deliveryMethods, newMethod],
        }));
      },
      
      deleteDeliveryMethod: (id) => {
        set((state) => ({
          deliveryMethods: state.deliveryMethods.filter(method => method.id !== id),
        }));
      },
    }),
    {
      name: 'checkout-settings-storage',
    }
  )
);