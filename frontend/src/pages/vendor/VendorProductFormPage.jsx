import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsApi } from '../../api/products';
import { categoriesApi } from '../../api/categories';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ChevronLeft,
  Upload,
  Image as ImageIcon,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const VendorProductFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  // Errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const initForm = async () => {
      try {
        const catRes = await categoriesApi.getCategories();
        if (catRes.categories) {
          setCategories(catRes.categories);
          if (!isEditing && catRes.categories.length > 0) {
            setCategoryId(String(catRes.categories[0].id));
          }
        }

        if (isEditing) {
          const prodRes = await productsApi.getProductById(id);
          if (prodRes.product) {
            const p = prodRes.product;
            setName(p.name || '');
            setDescription(p.description || '');
            setPrice(String(p.price || ''));
            setStock(String(p.stock || ''));
            setCategoryId(String(p.categoryId || (p.category?.id || '')));
            setImageUrl(p.imageUrl || p.images?.[0]?.url || '');
            setStatus(p.status || 'ACTIVE');
          }
        }
      } catch (err) {
        console.error('Failed to initialize product form', err);
        toast.error('Could not load product details.');
      } finally {
        setIsLoading(false);
      }
    };

    initForm();
  }, [id, isEditing]);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Product name is required (min 2 characters).';
    if (!description.trim()) errs.description = 'Product description is required.';
    if (!price || Number(price) <= 0) errs.price = 'Enter a valid positive price.';
    if (stock === '' || Number(stock) < 0) errs.stock = 'Stock must be 0 or higher.';
    if (!categoryId) errs.categoryId = 'Please choose a category.';
    if (!imageUrl.trim()) errs.imageUrl = 'Please provide an image URL for display.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please resolve the form validation errors.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        categoryId: Number(categoryId),
        imageUrl: imageUrl.trim(),
        images: [imageUrl.trim()],
        status,
      };

      if (isEditing) {
        await productsApi.updateProduct(id, payload);
        toast.success(`"${name}" updated successfully!`);
      } else {
        await productsApi.createProduct(payload);
        toast.success(`"${name}" published to catalog!`);
      }
      navigate('/vendor/products');
    } catch (err) {
      toast.error(err.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 font-medium">Loading product specifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/vendor/products"
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isEditing ? `Edit Product: ${name || 'Item'}` : 'Publish New Product'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Provide accurate details, high-res photography, and stock count
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Details */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-subtle space-y-5">
          <Input
            label="Product Title"
            required
            placeholder="e.g. Horizon Ultra-Slim Mechanical Keyboard"
            value={name}
            error={errors.name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Product Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="5"
              required
              placeholder="Detail build materials, technical specifications, dimensions, and included accessories..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full text-sm p-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                errors.description ? 'border-rose-300' : 'border-slate-300 focus:border-indigo-600'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Retail Price ($ USD)"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="149.00"
              value={price}
              error={errors.price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <Input
              label="Stock Inventory Count"
              type="number"
              min="0"
              required
              placeholder="25"
              value={stock}
              error={errors.stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Product Category"
              required
              value={categoryId}
              error={errors.categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categories.map((c) => ({ label: c.name, value: String(c.id) }))}
            />

            <Select
              label="Catalog Visibility Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { label: 'ACTIVE (Live on Storefront)', value: 'ACTIVE' },
                { label: 'DRAFT (Hidden from Storefront)', value: 'DRAFT' },
                { label: 'OUT_OF_STOCK', value: 'OUT_OF_STOCK' },
              ]}
            />
          </div>

          <Input
            label="Primary Product Image URL"
            required
            placeholder="https://images.unsplash.com/photo-..."
            value={imageUrl}
            error={errors.imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            helper="Use high-resolution square or 4:3 product photography (Unsplash or CDN link)"
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/vendor/products')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isSubmitting}
              leftIcon={Save}
            >
              {isEditing ? 'Save Changes' : 'Publish Product'}
            </Button>
          </div>
        </div>

        {/* Right Preview Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Live Card Preview
            </span>

            <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              ) : (
                <div className="text-center p-4 text-slate-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">Image preview will render here</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900 truncate">
                {name || 'Product Title Placeholder'}
              </p>
              <p className="text-sm font-extrabold text-indigo-600 mt-0.5">
                ${price ? Number(price).toFixed(2) : '0.00'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {stock ? `${stock} units available` : 'Stock count unassigned'}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
