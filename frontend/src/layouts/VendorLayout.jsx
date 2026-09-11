import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { RoleSwitcherBar } from '../components/common/RoleSwitcherBar';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  UserCheck,
} from 'lucide-react';

export const VendorLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Overview', href: '/vendor', icon: LayoutDashboard, end: true },
    { label: 'Products', href: '/vendor/products', icon: Package, end: true },
    { label: 'Add Product', href: '/vendor/products/new', icon: PlusCircle },
    { label: 'Customer Orders', href: '/vendor/orders', icon: ShoppingBag },
    { label: 'Merchant Profile', href: '/vendor/profile', icon: UserCheck },
  ];

  // Derive title from current path
  const getHeaderInfo = () => {
    const path = location.pathname;
    if (path === '/vendor') return { title: 'Vendor Overview', subtitle: 'Live marketplace sales, product performance, and fulfillment' };
    if (path === '/vendor/products') return { title: 'Catalog Management', subtitle: 'Inventory stock, pricing, and product status' };
    if (path === '/vendor/products/new') return { title: 'Publish New Product', subtitle: 'Add a new product listing to the multi-vendor catalog' };
    if (path.includes('/edit')) return { title: 'Update Product', subtitle: 'Modify existing catalog specifications and pricing' };
    if (path === '/vendor/orders') return { title: 'Merchant Orders', subtitle: 'Review and update order fulfillment status' };
    if (path === '/vendor/profile') return { title: 'Merchant Settings', subtitle: 'Store information, bio, and vendor profile' };
    return { title: 'Vendor Portal', subtitle: 'Manage your storefront' };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="min-h-screen bg-slate-100/70 flex">
      <DashboardSidebar
        items={navItems}
        title="Merchant Hub"
        badgeText="Vendor Studio"
        role="VENDOR"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <DashboardHeader title={headerInfo.title} subtitle={headerInfo.subtitle} />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <RoleSwitcherBar />
    </div>
  );
};
