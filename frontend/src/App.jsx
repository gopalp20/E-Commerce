import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { StorefrontLayout } from './layouts/StorefrontLayout';
import { VendorLayout } from './layouts/VendorLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Storefront Pages
import { HomePage } from './pages/storefront/HomePage';
import { ProductListingPage } from './pages/storefront/ProductListingPage';
import { ProductDetailPage } from './pages/storefront/ProductDetailPage';
import { CartPage } from './pages/storefront/CartPage';
import { CheckoutPage } from './pages/storefront/CheckoutPage';
import { OrdersPage } from './pages/storefront/OrdersPage';
import { OrderDetailPage } from './pages/storefront/OrderDetailPage';
import { CustomerProfilePage } from './pages/storefront/CustomerProfilePage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Vendor Dashboard Pages
import { VendorDashboardPage } from './pages/vendor/VendorDashboardPage';
import { VendorProductsPage } from './pages/vendor/VendorProductsPage';
import { VendorProductFormPage } from './pages/vendor/VendorProductFormPage';
import { VendorOrdersPage } from './pages/vendor/VendorOrdersPage';
import { VendorProfilePage } from './pages/vendor/VendorProfilePage';

// Admin Dashboard Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminVendorsPage } from './pages/admin/AdminVendorsPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';

// Common
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/routing/ProtectedRoute';

export const App = () => {
  return (
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
  );
};

export default App;
