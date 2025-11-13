import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ContactInfo, FaqItem, StaticPage } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ContentState {
  contactInfo: ContactInfo;
  faqItems: FaqItem[];
  staticPages: StaticPage[];
  
  updateContactInfo: (data: Partial<ContactInfo>) => void;
  updateFaqItem: (item: FaqItem) => void;
  addFaqItem: (item: Omit<FaqItem, 'id'>) => void;
  deleteFaqItem: (id: string) => void;
  
  updateStaticPage: (page: StaticPage) => void;
  getStaticPage: (slug: string) => StaticPage | undefined;
}

const initialContactInfo: ContactInfo = {
  address: '123 Custom St, Design City, DC 12345',
  phone: '+1 (555) 123-4567',
  email: 'hello@misalicenter.com',
};

const initialFaqItems: FaqItem[] = [
  { id: 'f1', question: 'How long does customization take?', answer: 'Customization typically takes 2-3 business days before shipping.', sortOrder: 1 },
  { id: 'f2', question: 'What is your return policy?', answer: 'Customized items are non-refundable unless defective. Standard items can be returned within 30 days.', sortOrder: 2 },
];

const initialStaticPages: StaticPage[] = [
  { slug: 'about', title: 'About Us', content: 'We are Misali Center, dedicated to providing high-quality custom products.', isActive: true },
  { slug: 'contact', title: 'Contact Page', content: 'Reach out to us via phone or email for support.', isActive: true },
  { slug: 'shipping', title: 'Shipping Info', content: 'Details about shipping rates and delivery times.', isActive: true },
  { slug: 'returns', title: 'Returns & Exchanges', content: 'Our policy on returns and exchanges.', isActive: true },
  { slug: 'size-guide', title: 'Size Guide', content: 'Find the perfect fit with our detailed size guide.', isActive: true },
  { slug: 'care-instructions', title: 'Care Instructions', content: 'How to care for your custom products.', isActive: true },
  { slug: 'track-order', title: 'Track Your Order', content: 'Use your tracking number here.', isActive: true },
];

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      contactInfo: initialContactInfo,
      faqItems: initialFaqItems,
      staticPages: initialStaticPages,

      updateContactInfo: (data) => {
        set((state) => ({ contactInfo: { ...state.contactInfo, ...data } }));
      },
      
      updateFaqItem: (updatedItem) => {
        set((state) => ({
          faqItems: state.faqItems.map(item => 
            item.id === updatedItem.id ? updatedItem : item
          ).sort((a, b) => a.sortOrder - b.sortOrder),
        }));
      },
      
      addFaqItem: (newItemData) => {
        const newItem: FaqItem = {
          ...newItemData,
          id: uuidv4(),
        };
        set((state) => ({
          faqItems: [...state.faqItems, newItem].sort((a, b) => a.sortOrder - b.sortOrder),
        }));
      },
      
      deleteFaqItem: (id) => {
        set((state) => ({
          faqItems: state.faqItems.filter(item => item.id !== id),
        }));
      },
      
      updateStaticPage: (updatedPage) => {
        set((state) => ({
          staticPages: state.staticPages.map(page => 
            page.slug === updatedPage.slug ? updatedPage : page
          ),
        }));
      },
      
      getStaticPage: (slug) => {
        return get().staticPages.find(page => page.slug === slug);
      }
    }),
    {
      name: 'content-storage',
    }
  )
);