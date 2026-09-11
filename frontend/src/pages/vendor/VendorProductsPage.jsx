import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../../api/products';
import { categoriesApi } from '../../api/categories';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Select } from '../../components/common/Select';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { PlusCircle, Edit3, Trash2, ExternalLink, Package } from 'lucide-react';

export const VendorProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();
  const limit = 8;

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productsApi.getMyProducts(),
        categoriesApi.getCategories(),
      ]);

      if (prodRes.products) setProducts(prodRes.products);
      if (catRes.categories) setCategories(catRes.categories);
    } catch (err) {
      console.error('Failed to load vendor products', err);
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
      toast.success(`"${deleteTarget.name}" has been removed from catalog.`);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side filtering & pagination
  let filtered = [...products];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }
  if (selectedCategory) {
    filtered = filtered.filter(
      (p) => p.category?.slug === selectedCategory || String(p.categoryId) === String(selectedCategory)
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
          <div className="min-w-0 max-w-xs">
            <p className="font-bold text-slate-900 text-xs truncate">{row.name}</p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{row.description}</p>
          </div>
        </div>
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
      header: 'Unit Price',
      accessor: 'price',
      render: (row) => (
        <span className="font-bold text-slate-900 text-xs">
          ${Number(row.price).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Stock Inventory',
      accessor: 'stock',
      render: (row) => (
        <span
          className={`text-xs font-semibold ${
            row.stock === 0
              ? 'text-rose-600'
              : row.stock <= 5
              ? 'text-amber-600'
              : 'text-slate-700'
          }`}
        >
          {row.stock} units
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status} showDot size="sm" />,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/products/${row.id}`}
            target="_blank"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="View live product"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <Link
            to={`/vendor/products/${row.id}/edit`}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit product specs"
          >
            <Edit3 className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Archive/Delete"
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
            Catalog Products ({filtered.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your store items, pricing, inventory levels, and visibility
          </p>
        </div>
        <Link
          to="/vendor/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Product</span>
        </Link>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-80">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search your inventory by name or keyword..."
          />
        </div>

        <div className="w-full sm:w-56 sm:ml-auto">
          <Select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            options={[
              { label: 'All Categories', value: '' },
              ...categories.map((c) => ({ label: c.name, value: c.slug })),
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={paginated}
        isLoading={isLoading}
        emptyMessage="No products match your inventory criteria."
      />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          limit={limit}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Archive Product"
        message={`Are you sure you want to remove "${deleteTarget?.name}" from your active listings? This will immediately remove it from the customer storefront.`}
        confirmText="Archive Product"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
};
