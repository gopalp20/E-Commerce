import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getAdminStats()
      .then((result) => setStats(result.stats || {}))
      .catch((err) => setError(err.message || 'Could not load marketplace metrics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><LoadingSpinner size="lg" /></div>;
  if (error) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>;

  const metrics = [
    ['Order revenue', `$${Number(stats.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
    ['Orders', stats.totalOrders ?? 0],
    ['Registered users', stats.totalUsers ?? 0],
    ['Vendors', stats.totalVendors ?? 0],
    ['Active catalog products', stats.totalProducts ?? 0],
    ['Categories', stats.totalCategories ?? 0],
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Marketplace metrics</h2>
        <p className="mt-1 text-sm text-slate-600">Aggregate counts and revenue currently available from the backend.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        The current backend does not expose sales history, category revenue, product rankings, commissions, or customer retention data.
        <Link to="/admin/orders" className="ml-1 font-semibold text-indigo-600 hover:text-indigo-800">Review order records</Link>.
      </div>
    </div>
  );
};
