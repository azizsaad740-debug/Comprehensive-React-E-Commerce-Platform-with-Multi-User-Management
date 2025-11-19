import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.tsx";
import LoginPage from "./pages/auth/LoginPage.tsx";
import RegisterPage from "./pages/auth/RegisterPage.tsx";
import ProductsPage from "./pages/products/ProductCatalog.tsx"; // Mapped to ProductCatalog
import ProductDetailPage from "./pages/products/ProductDetailPage.tsx"; // Mapped to products/ProductDetailPage
import CartPage from "./pages/cart/CartPage.tsx"; // Mapped to cart/CartPage
import CheckoutPage from "./pages/checkout/CheckoutPage.tsx"; // Mapped to checkout/CheckoutPage
import ContactPage from "./pages/ContactPage.tsx"; // Mapped to ContactPage
import ProfilePage from "./pages/profile/ProfilePage.tsx";
import AdminDashboard from "@/pages/admin/Dashboard.tsx";
import ProtectedRoute from "@/components/auth/ProtectedRoute.tsx";
import AdminLayout from "@/components/layout/AdminLayout.tsx";
import AdminProductsPage from "@/pages/admin/ProductManagementPage.tsx"; // Mapped to ProductManagementPage
import AdminOrdersPage from "@/pages/admin/OrderManagementPage.tsx"; // Mapped to OrderManagementPage
import AdminUsersPage from "@/pages/admin/UserManagementPage.tsx"; // Mapped to UserManagementPage
import AdminPromoCodesPage from "@/pages/admin/PromoCodeManagementPage.tsx"; // Mapped to PromoCodeManagementPage
import AdminThemeEditor from "@/pages/admin/SettingsPage.tsx"; // Mapped to SettingsPage
import AdminPluginManagement from "@/pages/admin/PluginManagementPage.tsx"; // Mapped to PluginManagementPage
import ResellerDashboard from "@/pages/reseller/ResellerDashboard.tsx";
import ResellerPromoCodesPage from "@/pages/reseller/ResellerPromoCodePage.tsx"; // Mapped to ResellerPromoCodePage
import ResellerOrdersPage from "@/pages/admin/OrderManagementPage.tsx"; // Mapped to OrderManagementPage (handles reseller view)
import ResellerCustomersPage from "@/pages/reseller/CustomerManagementPage.tsx"; // Mapped to CustomerManagementPage
import POSPage from "@/pages/admin/POSPage.tsx";
import DesignLibraryPage from "@/pages/profile/DesignLibraryPage.tsx";
import LedgerPage from "@/pages/admin/LedgerManagementPage.tsx"; // Mapped to LedgerManagementPage
import CustomerLedgerPage from "@/pages/admin/EntityDetailPage.tsx"; // Mapped to EntityDetailPage
import OrderHistoryPage from "@/pages/orders/OrdersPage.tsx"; // Mapped to orders/OrdersPage
import OrderDetailPage from "@/pages/orders/OrderDetailPage.tsx"; // Mapped to orders/OrderDetailPage
import NotFoundPage from "./pages/NotFound.tsx"; // Mapped to NotFound.tsx

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/:id/design" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Authenticated User Routes */}
        <Route element={<ProtectedRoute allowedRoles={['customer', 'reseller', 'admin']} />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/designs" element={<DesignLibraryPage />} />
          <Route path="/profile/orders" element={<OrderHistoryPage />} />
          <Route path="/profile/orders/:id" element={<OrderDetailPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/promocodes" element={<AdminPromoCodesPage />} />
          <Route path="/admin/theme" element={<AdminThemeEditor />} />
          <Route path="/admin/plugins" element={<AdminPluginManagement />} />
          <Route path="/admin/pos" element={<POSPage />} />
          <Route path="/admin/ledger" element={<LedgerPage />} />
        </Route>

        {/* Reseller Routes */}
        <Route element={<ProtectedRoute allowedRoles={['reseller']} />}>
          <Route path="/reseller" element={<ResellerDashboard />} />
          <Route path="/reseller/dashboard" element={<ResellerDashboard />} />
          <Route path="/reseller/promocodes" element={<ResellerPromoCodesPage />} />
          <Route path="/reseller/orders" element={<ResellerOrdersPage />} />
          <Route path="/reseller/customers" element={<ResellerCustomersPage />} />
          <Route path="/reseller/ledger/:entityId" element={<CustomerLedgerPage />} />
        </Route>
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;