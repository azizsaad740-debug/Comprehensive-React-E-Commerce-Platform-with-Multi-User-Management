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
import ThemeEditorPage from "./pages/admin/ThemeEditorPage.tsx";
import PluginManagementPage from "./pages/admin/PluginManagementPage.tsx";
import SupabaseAuthProvider from "./components/auth/SupabaseAuthProvider";
import DesignEditorPage from "./pages/products/DesignEditorPage";
import VariantManagementPage from "./pages/admin/VariantManagementPage";
import ImageManagementPage from "./pages/admin/ImageManagementPage";
import CustomizationManagementPage from "./pages/admin/CustomizationManagementPage"; // Import new page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <SupabaseAuthProvider>
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
                  <ThemeEditorPage />
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
                  <ImageManagementPage />
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
        </SupabaseAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;