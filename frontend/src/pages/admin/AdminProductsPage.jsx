import React, { useState, useEffect } from 'react';
import { productsApi } from '../../api/products';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';
import { Package, ExternalLink, Trash2 } from 'lucide-react';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();
  const limit = 8;

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await productsApi.getProducts({ limit: 100 });
      if (res.products) setProducts(res.products);
    } catch (err) {
      console.error('Failed to load admin products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await productsApi.deleteProduct(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" archived by administrator.`);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to archive product.');
    } finally {
      setIsDeleting(false);
    }
  };

  let filtered = [...products];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.vendor?.name?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
    );
  }

  const totalPages = Math.ceil(filtered.length / limit) || 1;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const columns = [
    {
      header: 'Product',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'}
            alt=""
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
          />
          <div className="max-w-xs truncate">
            <p className="font-bold text-slate-900 text-xs truncate">{row.name}</p>
            <p className="text-[11px] text-slate-400">ID: #{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Merchant Vendor',
      accessor: 'vendor',
      render: (row) => (
        <span className="text-xs font-semibold text-indigo-600">
          {row.vendor?.name || 'Verified Vendor'}
        </span>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.category?.name || 'General'}
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (row) => (
        <span className="font-bold text-slate-900 text-xs">
          ${Number(row.price).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Inventory',
      accessor: 'stock',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">{row.stock} in stock</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status} showDot size="sm" />,
    },
    {
      header: 'Moderation Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/products/${row.id}`}
            target="_blank"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Inspect on storefront"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Moderate / Archive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Platform Catalog Audit ({products.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Global catalog inventory oversight, vendor attributions, and compliance moderation
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
          placeholder="Filter by product name, vendor, or category..."
        />
      </div>

      <Table
        columns={columns}
        data={paginated}
        isLoading={isLoading}
        emptyMessage="No products match your audit query."
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

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Admin Archive Product"
        message={`Are you sure you want to administratively archive "${deleteTarget?.name}"? It will be immediately suppressed from the public customer catalog.`}
        confirmText="Confirm Archive"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
};
