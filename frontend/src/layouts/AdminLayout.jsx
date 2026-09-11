import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { RoleSwitcherBar } from '../components/common/RoleSwitcherBar';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  FolderTree,
  ShoppingBag,
  BarChart3,
} from 'lucide-react';

export const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Vendor Approvals', href: '/admin/vendors', icon: Store, badge: '1' },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  const getHeaderInfo = () => {
    const path = location.pathname;
    if (path === '/admin') return { title: 'Platform Oversight', subtitle: 'Platform-wide revenue, active users, and vendor growth' };
    if (path === '/admin/users') return { title: 'User Management', subtitle: 'Manage registered accounts, roles, and status' };
    if (path === '/admin/vendors') return { title: 'Vendor Applications', subtitle: 'Review and approve pending seller applications' };
    if (path === '/admin/products') return { title: 'Platform Products', subtitle: 'Audit and moderate multi-vendor product listings' };
    if (path === '/admin/categories') return { title: 'Category Management', subtitle: 'Create, update, and manage product taxonomy' };
    if (path === '/admin/orders') return { title: 'Master Order Book', subtitle: 'Platform-wide order records and fulfillment health' };
    if (path === '/admin/analytics') return { title: 'Platform Analytics', subtitle: 'Deep dive into GMV, categories, and top-performing merchants' };
    return { title: 'Admin Console', subtitle: 'Platform administration' };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="min-h-screen bg-slate-100/70 flex">
      <DashboardSidebar
        items={navItems}
        title="Admin Console"
        badgeText="Superuser"
        role="ADMIN"
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
