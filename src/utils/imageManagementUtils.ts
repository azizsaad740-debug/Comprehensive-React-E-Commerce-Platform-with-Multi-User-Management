import { HeroSlide, ImageAsset } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// --- Mock Hero Slides Data ---
const initialMockHeroSlides: HeroSlide[] = [
  {
    id: 'h1',
    heading: 'Create Custom Products',
    subheading: 'Design unique t-shirts, mugs, phone cases, and more with our easy-to-use customization tools',
    imageUrl: '/placeholder.svg',
    buttonText: 'Start Designing',
    buttonLink: '/products',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'h2',
    heading: 'Reseller Program Available',
    subheading: 'Earn commission by referring customers and sharing your exclusive promo codes.',
    imageUrl: '/placeholder.svg',
    buttonText: 'Join Now',
    buttonLink: '/auth/register?role=reseller', // Note: Public registration is now customer only, but this link remains for admin management context
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'h3',
    heading: 'Limited Time Sale!',
    subheading: 'Get 20% off all apparel this week only. Use code SUMMER20.',
    imageUrl: '/placeholder.svg',
    buttonText: 'Shop Apparel',
    buttonLink: '/products?category=apparel',
    isActive: false,
    sortOrder: 3,
  },
];

let currentMockHeroSlides: HeroSlide[] = initialMockHeroSlides;

export const getAllHeroSlides = (): HeroSlide[] => {
  return currentMockHeroSlides.sort((a, b) => a.sortOrder - b.sortOrder);
};

export const updateHeroSlide = (updatedSlide: HeroSlide): HeroSlide => {
  const index = currentMockHeroSlides.findIndex(s => s.id === updatedSlide.id);
  if (index !== -1) {
    currentMockHeroSlides[index] = updatedSlide;
    return currentMockHeroSlides[index];
  }
  return updatedSlide; // Should not happen in mock
};

export const createHeroSlide = (newSlide: Omit<HeroSlide, 'id'>): HeroSlide => {
  const slide: HeroSlide = {
    ...newSlide,
    id: uuidv4(),
  };
  currentMockHeroSlides.push(slide);
  return slide;
};

export const deleteHeroSlide = (id: string): boolean => {
  const initialLength = currentMockHeroSlides.length;
  currentMockHeroSlides = currentMockHeroSlides.filter(s => s.id !== id);
  return currentMockHeroSlides.length < initialLength;
};


// --- Mock Image Assets Data ---
const initialMockImageAssets: ImageAsset[] = [
  { id: 'img1', name: 'T-Shirt Mockup', url: '/placeholder.svg', type: 'product', uploadedAt: new Date() },
  { id: 'img2', name: 'Mug Hero Banner', url: '/placeholder.svg', type: 'hero', uploadedAt: new Date() },
];

let currentMockImageAssets: ImageAsset[] = initialMockImageAssets;

export const getAllImageAssets = (): ImageAsset[] => {
  return currentMockImageAssets.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
};

export const addImageAsset = (name: string, url: string, type: ImageAsset['type']): ImageAsset => {
  const newAsset: ImageAsset = {
    id: uuidv4(),
    name,
    url,
    type,
    uploadedAt: new Date(),
  };
  currentMockImageAssets.push(newAsset);
  return newAsset;
};

export const deleteImageAsset = (id: string): boolean => {
  const initialLength = currentMockImageAssets.length;
  currentMockImageAssets = currentMockImageAssets.filter(a => a.id !== id);
  return currentMockImageAssets.length < initialLength;
};