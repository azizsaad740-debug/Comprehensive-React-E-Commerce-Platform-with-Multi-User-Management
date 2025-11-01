import { CustomFont, CustomDesign } from '@/types';
import { v4 as uuidv4 } from 'uuid';

let currentMockFonts: CustomFont[] = [
  { id: 'font-1', name: 'Roboto', file: 'roboto.ttf' },
  { id: 'font-2', name: 'Poppins', file: 'poppins.ttf' },
  { id: 'font-3', name: 'Inter', file: 'inter.ttf' },
  { id: 'font-4', name: 'Monospace', file: 'monospace.ttf' },
];

let currentMockStartDesigns: CustomDesign[] = [
  { id: 'design-s1', name: 'Heart Shape', category: 'Shapes', imageUrl: '/mock/design-heart.svg' },
  { id: 'design-s2', name: 'Star Border', category: 'Borders', imageUrl: '/mock/design-star.svg' },
  { id: 'design-s3', name: 'Simple Line', category: 'Lines', imageUrl: '/mock/design-line.svg' },
];

let currentMockEndDesigns: CustomDesign[] = [
  { id: 'design-e1', name: 'Flower Icon', category: 'Icons', imageUrl: '/mock/design-flower.svg' },
  { id: 'design-e2', name: 'Arrow Head', category: 'Arrows', imageUrl: '/mock/design-arrow.svg' },
];

export const getAllMockFonts = () => currentMockFonts;
export const getAllMockStartDesigns = () => currentMockStartDesigns;
export const getAllMockEndDesigns = () => currentMockEndDesigns;

// CRUD for Fonts
export const addMockFont = (font: Omit<CustomFont, 'id'>): CustomFont => {
  const newFont = { id: uuidv4(), ...font };
  currentMockFonts.push(newFont);
  return newFont;
};

export const updateMockFont = (updatedFont: CustomFont): CustomFont | undefined => {
  const index = currentMockFonts.findIndex(f => f.id === updatedFont.id);
  if (index !== -1) {
    currentMockFonts[index] = updatedFont;
    return updatedFont;
  }
  return undefined;
};

export const deleteMockFont = (id: string): boolean => {
  const initialLength = currentMockFonts.length;
  currentMockFonts = currentMockFonts.filter(f => f.id !== id);
  return currentMockFonts.length < initialLength;
};

// CRUD for Designs (Generic function for start/end)
type DesignType = 'start' | 'end';

const getDesignArray = (type: DesignType) => {
  return type === 'start' ? currentMockStartDesigns : currentMockEndDesigns;
};

const setDesignArray = (type: DesignType, newArray: CustomDesign[]) => {
  if (type === 'start') {
    currentMockStartDesigns = newArray;
  } else {
    currentMockEndDesigns = newArray;
  }
};

export const addMockDesign = (type: DesignType, design: Omit<CustomDesign, 'id'>): CustomDesign => {
  const newDesign = { id: uuidv4(), ...design };
  getDesignArray(type).push(newDesign);
  return newDesign;
};

export const updateMockDesign = (type: DesignType, updatedDesign: CustomDesign): CustomDesign | undefined => {
  const array = getDesignArray(type);
  const index = array.findIndex(d => d.id === updatedDesign.id);
  if (index !== -1) {
    array[index] = updatedDesign;
    setDesignArray(type, array);
    return updatedDesign;
  }
  return undefined;
};

export const deleteMockDesign = (type: DesignType, id: string): boolean => {
  const array = getDesignArray(type);
  const initialLength = array.length;
  const newArray = array.filter(d => d.id !== id);
  setDesignArray(type, newArray);
  return newArray.length < initialLength;
};