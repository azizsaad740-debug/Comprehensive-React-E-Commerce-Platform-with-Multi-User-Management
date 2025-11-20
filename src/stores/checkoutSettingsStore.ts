import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchSettings, updateSettings } from '@/integrations/supabase/settings';

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
  
  updateSettings: (data: Partial<CheckoutSettingsState>) => Promise<void>;
  updateDeliveryMethod: (method: DeliveryMethod) => Promise<void>;
  addDeliveryMethod: (method: Omit<DeliveryMethod, 'id'>) => Promise<void>;
  deleteDeliveryMethod: (id: string) => Promise<void>;
  initialize: () => Promise<void>; // ADDED
}

const SETTINGS_KEY = 'checkout_settings';

const initialDeliveryMethods: DeliveryMethod[] = [
  { id: 'std', name: 'Standard Shipping', cost: 9.99, estimatedDays: '5-7 business days', isActive: true },
  { id: 'exp', name: 'Express Shipping', cost: 25.00, estimatedDays: '1-2 business days', isActive: true },
  { id: 'pickup', name: 'Local Pickup', cost: 0, estimatedDays: 'Same day', isActive: false },
];

const DEFAULT_STATE: Omit<CheckoutSettingsState, 'updateSettings' | 'updateDeliveryMethod' | 'addDeliveryMethod' | 'deleteDeliveryMethod' | 'initialize'> = {
  currency: 'PKR',
  currencySymbol: 'Rs',
  deliveryMethods: initialDeliveryMethods,
  isCashOnDeliveryEnabled: false,
  thankYouNoteInstruction: 'Your order is confirmed! Please check your email for tracking details. Contact support if you have any questions.',
};

export const useCheckoutSettingsStore = create<CheckoutSettingsState>()(
  (set, get) => ({
    ...DEFAULT_STATE,
    
    initialize: async () => {
      const data = await fetchSettings<typeof DEFAULT_STATE>(SETTINGS_KEY);
      if (data) {
        set(data);
      } else {
        set(DEFAULT_STATE);
      }
    },

    updateSettings: async (data) => {
      const newState = { ...get(), ...data };
      set(newState);
      await updateSettings(SETTINGS_KEY, newState);
    },
    
    updateDeliveryMethod: async (updatedMethod) => {
      const currentMethods = get().deliveryMethods;
      const updatedMethods = currentMethods.map(method => 
        method.id === updatedMethod.id ? updatedMethod : method
      );
      const newState = { ...get(), deliveryMethods: updatedMethods };
      set(newState);
      await updateSettings(SETTINGS_KEY, newState);
    },
    
    addDeliveryMethod: async (newMethodData) => {
      const newMethod: DeliveryMethod = {
        ...newMethodData,
        id: Math.random().toString(36).substring(2, 9), // Simple mock ID
      };
      const newState = { ...get(), deliveryMethods: [...get().deliveryMethods, newMethod] };
      set(newState);
      await updateSettings(SETTINGS_KEY, newState);
    },
    
    deleteDeliveryMethod: async (id) => {
      const newState = { ...get(), deliveryMethods: get().deliveryMethods.filter(method => method.id !== id) };
      set(newState);
      await updateSettings(SETTINGS_KEY, newState);
    },
  })
);