import { Product, ProductVariant, ImageSizes } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Helper to generate mock ImageSizes from a base URL
const generateMockImageSizes = (baseUrl: string): ImageSizes => ({
  small: `${baseUrl}?size=small`,
  medium: `${baseUrl}?size=medium`,
  large: `${baseUrl}?size=large`,
});

// --- Supabase Type Definitions ---

// Define the structure of data returned from Supabase (snake_case)
interface SupabaseProduct {
  id: string;
  name: string;
  sku: string;
  description: string;
  base_price: number;
  discounted_price: number | null;
  images: ImageSizes[] | null;
  category: string;
  subcategory: string | null;
  stock_quantity: number;
  customization_options: any;
  print_paths: number;
  is_active: boolean;
  tags: string[] | null;
  action_buttons: string[] | null;
  more_info_content: string | null;
  created_at: string;
  updated_at: string;
  product_variants?: SupabaseProductVariant[];
}

interface SupabaseProductVariant {
  id: string;
  product_id: string;
  name: string;
  price: number;
  stock_quantity: number;
  attributes: any;
  created_at: string;
  updated_at: string;
}

// Helper to convert Supabase snake_case to application camelCase
const toAppProduct = (sp: SupabaseProduct): Product => ({
  id: sp.id,
  name: sp.name,
  sku: sp.sku,
  description: sp.description,
  basePrice: sp.base_price,
  discountedPrice: sp.discounted_price ?? undefined,
  images: sp.images || [],
  category: sp.category,
  subcategory: sp.subcategory ?? undefined,
  stockQuantity: sp.stock_quantity,
  customizationOptions: sp.customization_options || { fonts: [], maxCharacters: 50 },
  printPaths: sp.print_paths,
  isActive: sp.is_active,
  tags: sp.tags || [],
  actionButtons: (sp.action_buttons as Product['actionButtons']) || ['customize', 'quick_add'],
  moreInfoContent: sp.more_info_content ?? undefined,
  createdAt: new Date(sp.created_at),
  updatedAt: new Date(sp.updated_at),
  variants: (sp.product_variants || []).map(toAppVariant),
});

const toAppVariant = (sv: SupabaseProductVariant): ProductVariant => ({
  id: sv.id,
  name: sv.name,
  price: sv.price,
  stockQuantity: sv.stock_quantity,
  attributes: sv.attributes || {},
});

// --- Mock Data (Used for initial seeding only) ---
const mockProductVariants: ProductVariant[] = [
  { id: 'v1', name: 'Small', price: 29.99, stockQuantity: 20, attributes: { size: 'S', color: 'White' } },
  { id: 'v2', name: 'Medium', price: 29.99, stockQuantity: 30, attributes: { size: 'M', color: 'White' } },
  { id: 'v3', name: 'Large', price: 29.99, stockQuantity: 25, attributes: { size: 'L', color: 'White' } }
];

const initialMockProducts: Product[] = [
  {
    id: '1', name: 'Custom T-Shirt', sku: 'TS001', description: 'High-quality cotton t-shirt perfect for custom printing.', basePrice: 29.99, discountedPrice: 24.99,
    images: [generateMockImageSizes('/placeholder.svg'), generateMockImageSizes('/placeholder.svg?img=2')], category: 'Apparel', subcategory: 'T-Shirts', stockQuantity: 50, variants: mockProductVariants,
    customizationOptions: { fonts: ['Roboto', 'Poppins'], startDesigns: ['Heart Shape'], endDesigns: ['Flower Icon'], maxCharacters: 50, allowedColors: ['Red', 'Blue', 'Green'] },
    printPaths: 1, isActive: true, tags: ['popular', 'bestseller'], createdAt: new Date(), updatedAt: new Date(), actionButtons: ['customize', 'quick_add'], moreInfoContent: '100% organic cotton.'
  },
  {
    id: '2', name: 'Personalized Mug', sku: 'MG001', description: 'Ceramic mug with custom printing.', basePrice: 19.99, discountedPrice: undefined,
    images: [generateMockImageSizes('/placeholder.svg?img=4')], category: 'Drinkware', subcategory: 'Mugs', stockQuantity: 100, variants: [{ id: 'v4', name: 'Standard 11oz', price: 19.99, stockQuantity: 100, attributes: { material: 'Ceramic' } }],
    customizationOptions: { fonts: ['Roboto', 'Poppins'], maxCharacters: 25 }, printPaths: 1, isActive: true, tags: ['new'], createdAt: new Date(), updatedAt: new Date(), actionButtons: ['quick_add', 'contact'],
  },
];

// --- Supabase CRUD Functions ---

const PRODUCT_SELECT_FIELDS = `
  id, name, sku, description, base_price, discounted_price, images, category, subcategory, 
  stock_quantity, customization_options, print_paths, is_active, tags, action_buttons, 
  more_info_content, created_at, updated_at,
  product_variants (id, product_id, name, price, stock_quantity, attributes, created_at, updated_at)
`;

/**
 * Fetches all products, optionally including inactive ones (for admin view).
 */
export const getAllMockProducts = async (includeInactive: boolean = false): Promise<Product[]> => {
  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT_FIELDS)
    .order('created_at', { ascending: false });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    // Fallback to mock data if Supabase fails (e.g., during initial setup)
    return initialMockProducts;
  }
  
  const products = (data as SupabaseProduct[]).map(toAppProduct);
  
  // If the database is empty, return local mock data for anon users to see something.
  if (products.length === 0) {
      return initialMockProducts;
  }

  return products;
};

/**
 * Fetches a single product by ID.
 */
export const getMockProductById = async (id: string): Promise<Product | undefined> => {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT_FIELDS)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching product:", error);
    // Fallback to mock data if Supabase fails
    return initialMockProducts.find(p => p.id === id);
  }
  
  // If data is null (PGRST116 or genuinely not found), check mock data
  return data ? toAppProduct(data as SupabaseProduct) : initialMockProducts.find(p => p.id === id);
};

/**
 * Creates a new product and its variants.
 */
export const createMockProduct = async (newProductData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'variants'> & { variants?: ProductVariant[] }): Promise<Product> => {
  const { variants = [], ...productData } = newProductData;
  
  const productInsertData = {
    name: productData.name,
    sku: productData.sku,
    description: productData.description,
    base_price: productData.basePrice,
    discounted_price: productData.discountedPrice,
    images: productData.images,
    category: productData.category,
    subcategory: productData.subcategory,
    stock_quantity: productData.stockQuantity,
    customization_options: productData.customizationOptions,
    print_paths: productData.printPaths,
    is_active: productData.isActive,
    tags: productData.tags,
    action_buttons: productData.actionButtons,
    more_info_content: productData.moreInfoContent,
  };

  const { data: productResult, error: productError } = await supabase
    .from('products')
    .insert(productInsertData)
    .select(PRODUCT_SELECT_FIELDS)
    .single();

  if (productError) {
    console.error("Error creating product:", productError);
    throw new Error(productError.message);
  }
  
  const newProduct = toAppProduct(productResult as SupabaseProduct);

  // Insert variants if provided
  if (variants.length > 0) {
    const variantInserts = variants.map(v => ({
      product_id: newProduct.id,
      name: v.name,
      price: v.price,
      stock_quantity: v.stockQuantity,
      attributes: v.attributes,
    }));
    
    const { error: variantError } = await supabase
      .from('product_variants')
      .insert(variantInserts);
      
    if (variantError) {
      console.error("Error creating variants:", variantError);
      // Note: We don't throw here, as the product was created successfully.
    }
  }

  // Fetch the complete product again to include newly created variants
  return (await getMockProductById(newProduct.id)) || newProduct;
};

/**
 * Updates an existing product.
 */
export const updateMockProduct = async (updatedProductData: Partial<Product>): Promise<Product | undefined> => {
  if (!updatedProductData.id) return undefined;

  const productUpdateData = {
    name: updatedProductData.name,
    sku: updatedProductData.sku,
    description: updatedProductData.description,
    base_price: updatedProductData.basePrice,
    discounted_price: updatedProductData.discountedPrice,
    images: updatedProductData.images,
    category: updatedProductData.category,
    subcategory: updatedProductData.subcategory,
    stock_quantity: updatedProductData.stockQuantity,
    customization_options: updatedProductData.customizationOptions,
    print_paths: updatedProductData.printPaths,
    is_active: updatedProductData.isActive,
    tags: updatedProductData.tags,
    action_buttons: updatedProductData.actionButtons,
    more_info_content: updatedProductData.moreInfoContent,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('products')
    .update(productUpdateData)
    .eq('id', updatedProductData.id)
    .select(PRODUCT_SELECT_FIELDS)
    .single();

  if (error) {
    console.error("Error updating product:", error);
    throw new Error(error.message);
  }

  return data ? toAppProduct(data as SupabaseProduct) : undefined;
};

/**
 * Updates only the images array for a product.
 */
export const updateMockProductImages = async (productId: string, newImageUrls: string[]): Promise<Product | undefined> => {
  const newImages: ImageSizes[] = newImageUrls.map(generateMockImageSizes);
  
  const { data, error } = await supabase
    .from('products')
    .update({ images: newImages, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select(PRODUCT_SELECT_FIELDS)
    .single();

  if (error) {
    console.error("Error updating product images:", error);
    throw new Error(error.message);
  }

  return data ? toAppProduct(data as SupabaseProduct) : undefined;
};

/**
 * Updates the stock quantity for a product.
 */
export const updateProductStock = async (productId: string, quantityChange: number): Promise<Product | undefined> => {
  const product = await getMockProductById(productId);
  if (!product) return undefined;

  const newStock = Math.max(0, product.stockQuantity + quantityChange);

  const { data, error } = await supabase
    .from('products')
    .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select(PRODUCT_SELECT_FIELDS)
    .single();

  if (error) {
    console.error("Error updating product stock:", error);
    throw new Error(error.message);
  }

  return data ? toAppProduct(data as SupabaseProduct) : undefined;
};

/**
 * Deletes a product.
 */
export const deleteMockProduct = async (productId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error("Error deleting product:", error);
    throw new Error(error.message);
  }
  
  return true;
};

// --- Variant CRUD Functions ---

/**
 * Fetches all variants for a specific product.
 */
export const getProductVariants = async (productId: string): Promise<ProductVariant[]> => {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching variants:", error);
    return [];
  }
  
  return (data as SupabaseProductVariant[]).map(toAppVariant);
};

/**
 * Creates or updates a product variant.
 */
export const addOrUpdateProductVariant = async (productId: string, variantData: Partial<ProductVariant>): Promise<ProductVariant> => {
  const isUpdate = !!variantData.id;
  
  const variantInsertUpdateData = {
    product_id: productId,
    name: variantData.name,
    price: variantData.price,
    stock_quantity: variantData.stockQuantity,
    attributes: variantData.attributes,
    updated_at: new Date().toISOString(),
  };
  
  let query = supabase.from('product_variants');
  
  if (isUpdate && variantData.id) {
    query = query.update(variantInsertUpdateData).eq('id', variantData.id);
  } else {
    query = query.insert(variantInsertUpdateData);
  }

  const { data, error } = await query.select('*').single();

  if (error) {
    console.error(`Error ${isUpdate ? 'updating' : 'creating'} variant:`, error);
    throw new Error(error.message);
  }
  
  return toAppVariant(data as SupabaseProductVariant);
};

/**
 * Deletes a product variant.
 */
export const deleteProductVariant = async (variantId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', variantId);

  if (error) {
    console.error("Error deleting variant:", error);
    throw new Error(error.message);
  }
  
  return true;
};

// --- Mock functions that need to be updated to use the new async functions ---

// NOTE: These functions are kept for compatibility with existing components 
// but now call the async Supabase functions.

export const mockProducts = initialMockProducts; // Kept for initial seeding logic only

export const getMockProductByIdSync = (id: string): Product | undefined => {
  // This sync function is only used by components that haven't been converted to async yet.
  // We must convert components to async or use a state management solution for data fetching.
  // For now, we rely on the component calling the async version or the initial mock data.
  return initialMockProducts.find(p => p.id === id);
};

export const getAllMockProductsSync = (): Product[] => {
  // This sync function is only used by components that haven't been converted to async yet.
  return initialMockProducts;
};

// Update the mock functions in VariantManagementPage to use the new async functions
export const mockUpdateVariant = async (productId: string, variantData: Partial<ProductVariant>): Promise<ProductVariant | undefined> => {
  return addOrUpdateProductVariant(productId, variantData);
};

export const mockDeleteVariant = async (productId: string, variantId: string): Promise<boolean> => {
  return deleteProductVariant(variantId);
};