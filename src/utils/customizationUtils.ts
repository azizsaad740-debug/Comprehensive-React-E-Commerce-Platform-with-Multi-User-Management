import { CustomFont, CustomDesign } from '@/types';

export const mockFonts: CustomFont[] = [
  { id: 'font-1', name: 'Roboto', file: 'roboto.ttf' },
  { id: 'font-2', name: 'Poppins', file: 'poppins.ttf' },
  { id: 'font-3', name: 'Inter', file: 'inter.ttf' },
  { id: 'font-4', name: 'Monospace', file: 'monospace.ttf' },
];

export const mockStartDesigns: CustomDesign[] = [
  { id: 'design-s1', name: 'Heart Shape', category: 'Shapes', imageUrl: '/mock/design-heart.svg' },
  { id: 'design-s2', name: 'Star Border', category: 'Borders', imageUrl: '/mock/design-star.svg' },
  { id: 'design-s3', name: 'Simple Line', category: 'Lines', imageUrl: '/mock/design-line.svg' },
];

export const mockEndDesigns: CustomDesign[] = [
  { id: 'design-e1', name: 'Flower Icon', category: 'Icons', imageUrl: '/mock/design-flower.svg' },
  { id: 'design-e2', name: 'Arrow Head', category: 'Arrows', imageUrl: '/mock/design-arrow.svg' },
];

export const getAllMockFonts = () => mockFonts;
export const getAllMockStartDesigns = () => mockStartDesigns;
export const getAllMockEndDesigns = () => mockEndDesigns;