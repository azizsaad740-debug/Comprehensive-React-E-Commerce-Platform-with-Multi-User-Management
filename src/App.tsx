import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.tsx";
import LoginPage from "./pages/auth/LoginPage.tsx";
import RegisterPage from "./pages/auth/RegisterPage.tsx";
import ProductsPage from "./pages/ProductsPage.tsx";
import ProductDetailPage from "./pages/ProductDetailPage.tsx";
import CartPage from "./pages/CartPage.tsx";
import CheckoutPage from "./pages/CheckoutPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import ProfilePage from "./pages/profile/ProfilePage.tsx";
import AdminDashboard from "@/pages/admin/Dashboard.tsx";
import ProtectedRoute from "@/components/auth/ProtectedRoute.tsx";
import AdminLayout from "@/components/layout/AdminLayout.tsx";
import AdminProductsPage from "@/pages/admin/AdminProductsPage.tsx";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage.tsx";
import AdminUsersPage from "@/pages/admin/AdminUsersPage.tsx";
import AdminPromoCodesPage from "@/pages/admin/AdminPromoCodesPage.tsx";
import AdminThemeEditor from "@/pages/admin/AdminThemeEditor.tsx";
import AdminPluginManagement from "@/pages/admin/AdminPluginManagement.tsx";
import ResellerDashboard from "@/pages/reseller/ResellerDashboard.tsx";
import ResellerPromoCodesPage from "@/pages/reseller/ResellerPromoCodesPage.tsx";
import ResellerOrdersPage from "@/pages/reseller/ResellerOrdersPage.tsx";
import ResellerCustomersPage from "@/pages/reseller/ResellerCustomersPage.tsx";
import POSPage from "@/pages/admin/POSPage.tsx";
import DesignLibraryPage from "@/pages/profile/DesignLibraryPage.tsx";
import LedgerPage from "@/pages/admin/LedgerPage.tsx";
import CustomerLedgerPage from "@/pages/reseller/CustomerLedgerPage.tsx";
import OrderHistoryPage from "@/pages/profile/OrderHistoryPage.tsx";
import OrderDetailPage from "@/pages/profile/OrderDetailPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";

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