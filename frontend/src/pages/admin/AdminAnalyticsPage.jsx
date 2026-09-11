import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Table } from '../../components/common/Table';
import { TrendingUp, DollarSign, Award, Target } from 'lucide-react';

const MONTHLY_ANALYTICS = [
  { month: 'Sep', gmv: 14200, takeRate: 1420, orders: 110 },
  { month: 'Oct', gmv: 18400, takeRate: 1840, orders: 135 },
  { month: 'Nov', gmv: 23600, orders: 180, takeRate: 2360 },
  { month: 'Dec', gmv: 38900, orders: 290, takeRate: 3890 },
  { month: 'Jan', gmv: 31200, orders: 230, takeRate: 3120 },
  { month: 'Feb', gmv: 38450, orders: 285, takeRate: 3845 },
];

const TOP_PRODUCTS = [
  { name: 'Aura Pro Studio Wireless Headphones', units: 48, revenue: 16752.00, vendor: 'Aura Studio Tech', rating: 4.9 },
  { name: 'Nordic Ergonomic Mesh Task Chair', units: 24, revenue: 12480.00, vendor: 'Nordic Craft Co.', rating: 4.7 },
  { name: 'Horizon Ultra-Slim Mechanical Keyboard', units: 58, revenue: 9802.00, vendor: 'Aura Studio Tech', rating: 4.8 },
  { name: 'Chronos Sapphire Hybrid Smartwatch', units: 31, revenue: 8959.00, vendor: 'Aura Studio Tech', rating: 4.9 },
  { name: 'Linear Hi-Fi Desktop Tube DAC/Amp', units: 14, revenue: 5880.00, vendor: 'Aura Studio Tech', rating: 5.0 },
];

const CATEGORY_DATA = [
  { name: 'Electronics & Computing', value: 38, color: '#4f46e5' },
  { name: 'Audio & Acoustics', value: 26, color: '#06b6d4' },
  { name: 'Home & Workspace', value: 16, color: '#10b981' },
  { name: 'Wearables & Watches', value: 12, color: '#f59e0b' },
  { name: 'Fashion & Footwear', value: 8, color: '#8b5cf6' },
];

export const AdminAnalyticsPage = () => {
  const topColumns = [
    {
      header: 'Product Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{row.name}</p>
          <p className="text-[11px] text-slate-400">Sold by {row.vendor}</p>
        </div>
      ),
    },
    {
      header: 'Units Sold',
      accessor: 'units',
      render: (row) => <span className="font-semibold text-xs text-slate-700">{row.units} units</span>,
    },
    {
      header: 'Gross Revenue',
      accessor: 'revenue',
      render: (row) => (
        <span className="font-extrabold text-xs text-slate-900">
          ${row.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Rating',
      accessor: 'rating',
      render: (row) => (
        <span className="font-bold text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          ★ {row.rating}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Executive Platform Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          GMV growth trajectory, multi-vendor commission rake, and top grossing SKUs
        </p>
      </div>

      {/* KPI mini strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle">
          <p className="text-xs text-slate-400 font-semibold uppercase">Platform Take Rate</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">10.0%</h3>
          <p className="text-xs text-emerald-600 font-bold mt-2">+$3,845 in commission</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle">
          <p className="text-xs text-slate-400 font-semibold uppercase">Average Order Value</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">$134.90</h3>
          <p className="text-xs text-emerald-600 font-bold mt-2">+5.8% QoQ</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle">
          <p className="text-xs text-slate-400 font-semibold uppercase">Customer Repeat Rate</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">42.8%</h3>
          <p className="text-xs text-indigo-600 font-bold mt-2">Industry Leading</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle">
          <p className="text-xs text-slate-400 font-semibold uppercase">Return Rate</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">1.2%</h3>
          <p className="text-xs text-emerald-600 font-bold mt-2">Exceptional Quality</p>
        </div>
      </div>

      {/* Primary GMV & Take Rate Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Gross Merchandise Value (GMV) vs Commission Revenue</h3>
            <p className="text-xs text-slate-400">Monthly breakdown of gross volume and marketplace net earnings</p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_ANALYTICS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(val, name) => [`$${Number(val).toLocaleString()}`, name === 'gmv' ? 'Total GMV' : 'Net Commission']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="gmv" name="Gross Merchandise Value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              <Bar dataKey="takeRate" name="Platform Take (10%)" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2-Col: Top Products Table + Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Top-Selling Marketplace SKUs</h3>
              <p className="text-xs text-slate-400">Ranked by gross sales revenue across all merchants</p>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          <Table columns={topColumns} data={TOP_PRODUCTS} />
        </div>

        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <h3 className="text-base font-bold text-slate-900">Category Revenue Share</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CATEGORY_DATA} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, 'Share']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {CATEGORY_DATA.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate max-w-[170px]">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
