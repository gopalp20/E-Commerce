import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, Store, Package, FolderTree } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { vendorApi } from '../../api/vendor';
import { DashboardCard } from '../../components/dashboard/DashboardCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminOverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminApi.getAdminStats(), vendorApi.getVendorRequests()])
      .then(([summary, requests]) => {
        setStats(summary.stats || {});
        setPendingCount((requests.requests || []).length);
      })
      .catch((err) => setError(err.message || 'Could not load marketplace summary.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><LoadingSpinner size="lg" /></div>;
  if (error) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>;

  const metrics = [
    ['Recorded order revenue', `$${Number(stats.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, DollarSign],
    ['Orders', stats.totalOrders ?? 0, ShoppingBag],
    ['Users', stats.totalUsers ?? 0, Users],
    ['Vendors', stats.totalVendors ?? 0, Store],
    ['Products', stats.totalProducts ?? 0, Package],
    ['Categories', stats.totalCategories ?? 0, FolderTree],
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Marketplace overview</h2>
        <p className="mt-1 text-sm text-slate-600">Current totals from the marketplace database.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([title, value, icon]) => <DashboardCard key={title} title={title} value={value} icon={icon} />)}
      </div>
      <section className="grid gap-4 sm:grid-cols-2">
        <Link to="/admin/vendors" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-300">
          <p className="text-sm font-semibold text-indigo-600">Vendor applications</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{pendingCount} pending</p>
          <p className="mt-1 text-sm text-slate-600">Review and approve vendor requests.</p>
        </Link>
        <Link to="/admin/orders" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-300">
          <p className="text-sm font-semibold text-indigo-600">Order management</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalOrders ?? 0} orders</p>
          <p className="mt-1 text-sm text-slate-600">Review marketplace orders and update their status.</p>
        </Link>
      </section>
    </div>
  );
};
