import { Order, OrderItem, Address, CartItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock Data (Centralized)
const mockShippingAddress: Address = {
  id: 'a1',
  fullName: 'John Doe',
  phone: '555-1234',
  street: '123 Custom St',
  city: 'Design City',
  state: 'DC',
  zipCode: '12345',
  country: 'USA',
  isDefault: true,
};

const mockOrderItems: OrderItem[] = [
  {
    id: 'oi1',
    productId: '1',
    quantity: 1,
    price: 24.99,
    customization: {
      texts: ['My Custom Text'],
      font: 'Arial',
      previewImage: '/placeholder.svg',
      svgFile: 'tshirt_design.svg',
    },
  },
  {
    id: 'oi2',
    productId: '2',
    variantId: 'v2',
    quantity: 2,
    price: 19.99,
    customization: {
      texts: ['Best Mug Ever'],
      font: 'Impact',
      previewImage: '/placeholder.svg',
      svgFile: 'mug_design.svg',
    },
  },
];

const initialMockOrders: Order[] = [
  {
    id: 'CP-2024-001234', customerId: '1', resellerId: 'u2', status: 'shipped', items: mockOrderItems, subtotal: 64.97, discountAmount: 0, taxAmount: 5.20, shippingCost: 9.99, totalAmount: 80.16, paymentMethod: 'Credit Card', paymentStatus: 'paid', shippingAddress: mockShippingAddress, deliveryMethod: 'Standard Shipping', designFiles: ['tshirt_design.svg', 'mug_design.svg'], createdAt: new Date(Date.now() - 86400000 * 5), updatedAt: new Date(),
  },
  {
    id: 'CP-2024-001235', customerId: '1', resellerId: 'u2', status: 'pending', items: mockOrderItems, subtotal: 150.00, discountAmount: 15.00, taxAmount: 10.80, shippingCost: 0, totalAmount: 145.80, paymentMethod: 'PayPal', paymentStatus: 'paid', shippingAddress: mockShippingAddress, deliveryMethod: 'Express Shipping', designFiles: ['tshirt_design.svg'], createdAt: new Date(Date.now() - 86400000 * 2), updatedAt: new Date(),
  },
  {
    id: 'CP-2024-001236', customerId: '1', status: 'delivered', items: mockOrderItems, subtotal: 30.00, discountAmount: 0, taxAmount: 2.40, shippingCost: 9.99, totalAmount: 42.39, paymentMethod: 'Credit Card', paymentStatus: 'paid', shippingAddress: mockShippingAddress, deliveryMethod: 'Standard Shipping', designFiles: [], createdAt: new Date(Date.now() - 86400000 * 10), updatedAt: new Date(),
  },
  {
    id: 'CP-2024-001237', customerId: '2', resellerId: 'u2', status: 'processing', items: mockOrderItems, subtotal: 99.99, discountAmount: 0, taxAmount: 8.00, shippingCost: 0, totalAmount: 107.99, paymentMethod: 'Credit Card', paymentStatus: 'paid', shippingAddress: mockShippingAddress, deliveryMethod: 'Standard Shipping', designFiles: [], createdAt: new Date(Date.now() - 86400000 * 1), updatedAt: new Date(),
  },
  {
    id: 'CP-2024-001238', customerId: '3', status: 'shipped', items: mockOrderItems, subtotal: 200.00, discountAmount: 20.00, taxAmount: 14.40, shippingCost: 0, totalAmount: 194.40, paymentMethod: 'Credit Card', paymentStatus: 'paid', shippingAddress: mockShippingAddress, deliveryMethod: 'Express Shipping', designFiles: [], createdAt: new Date(Date.now() - 86400000 * 3), updatedAt: new Date(),
  },
];

// Simple in-memory store for mock orders
let currentMockOrders: Order[] = initialMockOrders;

export const getMockOrders = (): Order[] => {
  return currentMockOrders;
};

export const getMockOrderById = (id: string): Order | undefined => {
  return currentMockOrders.find(order => order.id === id);
};

export const updateMockOrderStatus = (id: string, newStatus: Order['status']): Order | undefined => {
  const index = currentMockOrders.findIndex(order => order.id === id);
  if (index !== -1) {
    currentMockOrders[index] = {
      ...currentMockOrders[index],
      status: newStatus,
      updatedAt: new Date(),
    };
    return currentMockOrders[index];
  }
  return undefined;
};

export const cancelOrder = (id: string): Order | undefined => {
  return updateMockOrderStatus(id, 'cancelled');
};

interface OrderCreationData {
  customerId: string;
  resellerId?: string;
  cartItems: CartItem[];
  shippingAddress: Address;
  paymentMethod: string;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
}

export const createMockOrder = (data: OrderCreationData): Order => {
  const orderId = 'CP-' + new Date().getFullYear() + '-' + uuidv4().slice(0, 6).toUpperCase();
  const now = new Date();

  const orderItems: OrderItem[] = data.cartItems.map(cartItem => ({
    id: uuidv4(),
    productId: cartItem.productId,
    variantId: cartItem.variantId,
    quantity: cartItem.quantity,
    price: cartItem.product.discountedPrice || cartItem.product.basePrice,
    customization: cartItem.customization || { texts: [], font: '', previewImage: '', svgFile: '' },
  }));

  const newOrder: Order = {
    id: orderId,
    customerId: data.customerId,
    resellerId: data.resellerId,
    status: 'pending', // New orders start as pending
    items: orderItems,
    subtotal: data.subtotal,
    discountAmount: data.discountAmount,
    taxAmount: data.taxAmount,
    shippingCost: data.shippingCost,
    totalAmount: data.totalAmount,
    paymentMethod: data.paymentMethod,
    paymentStatus: 'paid', // Assuming payment is successful at checkout
    shippingAddress: data.shippingAddress,
    deliveryMethod: 'Standard Shipping', // Mocked
    designFiles: orderItems.map(item => item.customization.svgFile).filter(Boolean),
    createdAt: now,
    updatedAt: now,
  };

  currentMockOrders.push(newOrder);
  return newOrder;
};