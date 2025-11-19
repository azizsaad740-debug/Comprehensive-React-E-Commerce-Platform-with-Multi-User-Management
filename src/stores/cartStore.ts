"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, ProductCustomization, Product } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, variantId?: string, quantity?: number, customization?: ProductCustomization) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, variantId?: string, quantity = 1, customization?: ProductCustomization) => {
        const { items } = get();
        
        // Determine price per unit
        const price = product.discountedPrice || product.basePrice;

        // Normalize customization for comparison
        const normalizedCustomization = customization || {
          texts: [],
          font: '',
          previewImage: '',
          svgFile: ''
        };

        // Find if item already exists (same product, variant, and customization)
        const existingItemIndex = items.findIndex(
          item => 
            item.productId === product.id && 
            item.variantId === variantId &&
            JSON.stringify(item.customization) === JSON.stringify(normalizedCustomization)
        );

        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
          set({ items: updatedItems });
        } else {
          // Add new item
          const newItem: CartItem = {
            productId: product.id,
            productName: product.name, // Store name
            variantId,
            quantity,
            customization: normalizedCustomization,
            price: price, // Store price
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (productId: string, variantId?: string) => {
        const { items } = get();
        const updatedItems = items.filter(
          item => !(item.productId === productId && item.variantId === variantId)
        );
        set({ items: updatedItems });
      },

      updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => {
        const { items } = get();
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          get().removeItem(productId, variantId);
          return;
        }

        const updatedItems = items.map(item =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity }
            : item
        );
        set({ items: updatedItems });
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      setCartOpen: (open: boolean) => {
        set({ isOpen: open });
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          // Use stored price
          return total + (item.price * item.quantity);
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);