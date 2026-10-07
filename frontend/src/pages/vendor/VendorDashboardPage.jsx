import React, { useState, useEffect } from 'react';
import { vendorApi } from '../../api/vendor';
import { DashboardCard } from '../../components/dashboard/DashboardCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
} from 'lucide-react';

export const VendorDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const [statsRes, ordersRes] = await Promise.all([
          vendorApi.getVendorStats(),
          vendorApi.getVendorOrders(),
        ]);
        if (statsRes.stats) setStats(statsRes.stats);
        if (ordersRes.orders) setRecentOrders(ordersRes.orders.slice(0, 5));
      } catch (err) {
        console.error('Failed to load vendor dashboard', err);
        setLoadError(err.message || 'Could not load vendor dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 font-medium">Loading merchant analytics...</p>
      </div>
    );
  }

  if (loadError) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{loadError}</div>;

  const orderColumns = [
    {
      header: 'Order',
      accessor: 'id',
      render: (row) => (
        <span className="font-extrabold text-slate-900 text-xs">#{row.id}</span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-900">{row.user?.name || row.customerName || 'Customer'}</p>
          <p className="text-slate-400 text-[11px]">{row.user?.email || row.customerEmail || ''}</p>
        </div>
      ),
    },
    {
      header: 'Total',
      accessor: 'totalAmount',
      render: (row) => (
        <span className="font-bold text-slate-900 text-xs">
          ${Number((row.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0)).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status} showDot size="sm" />,
    },
    {
      header: 'Action',
      render: (row) => (
        <Link
          to="/vendor/orders"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          Manage
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Store Performance Overview
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time metrics, order trajectory, and merchant balance
          </p>
        </div>
        <Link
          to="/vendor/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard
          title="Total Products"
          value={stats?.totalProducts ?? 0}
          change=""
          icon={Package}
          subtitle="Active in catalog"
        />
        <DashboardCard
          title="Total Orders"
          value={stats?.totalOrders ?? 0}
          change=""
          icon={ShoppingBag}
          subtitle="Lifetime fulfilled"
        />
        <DashboardCard
          title="Pending Orders"
          value={stats?.pendingOrders ?? 0}
          change=""
          isPositive={false}
          icon={Clock}
          subtitle="Immediate action"
        />
        <DashboardCard
          title="Store Revenue"
          value={`$${Number(stats?.revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change=""
          icon={DollarSign}
          subtitle="Gross merchandise value"
        />
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Customer Inquiries & Orders</h3>
            <p className="text-xs text-slate-500">Orders placed for items in your store</p>
          </div>
          <Link
            to="/vendor/orders"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View All Orders →
          </Link>
        </div>

        <Table
          columns={orderColumns}
          data={recentOrders}
          emptyMessage="No recent customer orders received yet."
        />
      </div>
    </div>
  );
};
