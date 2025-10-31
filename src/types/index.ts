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
  token?: string; // Token is optional as it might be null after logout
  
  // Added properties to fix TS errors
  phone?: string;
  whatsapp?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  commissionRate?: number;
  totalEarnings?: number;
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
  price: number;
  stockQuantity: number;
  attributes: Record<string, string>; // e.g., { color: 'Red', size: 'L' }
}

export interface CustomizationOptions {
  printPaths?: number; // Number of text paths available for engraving
  fonts: string[]; // List of font IDs available
  startDesigns?: string[]; // List of design IDs for the start of the engraving
  endDesigns?: string[]; // List of design IDs for the end of the engraving
  
  // Added properties to fix TS errors
  maxCharacters?: number;
  allowedColors?: string[];
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
  subcategory: string; // NEW: Added subcategory
  tags: string[];
  stockQuantity: number;
  variants: ProductVariant[];
  isActive: boolean;
  customizationOptions: CustomizationOptions;
  printPaths: number; // Added printPaths to Product interface based on usage in productUtils
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
  variantId?: string;
  quantity: number;
  customization?: ProductCustomization;
  product: Product; // Include full product details
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number; // Price at time of order
  customization: ProductCustomization;
}

export interface Order {
  id: string;
  customerId: string;
  resellerId?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  shippingAddress: Address;
  deliveryMethod: string;
  designFiles: string[];
  createdAt: Date;
  updatedAt: Date;
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

export interface PromoCode {
  id: string;
  code: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderValue: number;
  usageLimit: number;
  usedCount: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  createdAt: Date;
  resellerId?: string;
  autoAssignReseller: boolean;
}