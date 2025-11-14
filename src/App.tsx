import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProductCatalog from "./pages/products/ProductCatalog";
import ProductDetailPage from "./pages/products/ProductDetailPage";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import OrderConfirmationPage from "./pages/checkout/OrderConfirmationPage";
import OrdersPage from "./pages/orders/OrdersPage";
import ProfilePage from "./pages/profile/ProfilePage";
import AdminDashboard from "@/pages/admin/Dashboard.tsx";
import ProtectedRoute from "@/components/auth/ProtectedRoute.tsx";
import OrderDetailPage from "./pages/orders/OrderDetailPage.tsx";
import UserManagementPage from "./pages/admin/UserManagementPage.tsx";
import ProductManagementPage from "./pages/admin/ProductManagementPage.tsx";
import CommissionTrackingPage from "@/pages/reseller/CommissionTrackingPage.tsx";
import OrderManagementPage from "./pages/admin/OrderManagementPage.tsx";
import ResellerDashboard from "./pages/reseller/ResellerDashboard.tsx";
import PromoCodeManagementPage from "./pages/admin/PromoCodeManagementPage.tsx";
import AdminOrderDetailPage from "./pages/admin/AdminOrderDetailPage.tsx";
import ResellerPromoCodePage from "./pages/reseller/ResellerPromoCodePage.tsx";
import CustomerManagementPage from "./pages/reseller/CustomerManagementPage.tsx";
import AddressBookPage from "./pages/profile/AddressBookPage.tsx";
import DesignLibraryPage from "./pages/profile/DesignLibraryPage.tsx";
import SettingsPage from "./pages/admin/SettingsPage.tsx";
import PluginManagementPage from "./pages/admin/PluginManagementPage.tsx";
import DesignEditorPage from "./pages/products/DesignEditorPage";
import VariantManagementPage from "./pages/admin/VariantManagementPage";
import ContentManagementPage from "./pages/admin/ContentManagementPage";
import CustomizationManagementPage from "./pages/admin/CustomizationManagementPage";
import { ThemeProvider } from "./components/layout/ThemeProvider";
import ContentPage from "./pages/ContentPage";
import FaqPage from "./pages/FaqPage";
import LedgerManagementPage from "./pages/admin/LedgerManagementPage";
import { SessionContextProvider } from "./integrations/supabase/SessionContextProvider"; // Import SessionContextProvider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <SessionContextProvider> {/* Moved SessionContextProvider here */}
          <BrowserRouter>
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
          </BrowserRouter>
        </SessionContextProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;