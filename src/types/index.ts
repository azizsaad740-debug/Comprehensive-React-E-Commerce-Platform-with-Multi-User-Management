import { ReactNode } from 'react';

// =================================================================
// CORE TYPES
// =================================================================

export type UserRole = 'admin' | 'reseller' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  token: string;
}

export interface CustomFont {
  id: string;
  name: string;
  file: string; // URL or path to the font file
}

export interface CustomDesign {
  id: string;
  name: string;
  category: string;
  imageUrl: string; // URL or path to the design SVG/image
}

// =================================================================
// PRODUCT & INVENTORY TYPES
// =================================================================

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  attributes: Record<string, string>; // e.g., { color: 'Red', size: 'L' }
}

export interface CustomizationOptions {
  printPaths?: number; // NEW: Number of text paths available for engraving
  fonts: string[]; // List of font IDs available
  startDesigns?: string[]; // List of design IDs for the start of the engraving
  endDesigns?: string[]; // List of design IDs for the end of the engraving
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  basePrice: number;
  discountedPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  stockQuantity: number;
  variants: ProductVariant[];
  isActive: boolean;
  customizationOptions: CustomizationOptions;
}

export interface ProductCustomization {
  texts: string[]; // Text input for each print path
  font: string; // Selected font ID
  startDesign?: string; // Selected start design ID
  endDesign?: string; // Selected end design ID
  previewImage: string; // URL of the generated preview image
  svgFile: string; // Base64 or URL of the final SVG file
}

// =================================================================
// CART & ORDER TYPES
// =================================================================

export interface CartItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  customization?: ProductCustomization;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  shippingAddress: string;
  paymentMethod: string;
  resellerId?: string;
}

// =================================================================
// LAYOUT & UI TYPES
// =================================================================

export interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
  roles: UserRole[];
}