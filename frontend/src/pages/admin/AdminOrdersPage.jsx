import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { ordersApi } from '../../api/orders';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';
import { ShoppingBag, Calendar, DollarSign, User, Store } from 'lucide-react';

const ORDER_STATUSES = [
  { label: 'PENDING', value: 'PENDING' },
  { label: 'CONFIRMED', value: 'CONFIRMED' },
  { label: 'SHIPPED', value: 'SHIPPED' },
  { label: 'DELIVERED', value: 'DELIVERED' },
  { label: 'CANCELLED', value: 'CANCELLED' },
];

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const toast = useToast();
  const limit = 8;

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getAdminOrders();
      if (res.orders) setOrders(res.orders);
    } catch (err) {
      console.error('Failed to load admin orders', err);
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
      toast.success(`Platform order #${orderId} marked as ${newStatus}`);
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
        o.customerEmail?.toLowerCase().includes(q) ||
        o.items?.some((i) => i.product?.vendorName?.toLowerCase().includes(q))
    );
  }

  const totalPages = Math.ceil(filtered.length / limit) || 1;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

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
      header: 'Participating Vendor',
      render: (row) => {
        const vendorNames = Array.from(
          new Set(row.items?.map((i) => i.product?.vendorName || 'Aura Studio Tech'))
        ).join(', ');
        return (
          <span className="text-xs font-semibold text-indigo-600 truncate max-w-[150px] block">
            {vendorNames || 'Aura Studio Tech'}
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
      header: 'Order Placed',
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
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status} showDot size="sm" />,
    },
    {
      header: 'Superuser Action',
      align: 'right',
      render: (row) => (
        <div className="w-36 ml-auto">
          <select
            value={row.status}
            disabled={updatingId === row.id}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            className="w-full text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
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
            Master Platform Orders ({orders.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Global transaction registry covering all customers, merchant studios, and settlements
          </p>
        </div>
      </div>

      <div className="w-full sm:w-80">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Filter by Order ID, buyer, or vendor..."
        />
      </div>

      <Table
        columns={columns}
        data={paginated}
        isLoading={isLoading}
        emptyMessage="No platform orders match your filter criteria."
      />

      {!isLoading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          limit={limit}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
};
