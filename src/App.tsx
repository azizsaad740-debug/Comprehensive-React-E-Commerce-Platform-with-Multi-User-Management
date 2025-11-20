import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import LazyRoute from "./components/layout/LazyRoute";
import ProtectedRoute from "@/components/auth/ProtectedRoute.tsx";
import NotFoundPage from "./pages/NotFound.tsx";

// --- Lazy Loaded Components ---
const Index = () => import("./pages/Index.tsx");
const LoginPage = () => import("./pages/auth/LoginPage.tsx");
const RegisterPage = () => import("./pages/auth/RegisterPage.tsx");
const ProductsPage = () => import("./pages/products/ProductCatalog.tsx");
const ProductDetailPage = () => import("./pages/products/ProductDetailPage.tsx");
const DesignEditorPage = () => import("./pages/products/DesignEditorPage.tsx");
const CartPage = () => import("./pages/cart/CartPage.tsx");
const CheckoutPage = () => import("./pages/checkout/CheckoutPage.tsx");
const ContactPage = () => import("./pages/ContactPage.tsx");
const ProfilePage = () => import("./pages/profile/ProfilePage.tsx");
const DesignLibraryPage = () => import("./pages/profile/DesignLibraryPage.tsx");
const AddressBookPage = () => import("./pages/profile/AddressBookPage.tsx");
const OrderHistoryPage = () => import("./pages/orders/OrdersPage.tsx");
const OrderDetailPage = () => import("./pages/orders/OrderDetailPage.tsx");
const OrderConfirmationPage = () => import("./pages/checkout/OrderConfirmationPage.tsx");
const FaqPage = () => import("./pages/FaqPage.tsx");
const ContentPage = () => import("./pages/ContentPage.tsx");

// Admin/Reseller Pages
const AdminDashboard = () => import("@/pages/admin/Dashboard.tsx");
const AdminProductsPage = () => import("@/pages/admin/ProductManagementPage.tsx");
const VariantManagementPage = () => import("./pages/admin/VariantManagementPage.tsx");
const AdminOrdersPage = () => import("@/pages/admin/OrderManagementPage.tsx");
const AdminOrderDetailPage = () => import("./pages/admin/AdminOrderDetailPage.tsx");
const UserManagementPage = () => import("@/pages/admin/UserManagementPage.tsx");
const AdminPromoCodesPage = () => import("@/pages/admin/PromoCodeManagementPage.tsx");
const AdminThemeEditor = () => import("@/pages/admin/SettingsPage.tsx");
const AdminPluginManagement = () => import("@/pages/admin/PluginManagementPage.tsx");
const POSPage = () => import("@/pages/admin/POSPage.tsx");
const LedgerPage = () => import("@/pages/admin/LedgerManagementPage.tsx");
const EntityDetailPage = () => import("./pages/admin/EntityDetailPage.tsx");
const CustomizationManagementPage = () => import("./pages/admin/CustomizationManagementPage.tsx");
const ContentManagementPage = () => import("./pages/admin/ContentManagementPage.tsx");
const DataManagementPage = () => import("./pages/admin/DataManagementPage.tsx");
const AIBulkOperationsPage = () => import("./pages/admin/AIBulkOperationsPage.tsx");
const POSOperatorManagementPage = () => import("./pages/admin/POSOperatorManagementPage.tsx");
const MobileScannerPage = () => import("./pages/admin/MobileScannerPage.tsx");

const ResellerDashboard = () => import("@/pages/reseller/ResellerDashboard.tsx");
const ResellerPromoCodesPage = () => import("@/pages/reseller/ResellerPromoCodePage.tsx");
const ResellerCustomersPage = () => import("@/pages/reseller/CustomerManagementPage.tsx");
const CommissionTrackingPage = () => import("./pages/reseller/CommissionTrackingPage.tsx");
const ResellerOrdersPage = () => import("@/pages/reseller/ResellerOrdersPage.tsx");

// --- Wrapper component to extract slug from URL parameters and pass it as a prop
const ContentPageWrapper = () => {
  const { slug } = useParams();
  return <LazyRoute factory={() => ContentPage().then(mod => ({ default: () => <mod.default slug={slug || ''} /> }))} />;
};

// --- New Admin Login Page ---
const AdminLoginGate = () => import("./pages/admin/AdminLoginGate.tsx");
const AdminLoginPage = () => import("./pages/admin/AdminLoginPage.tsx");


const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LazyRoute factory={Index} />} />
      <Route path="/auth/login" element={<LazyRoute factory={LoginPage} />} />
      <Route path="/auth/register" element={<LazyRoute factory={RegisterPage} />} />
      <Route path="/products" element={<LazyRoute factory={ProductsPage} />} />
      <Route path="/products/:id" element={<LazyRoute factory={ProductDetailPage} />} />
      <Route path="/products/:id/design" element={<LazyRoute factory={DesignEditorPage} />} />
      <Route path="/cart" element={<LazyRoute factory={CartPage} />} />
      <Route path="/checkout" element={<LazyRoute factory={CheckoutPage} />} />
      <Route path="/checkout/confirmation" element={<LazyRoute factory={OrderConfirmationPage} />} />
      <Route path="/contact" element={<LazyRoute factory={ContactPage} />} />
      <Route path="/faq" element={<LazyRoute factory={FaqPage} />} />
      <Route path="/:slug" element={<ContentPageWrapper />} />
      <Route path="/404" element={<NotFoundPage />} />

      {/* Admin Access Gate */}
      <Route path="/admincpanelaccess" element={<LazyRoute factory={AdminLoginGate} />} />
      <Route path="/admincpanelaccess/login" element={<LazyRoute factory={AdminLoginPage} />} />

      {/* Authenticated User Routes (Customer/Reseller/Counter) */}
      <Route element={<ProtectedRoute allowedRoles={['customer', 'reseller', 'admin', 'superuser', 'counter']} />}>
        <Route path="/profile" element={<LazyRoute factory={ProfilePage} />} />
        <Route path="/profile/designs" element={<LazyRoute factory={DesignLibraryPage} />} />
        <Route path="/profile/addresses" element={<LazyRoute factory={AddressBookPage} />} />
        <Route path="/orders" element={<LazyRoute factory={OrderHistoryPage} />} />
        <Route path="/orders/:id" element={<LazyRoute factory={OrderDetailPage} />} />
      </Route>
      
      {/* POS Operator Routes (Counter/Admin/Superuser) */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'superuser', 'counter']} />}>
        <Route path="/admin/pos" element={<LazyRoute factory={POSPage} />} />
        <Route path="/admin/pos/scan" element={<LazyRoute factory={MobileScannerPage} />} />
      </Route>

      {/* Admin Routes (Admin/Superuser) - Protected by the new login gate */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'superuser']} />}>
        <Route path="/admin" element={<LazyRoute factory={AdminDashboard} />} />
        <Route path="/admin/dashboard" element={<LazyRoute factory={AdminDashboard} />} />
        <Route path="/admin/products" element={<LazyRoute factory={AdminProductsPage} />} />
        <Route path="/admin/products/:id/variants" element={<LazyRoute factory={VariantManagementPage} />} />
        <Route path="/admin/orders" element={<LazyRoute factory={AdminOrdersPage} />} />
        <Route path="/admin/orders/:id" element={<LazyRoute factory={AdminOrderDetailPage} />} />
        <Route path="/admin/users" element={<LazyRoute factory={UserManagementPage} />} />
        <Route path="/admin/promocodes" element={<LazyRoute factory={AdminPromoCodesPage} />} />
        <Route path="/admin/theme" element={<LazyRoute factory={AdminThemeEditor} />} />
        <Route path="/admin/plugins" element={<LazyRoute factory={AdminPluginManagement} />} />
        <Route path="/admin/pos-operators" element={<LazyRoute factory={POSOperatorManagementPage} />} />
        <Route path="/admin/ledger" element={<LazyRoute factory={LedgerPage} />} />
        <Route path="/admin/ledger/:entityId" element={<LazyRoute factory={EntityDetailPage} />} />
        <Route path="/admin/customization" element={<LazyRoute factory={CustomizationManagementPage} />} />
        <Route path="/admin/content" element={<LazyRoute factory={ContentManagementPage} />} />
        <Route path="/admin/data" element={<LazyRoute factory={DataManagementPage} />} />
        <Route path="/admin/ai-bulk" element={<LazyRoute factory={AIBulkOperationsPage} />} />
      </Route>

      {/* Reseller Routes (Reseller/Admin/Superuser) */}
      <Route element={<ProtectedRoute allowedRoles={['reseller', 'admin', 'superuser']} />}>
        <Route path="/reseller" element={<LazyRoute factory={ResellerDashboard} />} />
        <Route path="/reseller/dashboard" element={<LazyRoute factory={ResellerDashboard} />} />
        <Route path="/reseller/promocodes" element={<LazyRoute factory={ResellerPromoCodesPage} />} />
        <Route path="/reseller/orders" element={<LazyRoute factory={ResellerOrdersPage} />} />
        <Route path="/reseller/customers" element={<LazyRoute factory={ResellerCustomersPage} />} />
        <Route path="/reseller/commissions" element={<LazyRoute factory={CommissionTrackingPage} />} />
      </Route>
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;