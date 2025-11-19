import { useState, useEffect, useMemo } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { getMockProductById } from '@/utils/productUtils';
import { Product, CartItem } from '@/types';

interface CartItemWithProduct extends CartItem {
  productDetails: Product | null;
}

export const useCartProducts = () => {
  const { items } = useCartStore();
  const [productsMap, setProductsMap] = useState<Map<string, Product>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      const uniqueProductIds = Array.from(new Set(items.map(item => item.productId)));
      const newProductsMap = new Map(productsMap);
      let needsUpdate = false;

      for (const id of uniqueProductIds) {
        // Only fetch if we don't already have the product details
        if (!newProductsMap.has(id)) {
          const product = await getMockProductById(id);
          if (product) {
            newProductsMap.set(id, product);
            needsUpdate = true;
          }
        }
      }
      
      if (needsUpdate) {
        setProductsMap(newProductsMap);
      }
      setIsLoading(false);
    };

    fetchDetails();
  }, [items]);

  const cartItemsWithDetails: CartItemWithProduct[] = useMemo(() => {
    return items.map(item => ({
      ...item,
      productDetails: productsMap.get(item.productId) || null,
    }));
  }, [items, productsMap]);

  return { cartItemsWithDetails, isLoading };
};