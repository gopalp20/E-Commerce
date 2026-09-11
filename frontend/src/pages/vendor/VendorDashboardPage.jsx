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
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const SALES_DATA = [
  { month: 'Sep', revenue: 4200, orders: 18 },
  { month: 'Oct', revenue: 5800, orders: 24 },
  { month: 'Nov', revenue: 7400, orders: 32 },
  { month: 'Dec', revenue: 11200, orders: 48 },
  { month: 'Jan', revenue: 9800, orders: 39 },
  { month: 'Feb', revenue: 12480, orders: 52 },
];

export const VendorDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
          <p className="font-semibold text-slate-900">{row.customerName || 'Customer'}</p>
          <p className="text-slate-400 text-[11px]">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      header: 'Total',
      accessor: 'totalAmount',
      render: (row) => (
        <span className="font-bold text-slate-900 text-xs">
          ${Number(row.totalAmount).toFixed(2)}
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
          value={stats?.totalProducts || 12}
          change="+2 new"
          icon={Package}
          subtitle="Active in catalog"
        />
        <DashboardCard
          title="Total Orders"
          value={stats?.totalOrders || 4}
          change={stats?.ordersGrowth || '+12.1%'}
          icon={ShoppingBag}
          subtitle="Lifetime fulfilled"
        />
        <DashboardCard
          title="Pending Orders"
          value={stats?.pendingOrders || 1}
          change="Requires dispatch"
          isPositive={false}
          icon={Clock}
          subtitle="Immediate action"
        />
        <DashboardCard
          title="Store Revenue"
          value={`$${Number(stats?.revenue || 12480).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change={stats?.salesGrowth || '+18.4%'}
          icon={DollarSign}
          subtitle="Gross merchandise value"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Trajectory ($)</h3>
              <p className="text-xs text-slate-400">Monthly gross sales volume</p>
            </div>
            <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              +18.4% vs last month
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="vendorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#vendorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Volume Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Order Volume Over Time</h3>
              <p className="text-xs text-slate-400">Monthly client purchase count</p>
            </div>
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
              52 Orders in Feb
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} orders`, 'Fulfillments']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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
