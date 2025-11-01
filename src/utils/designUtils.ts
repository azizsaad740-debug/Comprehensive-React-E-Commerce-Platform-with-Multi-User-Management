import { SavedDesignTemplate, ProductCustomization } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const initialMockDesigns: SavedDesignTemplate[] = [
  {
    id: 'd1',
    userId: 'u3', // Charlie Customer
    name: 'Birthday T-Shirt Design',
    productId: '1',
    productName: 'Custom T-Shirt',
    customization: {
      texts: ['Happy 30th!', 'Party Time'],
      font: 'Impact',
      startDesign: 'design-s1',
      endDesign: 'design-e1',
      previewImage: '/placeholder.svg',
      svgFile: 'design_d1.svg',
    },
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: 'd2',
    userId: 'u3', // Charlie Customer
    name: 'Work Mug Logo',
    productId: '2',
    productName: 'Personalized Mug',
    customization: {
      texts: ['Best Boss'],
      font: 'Arial',
      previewImage: '/placeholder.svg',
      svgFile: 'design_d2.svg',
    },
    createdAt: new Date(Date.now() - 86400000 * 20),
    updatedAt: new Date(Date.now() - 86400000 * 20),
  },
  {
    id: 'd3',
    userId: 'u5', // Eve Customer
    name: 'S24 Abstract Case',
    productId: '3',
    productName: 'Custom Phone Case',
    customization: {
      texts: ['EVE'],
      font: 'Roboto',
      previewImage: '/placeholder.svg',
      svgFile: 'design_d3.svg',
    },
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 86400000 * 3),
  },
];

let currentMockDesigns: SavedDesignTemplate[] = initialMockDesigns;

export const getDesignsByUserId = (userId: string): SavedDesignTemplate[] => {
  return currentMockDesigns.filter(design => design.userId === userId);
};

export const getDesignById = (designId: string): SavedDesignTemplate | undefined => {
  return currentMockDesigns.find(design => design.id === designId);
};

export const deleteDesign = (designId: string): boolean => {
  const initialLength = currentMockDesigns.length;
  currentMockDesigns = currentMockDesigns.filter(design => design.id !== designId);
  return initialLength > currentMockDesigns.length;
};

export const saveDesign = (
  userId: string, 
  name: string, 
  productId: string, 
  productName: string, 
  customization: ProductCustomization,
  designId?: string
): SavedDesignTemplate => {
  const now = new Date();
  
  if (designId) {
    const index = currentMockDesigns.findIndex(d => d.id === designId && d.userId === userId);
    if (index !== -1) {
      currentMockDesigns[index] = {
        ...currentMockDesigns[index],
        name,
        customization,
        updatedAt: now,
      };
      return currentMockDesigns[index];
    }
  }

  const newDesign: SavedDesignTemplate = {
    id: uuidv4(),
    userId,
    name,
    productId,
    productName,
    customization,
    createdAt: now,
    updatedAt: now,
  };
  
  currentMockDesigns.push(newDesign);
  return newDesign;
};