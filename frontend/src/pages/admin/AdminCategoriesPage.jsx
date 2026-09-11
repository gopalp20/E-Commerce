import React, { useState, useEffect } from 'react';
import { categoriesApi } from '../../api/categories';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { FolderTree, PlusCircle, Edit3, Trash2, Layers } from 'lucide-react';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await categoriesApi.getCategories();
      if (res.categories) setCategories(res.categories);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setModalOpen(true);
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error('Category name and slug are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await categoriesApi.updateCategory(editingCategory.id, { name: name.trim(), slug: slug.trim() });
        toast.success(`Category "${name}" updated successfully.`);
      } else {
        await categoriesApi.createCategory({ name: name.trim(), slug: slug.trim() });
        toast.success(`Category "${name}" created.`);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await categoriesApi.deleteCategory(deleteTarget.id);
      toast.success(`Category "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Category Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-xs">{row.name}</p>
            <p className="text-[11px] text-slate-400">Slug: {row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Department Slug',
      accessor: 'slug',
      render: (row) => (
        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
          /products?category={row.slug}
        </span>
      ),
    },
    {
      header: 'Catalog Count',
      accessor: 'count',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.count || 12} products
        </span>
      ),
    },
    {
      header: 'Taxonomy Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit Category"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Category"
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
            Marketplace Category Taxonomy ({categories.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Organize catalog departments, search tags, and storefront navigation hierarchies
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={PlusCircle}
          onClick={handleOpenCreate}
        >
          Create Category
        </Button>
      </div>

      <Table
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyMessage="No categories found."
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        description="Categories organize multi-vendor product listings and drive storefront filters."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            required
            placeholder="e.g. Acoustic & Sound Systems"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />

          <Input
            label="URL Slug"
            required
            placeholder="e.g. acoustic-sound-systems"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            helper="Use lowercase letters, numbers, and dashes only"
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Any products assigned to this category will be unassigned.`}
        confirmText="Confirm Delete"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
};
