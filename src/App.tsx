import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { SessionContextProvider } from "./integrations/supabase/SessionContextProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute.tsx";
import { Loader2 } from "lucide-react";

// --- Lazy Loaded Pages ---
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ProductCatalog = lazy(() => import("./pages/products/ProductCatalog"));
const ProductDetailPage = lazy(() => import("./pages/products/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/cart/CartPage"));
const CheckoutPage = lazy(() => import("./pages/checkout/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("./pages/checkout/OrderConfirmationPage"));
const OrdersPage = lazy(() => import("./pages/orders/OrdersPage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard.tsx"));
const OrderDetailPage = lazy(() => import("./pages/orders/OrderDetailPage.tsx"));
const UserManagementPage = lazy(() => import("./pages/admin/UserManagementPage.tsx"));
const ProductManagementPage = lazy(() => import("./pages/admin/ProductManagementPage.tsx"));
const CommissionTrackingPage = lazy(() => import("@/pages/reseller/CommissionTrackingPage.tsx"));
const OrderManagementPage = lazy(() => import("./pages/admin/OrderManagementPage.tsx"));
const ResellerDashboard = lazy(() => import("./pages/reseller/ResellerDashboard.tsx"));
const PromoCodeManagementPage = lazy(() => import("./pages/admin/PromoCodeManagementPage.tsx"));
const AdminOrderDetailPage = lazy(() => import("./pages/admin/AdminOrderDetailPage.tsx"));
const ResellerPromoCodePage = lazy(() => import("./pages/reseller/ResellerPromoCodePage.tsx"));
const CustomerManagementPage = lazy(() => import("./pages/reseller/CustomerManagementPage.tsx"));
const AddressBookPage = lazy(() => import("./pages/profile/AddressBookPage.tsx"));
const DesignLibraryPage = lazy(() => import("./pages/profile/DesignLibraryPage.tsx"));
const SettingsPage = lazy(() => import("./pages/admin/SettingsPage.tsx"));
const PluginManagementPage = lazy(() => import("./pages/admin/PluginManagementPage.tsx"));
const DesignEditorPage = lazy(() => import("./pages/products/DesignEditorPage"));
const VariantManagementPage = lazy(() => import("./pages/admin/VariantManagementPage"));
const ContentManagementPage = lazy(() => import("./pages/admin/ContentManagementPage"));
const CustomizationManagementPage = lazy(() => import("./pages/admin/CustomizationManagementPage"));
const ContentPage = lazy(() => import("./pages/ContentPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const LedgerManagementPage = lazy(() => import("./pages/admin/LedgerManagementPage"));
const EntityDetailPage = lazy(() => import("./pages/admin/EntityDetailPage"));
const POSPage = lazy(() => import("./pages/admin/POSPage"));
const DataManagementPage = lazy(() => import("./pages/admin/DataManagementPage"));
const ThemeProvider = lazy(() => import("./components/layout/ThemeProvider").then(module => ({ default: module.ThemeProvider })));

const queryClient = new QueryClient();

// Fallback component for loading state
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={<LoadingFallback />}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <SessionContextProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<ProductCatalog />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/products/:id/design" element={<DesignEditorPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders/confirmation" element={<OrderConfirmationPage />} />
                  
                  {/* Customer Order Routes (Protected) */}
                  <Route 
                    path="/orders" 
                    element={
                      <ProtectedRoute allowedRoles={['customer', 'reseller', 'admin']}>
                        <OrdersPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/orders/:id" 
                    element={
                      <ProtectedRoute allowedRoles={['customer', 'reseller', 'admin']}>
                        <OrderDetailPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Profile Routes (Protected) */}
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute allowedRoles={['customer', 'reseller', 'admin']}>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile/addresses" 
                    element={
                      <ProtectedRoute allowedRoles={['customer', 'reseller', 'admin']}>
                        <AddressBookPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile/designs" 
                    element={
                      <ProtectedRoute allowedRoles={['customer', 'reseller', 'admin']}>
                        <DesignLibraryPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route path="/auth/login" element={<LoginPage />} />
                  <Route path="/auth/register" element={<RegisterPage />} />
                  
                  {/* Static Pages (Unprotected, reading content from store) */}
                  <Route path="/about" element={<ContentPage slug="about" />} />
                  <Route path="/contact" element={<ContentPage slug="contact" />} />
                  <Route path="/shipping" element={<ContentPage slug="shipping" />} />
                  <Route path="/returns" element={<ContentPage slug="returns" />} />
                  <Route path="/size-guide" element={<ContentPage slug="size-guide" />} />
                  <Route path="/care-instructions" element={<ContentPage slug="care-instructions" />} />
                  <Route path="/track-order" element={<ContentPage slug="track-order" />} />
                  <Route path="/faq" element={<FaqPage />} />
                  
                  {/* Protected Admin/Reseller Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/pos" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <POSPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/reseller/dashboard" 
                    element={
                      <ProtectedRoute allowedRoles={['reseller', 'admin']}>
                        <ResellerDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/users" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <UserManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/products" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ProductManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/products/:id/variants" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <VariantManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/orders" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'reseller']}>
                        <OrderManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/orders/:id" 
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'reseller']}>
                        <AdminOrderDetailPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/promocodes" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <PromoCodeManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/ledger" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <LedgerManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/ledger/:entityId" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <EntityDetailPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/customization" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <CustomizationManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/theme" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <SettingsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/plugins" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <PluginManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/content" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ContentManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/data" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <DataManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/reseller/promocodes" 
                    element={
                      <ProtectedRoute allowedRoles={['reseller']}>
                        <ResellerPromoCodePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/reseller/customers" 
                    element={
                      <ProtectedRoute allowedRoles={['reseller']}>
                        <CustomerManagementPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/reseller/commissions" 
                    element={
                      <ProtectedRoute allowedRoles={['reseller', 'admin']}>
                        <CommissionTrackingPage />
                      </ProtectedRoute>
                    } 
                  />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
            </SessionContextProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </Suspense>
  </QueryClientProvider>
);

export default App;