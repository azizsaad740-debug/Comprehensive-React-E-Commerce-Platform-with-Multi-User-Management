import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import Index from "./pages/Index.tsx";
import LoginPage from "./pages/auth/LoginPage.tsx";
import RegisterPage from "./pages/auth/RegisterPage.tsx";
import ProductsPage from "./pages/products/ProductCatalog.tsx"; // Mapped to ProductCatalog
import ProductDetailPage from "./pages/products/ProductDetailPage.tsx"; // Mapped to products/ProductDetailPage
import DesignEditorPage from "./pages/products/DesignEditorPage.tsx"; // Mapped to products/DesignEditorPage
import CartPage from "./pages/cart/CartPage.tsx"; // Mapped to cart/CartPage
import CheckoutPage from "./pages/checkout/CheckoutPage.tsx"; // Mapped to checkout/CheckoutPage
import ContactPage from "./pages/ContactPage.tsx"; // Mapped to ContactPage
import ProfilePage from "./pages/profile/ProfilePage.tsx";
import AdminDashboard from "@/pages/admin/Dashboard.tsx";
import ProtectedRoute from "@/components/auth/ProtectedRoute.tsx";
import AdminProductsPage from "@/pages/admin/ProductManagementPage.tsx"; // Mapped to ProductManagementPage
import AdminOrdersPage from "@/pages/admin/OrderManagementPage.tsx"; // Mapped to OrderManagementPage
import UserManagementPage from "@/pages/admin/UserManagementPage.tsx"; // Mapped to UserManagementPage (FIXED ALIAS)
import AdminPromoCodesPage from "@/pages/admin/PromoCodeManagementPage.tsx"; // Mapped to PromoCodeManagementPage
import AdminThemeEditor from "@/pages/admin/SettingsPage.tsx"; // Mapped to SettingsPage
import AdminPluginManagement from "@/pages/admin/PluginManagementPage.tsx"; // Mapped to PluginManagementPage
import ResellerDashboard from "@/pages/reseller/ResellerDashboard.tsx";
import ResellerPromoCodesPage from "@/pages/reseller/ResellerPromoCodePage.tsx"; // Mapped to ResellerPromoCodePage
import ResellerCustomersPage from "@/pages/reseller/CustomerManagementPage.tsx"; // Mapped to CustomerManagementPage
import POSPage from "@/pages/admin/POSPage.tsx";
import DesignLibraryPage from "@/pages/profile/DesignLibraryPage.tsx";
import LedgerPage from "@/pages/admin/LedgerManagementPage.tsx"; // Mapped to LedgerManagementPage
import OrderHistoryPage from "@/pages/orders/OrdersPage.tsx"; // Mapped to orders/OrdersPage
import OrderDetailPage from "./pages/orders/OrderDetailPage.tsx"; // Mapped to orders/OrderDetailPage
import NotFoundPage from "./pages/NotFound.tsx"; // Mapped to NotFound.tsx
import CustomizationManagementPage from "./pages/admin/CustomizationManagementPage.tsx"; // NEW IMPORT
import ContentManagementPage from "./pages/admin/ContentManagementPage.tsx"; // NEW IMPORT
import DataManagementPage from "./pages/admin/DataManagementPage.tsx"; // NEW IMPORT
import AIBulkOperationsPage from "./pages/admin/AIBulkOperationsPage.tsx"; // NEW IMPORT
import POSOperatorManagementPage from "./pages/admin/POSOperatorManagementPage.tsx"; // NEW IMPORT
import OrderConfirmationPage from "./pages/checkout/OrderConfirmationPage.tsx"; // NEW IMPORT
import AddressBookPage from "./pages/profile/AddressBookPage.tsx"; // NEW IMPORT
import CommissionTrackingPage from "./pages/reseller/CommissionTrackingPage.tsx"; // NEW IMPORT
import AdminOrderDetailPage from "./pages/admin/AdminOrderDetailPage.tsx"; // NEW IMPORT
import EntityDetailPage from "./pages/admin/EntityDetailPage.tsx"; // NEW IMPORT
import FaqPage from "./pages/FaqPage.tsx"; // ADDED
import ContentPage from "./pages/ContentPage.tsx"; // ADDED
import VariantManagementPage from "./pages/admin/VariantManagementPage.tsx"; // ADDED MISSING IMPORT
import MobileScannerPage from "./pages/admin/MobileScannerPage.tsx"; // ADDED MISSING IMPORT


// Wrapper component to extract slug from URL parameters and pass it as a prop
const ContentPageWrapper = () => {
  const { slug } = useParams();
  // Assuming ContentPageProps requires slug: string
  return <ContentPage slug={slug || ''} />;
};


const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/products/:id/design" element={<DesignEditorPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/checkout/confirmation" element={<OrderConfirmationPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/:slug" element={<ContentPageWrapper />} /> {/* USED WRAPPER */}
      <Route path="/404" element={<NotFoundPage />} />

      {/* Authenticated User Routes */}
      <Route element={<ProtectedRoute allowedRoles={['customer', 'reseller', 'admin', 'superuser', 'counter']} />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/designs" element={<DesignLibraryPage />} />
        <Route path="/profile/addresses" element={<AddressBookPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'superuser']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/products/:id/variants" element={<VariantManagementPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/promocodes" element={<AdminPromoCodesPage />} />
        <Route path="/admin/theme" element={<AdminThemeEditor />} />
        <Route path="/admin/plugins" element={<AdminPluginManagement />} />
        <Route path="/admin/pos" element={<POSPage />} />
        <Route path="/admin/pos-operators" element={<POSOperatorManagementPage />} />
        <Route path="/admin/pos/scan" element={<MobileScannerPage />} />
        <Route path="/admin/ledger" element={<LedgerPage />} />
        <Route path="/admin/ledger/:entityId" element={<EntityDetailPage />} />
        <Route path="/admin/customization" element={<CustomizationManagementPage />} />
        <Route path="/admin/content" element={<ContentManagementPage />} />
        <Route path="/admin/data" element={<DataManagementPage />} />
        <Route path="/admin/ai-bulk" element={<AIBulkOperationsPage />} />
      </Route>

      {/* Reseller Routes */}
      <Route element={<ProtectedRoute allowedRoles={['reseller']} />}>
        <Route path="/reseller" element={<ResellerDashboard />} />
        <Route path="/reseller/dashboard" element={<ResellerDashboard />} />
        <Route path="/reseller/promocodes" element={<ResellerPromoCodesPage />} />
        <Route path="/reseller/orders" element={<ResellerOrdersPage />} />
        <Route path="/reseller/customers" element={<ResellerCustomersPage />} />
        <Route path="/reseller/commissions" element={<CommissionTrackingPage />} />
      </Route>
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;