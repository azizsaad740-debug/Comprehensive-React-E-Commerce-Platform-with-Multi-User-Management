import { Product, ProductVariant } from '@/types';

// Mock product data (Centralized)
const mockProductVariants: ProductVariant[] = [
  {
    id: 'v1',
    name: 'Small',
    price: 29.99,
    stockQuantity: 20,
    attributes: { size: 'S', color: 'White' }
  },
  {
    id: 'v2',
    name: 'Medium',
    price: 29.99,
    stockQuantity: 30,
    attributes: { size: 'M', color: 'White' }
  },
  {
    id: 'v3',
    name: 'Large',
    price: 29.99,
    stockQuantity: 25,
    attributes: { size: 'L', color: 'White' }
  }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Custom T-Shirt',
    sku: 'TS001',
    description: 'High-quality cotton t-shirt perfect for custom printing. Choose from various fonts, colors, and designs to create your unique style.',
    basePrice: 29.99,
    discountedPrice: 24.99,
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    category: 'Apparel',
    subcategory: 'T-Shirts',
    stockQuantity: 50,
    variants: mockProductVariants,
    customizationOptions: {
      fonts: ['Arial', 'Times New Roman', 'Helvetica', 'Comic Sans', 'Impact'],
      startDesigns: ['Simple', 'Floral', 'Abstract', 'Geometric', 'Vintage'],
      endDesigns: ['Logo', 'Text', 'Pattern', 'Border', 'Frame'],
      maxCharacters: 50,
      allowedColors: ['Red', 'Blue', 'Green', 'Black', 'White', 'Gold', 'Silver']
    },
    printPaths: 1,
    isActive: true,
    tags: ['popular', 'bestseller'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Personalized Mug',
    sku: 'MG001',
    description: 'Ceramic mug with custom printing. Perfect for gifts or daily use.',
    basePrice: 19.99,
    discountedPrice: undefined,
    images: ['/placeholder.svg'],
    category: 'Drinkware',
    subcategory: 'Mugs',
    stockQuantity: 100,
    variants: [
      {
        id: 'v4',
        name: 'Standard 11oz',
        price: 19.99,
        stockQuantity: 100,
        attributes: { material: 'Ceramic' }
      }
    ],
    customizationOptions: {
      fonts: ['Arial', 'Comic Sans'],
      startDesigns: ['Minimalist', 'Vintage'],
      endDesigns: ['Simple', 'Clean'],
      maxCharacters: 25
    },
    printPaths: 1,
    isActive: true,
    tags: ['new'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Custom Phone Case',
    sku: 'PC003',
    description: 'Durable phone case with full customization.',
    basePrice: 35.00,
    discountedPrice: 30.00,
    images: ['/placeholder.svg'],
    category: 'Accessories',
    subcategory: 'Phone Cases',
    stockQuantity: 5,
    variants: [
      {
        id: 'v5',
        name: 'iPhone 15',
        price: 35.00,
        stockQuantity: 3,
        attributes: { model: 'iPhone 15' }
      },
      {
        id: 'v6',
        name: 'Samsung S24',
        price: 35.00,
        stockQuantity: 2,
        attributes: { model: 'Samsung S24' }
      }
    ],
    customizationOptions: {
      fonts: ['Roboto'],
      startDesigns: ['Abstract'],
      endDesigns: ['Pattern'],
      maxCharacters: 10
    },
    printPaths: 2,
    isActive: true,
    tags: ['low-stock'],
    createdAt: new Date(Date.now() - 86400000 * 60),
    updatedAt: new Date(),
  },
];

export const getMockProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const getAllMockProducts = (): Product[] => {
  return mockProducts;
};

export const updateMockProductImages = (productId: string, newImages: string[]): Product | undefined => {
  const productIndex = mockProducts.findIndex(product => product.id === productId);
  if (productIndex !== -1) {
    mockProducts[productIndex].images = newImages;
    mockProducts[productIndex].updatedAt = new Date();
    return mockProducts[productIndex];
  }
  return undefined;
};