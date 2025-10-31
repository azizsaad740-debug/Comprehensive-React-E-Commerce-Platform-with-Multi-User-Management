export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  role: 'admin' | 'reseller' | 'customer';
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Reseller specific fields
  commissionRate?: number;
  totalEarnings?: number;
  // Customer specific fields
  resellerId?: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  whatsapp?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
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
  subcategory?: string;
  stockQuantity: number;
  variants: ProductVariant[];
  customizationOptions: CustomizationOptions;
  printPaths: number; // 1, 2, 3+ print paths
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  attributes: {
    color?: string;
    size?: string;
    material?: string;
    model?: string;
  };
}

export interface CustomizationOptions {
  fonts: string[];
  startDesigns: string[];
  endDesigns: string[];
  maxCharacters?: number;
  allowedColors?: string[];
}

export interface Design {
  id: string;
  name: string;
  type: 'start' | 'end' | 'font';
  category: string;
  fileUrl: string;
  thumbnailUrl: string;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
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
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: Address;
  deliveryMethod: string;
  promoCode?: string;
  notes?: string;
  designFiles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  customization: ProductCustomization;
}

export interface ProductCustomization {
  texts: string[];
  font: string;
  startDesign?: string;
  endDesign?: string;
  previewImage: string;
  svgFile: string;
}

export interface PromoCode {
  id: string;
  code: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderValue?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validTo: Date;
  resellerId?: string;
  applicableProducts?: string[];
  applicableCategories?: string[];
  isActive: boolean;
  autoAssignReseller?: boolean;
  createdAt: Date;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  variantId?: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  notes?: string;
  createdAt: Date;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: Date;
  receipt?: string;
  createdAt: Date;
}

export interface FinancialReport {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  orderCount: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  revenueByPaymentMethod: Record<string, number>;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  customization: ProductCustomization;
  product: Product;
}

export interface Notification {
  id: string;
  type: 'order' | 'payment' | 'inventory' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrders: number;
  activeResellers: number;
  todayRevenue: number;
  monthRevenue: number;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  revenueData: Array<{
    date: string;
    revenue: number;
  }>;
  orderStatusData: Array<{
    status: string;
    count: number;
  }>;
}

export interface AIInsight {
  id: string;
  type: 'inventory' | 'sales' | 'pricing' | 'marketing' | 'financial';
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  createdAt: Date;
}