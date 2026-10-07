import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
const StorefrontLayout = lazy(() => import('./layouts/StorefrontLayout').then((m) => ({ default: m.StorefrontLayout })));
const VendorLayout = lazy(() => import('./layouts/VendorLayout').then((m) => ({ default: m.VendorLayout })));
const AdminLayout = lazy(() => import('./layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })));

// Storefront Pages
const HomePage = lazy(() => import('./pages/storefront/HomePage').then((m) => ({ default: m.HomePage })));
const ProductListingPage = lazy(() => import('./pages/storefront/ProductListingPage').then((m) => ({ default: m.ProductListingPage })));
const ProductDetailPage = lazy(() => import('./pages/storefront/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('./pages/storefront/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/storefront/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const OrdersPage = lazy(() => import('./pages/storefront/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const OrderDetailPage = lazy(() => import('./pages/storefront/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })));
const CustomerProfilePage = lazy(() => import('./pages/storefront/CustomerProfilePage').then((m) => ({ default: m.CustomerProfilePage })));

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));

// Vendor Dashboard Pages
const VendorDashboardPage = lazy(() => import('./pages/vendor/VendorDashboardPage').then((m) => ({ default: m.VendorDashboardPage })));
const VendorProductsPage = lazy(() => import('./pages/vendor/VendorProductsPage').then((m) => ({ default: m.VendorProductsPage })));
const VendorProductFormPage = lazy(() => import('./pages/vendor/VendorProductFormPage').then((m) => ({ default: m.VendorProductFormPage })));
const VendorOrdersPage = lazy(() => import('./pages/vendor/VendorOrdersPage').then((m) => ({ default: m.VendorOrdersPage })));
const VendorProfilePage = lazy(() => import('./pages/vendor/VendorProfilePage').then((m) => ({ default: m.VendorProfilePage })));

// Admin Dashboard Pages
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminVendorsPage = lazy(() => import('./pages/admin/AdminVendorsPage').then((m) => ({ default: m.AdminVendorsPage })));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage })));

// Common
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
import { ProtectedRoute } from './components/routing/ProtectedRoute';

export const App = () => {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-sm text-slate-500">Loading…</div>}>
    <Routes>
      {/* Customer Storefront Routes */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListingPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/profile" element={<CustomerProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Vendor Portal Routes (Protected) */}
      <Route
        path="/vendor"
        element={
          <ProtectedRoute allowedRoles={['VENDOR', 'ADMIN']}>
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<VendorDashboardPage />} />
        <Route path="products" element={<VendorProductsPage />} />
        <Route path="products/new" element={<VendorProductFormPage />} />
        <Route path="products/:id/edit" element={<VendorProductFormPage />} />
        <Route path="orders" element={<VendorOrdersPage />} />
        <Route path="profile" element={<VendorProfilePage />} />
      </Route>

      {/* Admin Dashboard Routes (Protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="vendors" element={<AdminVendorsPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  );
};

export default App;
