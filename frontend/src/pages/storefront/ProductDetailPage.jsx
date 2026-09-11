import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/products';
import { useCart } from '../../context/CartContext';
import { RatingStars } from '../../components/common/RatingStars';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ReviewSection } from '../../components/customer/ReviewSection';
import {
  ShoppingBag,
  Zap,
  Store,
  CheckCircle2,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await productsApi.getProductById(id);
        if (res.product) {
          setProduct(res.product);
          setSelectedImage(res.product.imageUrl || res.product.images?.[0]?.url || '');
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs font-semibold text-slate-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The item you are looking for does not exist or has been retired.</p>
        <Link to="/products" className="mt-4 inline-block text-indigo-600 font-semibold hover:underline text-sm">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0 || product.status === 'OUT_OF_STOCK';
  const allImages = product.images && product.images.length > 0
    ? product.images
    : [{ id: 1, url: product.imageUrl }];

  const handleAddToCart = async () => {
    if (!isOutOfStock) {
      setIsAdding(true);
      await addToCart(product, quantity);
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isOutOfStock) {
      await addToCart(product, quantity);
      navigate('/checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 overflow-x-auto">
        <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/products" className="hover:text-slate-900 transition-colors">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              to={`/products?category=${product.category.slug}`}
              className="hover:text-slate-900 transition-colors capitalize"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Grid: Gallery & Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <img
              src={selectedImage || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {isOutOfStock && (
              <div className="absolute top-4 left-4">
                <Badge status="OUT_OF_STOCK" size="md">Sold Out</Badge>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {allImages.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    selectedImage === img.url
                      ? 'border-indigo-600 ring-2 ring-indigo-100'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Vendor Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Sold by</span>
              <span className="inline-flex items-center gap-1 font-bold text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                <Store className="w-3.5 h-3.5" />
                {product.vendor?.name || 'Verified Vendor'}
              </span>
            </div>

            {isOutOfStock ? (
              <Badge status="OUT_OF_STOCK">Unavailable</Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="WARNING">Only {product.stock} left in stock</Badge>
            ) : (
              <Badge status="ACTIVE" showDot>In Stock ({product.stock} units)</Badge>
            )}
          </div>

          {/* Title & Price */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <RatingStars rating={product.rating || 4.8} size="md" showScore />
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600 font-medium">
                {product.reviewCount || 24} customer reviews
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 font-medium">USD • Import duties included</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            {product.description}
          </p>

          {/* Key Features Bullet Points */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Specifications & Highlights
              </h4>
              <ul className="grid grid-cols-1 gap-2 text-xs text-slate-600">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity Controls & Add to Cart */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Quantity
                </span>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-xs text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="primary"
                size="lg"
                leftIcon={ShoppingBag}
                disabled={isOutOfStock}
                isLoading={isAdding}
                onClick={handleAddToCart}
                className="w-full"
              >
                {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </Button>

              <Button
                variant="outline"
                size="lg"
                leftIcon={Zap}
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="w-full border-slate-300 text-slate-900 hover:bg-slate-50"
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>Complimentary insured shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>30-day effortless returns</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>Authenticity verified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>2-year warranty included</span>
            </div>
          </div>

          {/* Vendor Details Card */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-subtle flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">
                  {product.vendor?.name || 'Verified Merchant Partner'}
                </h4>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                  Tier 1 Seller
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Ships directly from the creator studio with full marketplace escrow and delivery guarantees.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewSection
        productId={product.id}
        averageRating={product.rating || 4.8}
        reviewCount={product.reviewCount || 24}
      />
    </div>
  );
};
