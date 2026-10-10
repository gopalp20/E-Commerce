import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { roleHome } from "./lib/authNavigation";
// Layouts
const StorefrontLayout = lazy(() =>
  import("./layouts/StorefrontLayout").then((m) => ({
    default: m.StorefrontLayout,
  })),
);
const VendorLayout = lazy(() =>
  import("./layouts/VendorLayout").then((m) => ({ default: m.VendorLayout })),
);
const AdminLayout = lazy(() =>
  import("./layouts/AdminLayout").then((m) => ({ default: m.AdminLayout })),
);

// Storefront Pages
const HomePage = lazy(() =>
  import("./pages/storefront/HomePage").then((m) => ({ default: m.HomePage })),
);
const ProductListingPage = lazy(() =>
  import("./pages/storefront/ProductListingPage").then((m) => ({
    default: m.ProductListingPage,
  })),
);
const ProductDetailPage = lazy(() =>
  import("./pages/storefront/ProductDetailPage").then((m) => ({
    default: m.ProductDetailPage,
  })),
);
const CartPage = lazy(() =>
  import("./pages/storefront/CartPage").then((m) => ({ default: m.CartPage })),
);
const CheckoutPage = lazy(() =>
  import("./pages/storefront/CheckoutPage").then((m) => ({
    default: m.CheckoutPage,
  })),
);
const OrdersPage = lazy(() =>
  import("./pages/storefront/OrdersPage").then((m) => ({
    default: m.OrdersPage,
  })),
);
const OrderDetailPage = lazy(() =>
  import("./pages/storefront/OrderDetailPage").then((m) => ({
    default: m.OrderDetailPage,
  })),
);
const CustomerProfilePage = lazy(() =>
  import("./pages/storefront/CustomerProfilePage").then((m) => ({
    default: m.CustomerProfilePage,
  })),
);

const InfoPage = lazy(() =>
  import("./pages/storefront/InfoPage").then((m) => ({ default: m.InfoPage })),
);

// Auth Pages
const LoginPage = lazy(() =>
  import("./pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("./pages/auth/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  })),
);

// Vendor Dashboard Pages
const VendorDashboardPage = lazy(() =>
  import("./pages/vendor/VendorDashboardPage").then((m) => ({
    default: m.VendorDashboardPage,
  })),
);
const VendorProductsPage = lazy(() =>
  import("./pages/vendor/VendorProductsPage").then((m) => ({
    default: m.VendorProductsPage,
  })),
);
const VendorProductFormPage = lazy(() =>
  import("./pages/vendor/VendorProductFormPage").then((m) => ({
    default: m.VendorProductFormPage,
  })),
);
const VendorOrdersPage = lazy(() =>
  import("./pages/vendor/VendorOrdersPage").then((m) => ({
    default: m.VendorOrdersPage,
  })),
);
const VendorProfilePage = lazy(() =>
  import("./pages/vendor/VendorProfilePage").then((m) => ({
    default: m.VendorProfilePage,
  })),
);

// Admin Dashboard Pages
const AdminOverviewPage = lazy(() =>
  import("./pages/admin/AdminOverviewPage").then((m) => ({
    default: m.AdminOverviewPage,
  })),
);
const AdminUsersPage = lazy(() =>
  import("./pages/admin/AdminUsersPage").then((m) => ({
    default: m.AdminUsersPage,
  })),
);
const AdminVendorsPage = lazy(() =>
  import("./pages/admin/AdminVendorsPage").then((m) => ({
    default: m.AdminVendorsPage,
  })),
);
const AdminProductsPage = lazy(() =>
  import("./pages/admin/AdminProductsPage").then((m) => ({
    default: m.AdminProductsPage,
  })),
);
const AdminCategoriesPage = lazy(() =>
  import("./pages/admin/AdminCategoriesPage").then((m) => ({
    default: m.AdminCategoriesPage,
  })),
);
const AdminOrdersPage = lazy(() =>
  import("./pages/admin/AdminOrdersPage").then((m) => ({
    default: m.AdminOrdersPage,
  })),
);
const AdminAnalyticsPage = lazy(() =>
  import("./pages/admin/AdminAnalyticsPage").then((m) => ({
    default: m.AdminAnalyticsPage,
  })),
);

const ShopHomePage = lazy(() =>
  import("./pages/storefront/ShopHomePage").then((m) => ({
    default: m.ShopHomePage,
  })),
);
const AddressesPage = lazy(() =>
  import("./pages/storefront/AddressesPage").then((m) => ({
    default: m.AddressesPage,
  })),
);
const SavedItemsPage = lazy(() =>
  import("./pages/storefront/SavedItemsPage").then((m) => ({
    default: m.SavedItemsPage,
  })),
);
const MyReviewsPage = lazy(() =>
  import("./pages/storefront/MyReviewsPage").then((m) => ({
    default: m.MyReviewsPage,
  })),
);
const WorkspaceReviews = lazy(() =>
  import("./components/management/Reviews").then((m) => ({
    default: m.Reviews,
  })),
);
function HomeEntry() {
  const { user } = useAuth();
  return user ? <Navigate to={roleHome(user)} replace /> : <HomePage />;
}
const customerPage = (element) => (
  <ProtectedRoute allowedRoles={["CUSTOMER"]}>{element}</ProtectedRoute>
);
// Common
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
import { ProtectedRoute } from "./components/routing/ProtectedRoute";

export const App = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center text-sm text-slate-500">
          Loading…
        </div>
      }
    >
      <Routes>
        {/* Customer Storefront Routes */}
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<HomeEntry />} />
          <Route path="/shop" element={customerPage(<ShopHomePage />)} />
          <Route path="/saved" element={customerPage(<SavedItemsPage />)} />
          <Route path="/reviews" element={customerPage(<MyReviewsPage />)} />
          <Route path="/addresses" element={customerPage(<AddressesPage />)} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={customerPage(<CartPage />)} />
          <Route path="/checkout" element={customerPage(<CheckoutPage />)} />
          <Route path="/orders" element={customerPage(<OrdersPage />)} />
          <Route
            path="/orders/:id"
            element={customerPage(<OrderDetailPage />)}
          />
          <Route
            path="/profile"
            element={customerPage(<CustomerProfilePage />)}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
          {["/about", "/delivery", "/privacy"].map((path) => (
            <Route key={path} path={path} element={<InfoPage />} />
          ))}
        </Route>

        {/* Vendor Portal Routes (Protected) */}
        <Route
          path="/vendor"
          element={
            <ProtectedRoute allowedRoles={["VENDOR"]}>
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
          <Route path="reviews" element={<WorkspaceReviews role="vendor" />} />
        </Route>

        {/* Admin Dashboard Routes (Protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="vendors" element={<AdminVendorsPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route
            path="products/:id/edit"
            element={<VendorProductFormPage role="admin" />}
          />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="reviews" element={<WorkspaceReviews role="admin" />} />
        </Route>

        {/* 404 Catch-All */}
      </Routes>
    </Suspense>
  );
};

export default App;
