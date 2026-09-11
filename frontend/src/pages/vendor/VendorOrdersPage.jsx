import React, { useState, useEffect } from 'react';
import { vendorApi } from '../../api/vendor';
import { ordersApi } from '../../api/orders';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Select } from '../../components/common/Select';
import { SearchBar } from '../../components/common/SearchBar';
import { useToast } from '../../context/ToastContext';
import { ShoppingBag, Calendar, Truck, User } from 'lucide-react';

const ORDER_STATUSES = [
  { label: 'PENDING', value: 'PENDING' },
  { label: 'CONFIRMED', value: 'CONFIRMED' },
  { label: 'SHIPPED', value: 'SHIPPED' },
  { label: 'DELIVERED', value: 'DELIVERED' },
  { label: 'CANCELLED', value: 'CANCELLED' },
];

export const VendorOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const toast = useToast();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await vendorApi.getVendorOrders();
      if (res.orders) setOrders(res.orders);
    } catch (err) {
      console.error('Failed to load vendor orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await ordersApi.updateOrderStatus(orderId, newStatus);
      toast.success(`Order #${orderId} marked as ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  let filtered = [...orders];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        String(o.id).includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerEmail?.toLowerCase().includes(q)
    );
  }

  const columns = [
    {
      header: 'Order ID',
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
          <p className="font-bold text-slate-900">{row.customerName || 'Alex Johnson'}</p>
          <p className="text-[11px] text-slate-400">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      header: 'Item Count',
      accessor: 'items',
      render: (row) => {
        const count = row.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1;
        return (
          <span className="text-xs text-slate-700 font-medium">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        );
      },
    },
    {
      header: 'Total Value',
      accessor: 'totalAmount',
      render: (row) => (
        <span className="font-bold text-slate-900 text-xs">
          ${Number(row.totalAmount).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Order Date',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-xs text-slate-500">
          {new Date(row.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Current Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status} showDot size="sm" />,
    },
    {
      header: 'Fulfillment Action',
      align: 'right',
      render: (row) => (
        <div className="w-36 ml-auto">
          <select
            value={row.status}
            disabled={updatingId === row.id}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            className="w-full text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {ORDER_STATUSES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Order Fulfillment Desk ({filtered.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track customer orders, prepare dispatch packages, and update milestone statuses
          </p>
        </div>
      </div>

      <div className="w-full sm:w-80">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter by Order ID or customer email..."
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyMessage="No customer orders found matching criteria."
      />
    </div>
  );
};
