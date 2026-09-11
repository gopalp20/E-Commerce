import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { DashboardCard } from '../../components/dashboard/DashboardCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  Package,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const REVENUE_TREND = [
  { month: 'Sep', revenue: 14200, orders: 110 },
  { month: 'Oct', revenue: 18400, orders: 135 },
  { month: 'Nov', revenue: 23600, orders: 180 },
  { month: 'Dec', revenue: 38900, orders: 290 },
  { month: 'Jan', revenue: 31200, orders: 230 },
  { month: 'Feb', revenue: 38450, orders: 285 },
];

const CATEGORY_DISTRIBUTION = [
  { name: 'Electronics', value: 38, color: '#4f46e5' },
  { name: 'Audio', value: 24, color: '#06b6d4' },
  { name: 'Workspace', value: 18, color: '#10b981' },
  { name: 'Fashion', value: 12, color: '#f59e0b' },
  { name: 'Footwear', value: 8, color: '#8b5cf6' },
];

export const AdminOverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setIsLoading(true);
        const res = await adminApi.getAdminStats();
        if (res.stats) setStats(res.stats);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 font-medium">Aggregating platform metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        <DashboardCard
          title="Total Platform GMV"
          value={`$${Number(stats?.totalRevenue || 38450).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change={stats?.revenueGrowth || '+24.5%'}
          icon={DollarSign}
        />
        <DashboardCard
          title="Master Orders"
          value={stats?.totalOrders || 132}
          change={stats?.ordersGrowth || '+16.2%'}
          icon={ShoppingBag}
        />
        <DashboardCard
          title="Registered Users"
          value={stats?.totalUsers || 425}
          change={stats?.usersGrowth || '+31.8%'}
          icon={Users}
        />
        <DashboardCard
          title="Active Vendors"
          value={stats?.totalVendors || 20}
          change={stats?.vendorsGrowth || '+8.3%'}
          icon={Store}
        />
        <DashboardCard
          title="Catalog Products"
          value={stats?.totalProducts || 96}
          change="+12 this wk"
          icon={Package}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Platform GMV & Sales Velocity</h3>
              <p className="text-xs text-slate-400">Total gross transaction volume across all vendors</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Record Q1 Performance
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Gross Volume']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fillOpacity={1} fill="url(#adminRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Sales by Category</h3>
            <p className="text-xs text-slate-400">Marketplace GMV distribution</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DISTRIBUTION}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {CATEGORY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Share']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {CATEGORY_DISTRIBUTION.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-slate-600 truncate">{c.name}</span>
                <span className="font-bold text-slate-900 ml-auto">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          to="/admin/vendors"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-card-hover transition-all p-5 shadow-subtle group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Pending Approvals
            </span>
            <span className="w-6 h-6 rounded-full bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center">
              1
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-900 mt-2 group-hover:text-purple-600 transition-colors">
            Vendor Applications →
          </h4>
          <p className="text-xs text-slate-500 mt-1">Review applicant eligibility and approve seller credentials</p>
        </Link>

        <Link
          to="/admin/categories"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-card-hover transition-all p-5 shadow-subtle group"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Platform Taxonomy
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors">
            Category Management →
          </h4>
          <p className="text-xs text-slate-500 mt-1">Create, edit, or reorganize marketplace departments</p>
        </Link>

        <Link
          to="/admin/orders"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-card-hover transition-all p-5 shadow-subtle group"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Transaction Oversight
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-2 group-hover:text-emerald-600 transition-colors">
            Master Orders Book →
          </h4>
          <p className="text-xs text-slate-500 mt-1">Inspect all order fulfillments across vendors</p>
        </Link>
      </div>
    </div>
  );
};
