import React from 'react';
import { Link } from 'react-router-dom';
import { RatingStars } from '../common/RatingStars';
import { Badge } from '../common/Badge';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Check } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const { addToCart, items } = useCart();
  const isOutOfStock = product.stock <= 0 || product.status === 'OUT_OF_STOCK';
  const isInCart = items.some((i) => i.productId === product.id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:shadow-card-hover hover:border-slate-300/80 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Product Image Area */}
      <Link
        to={`/products/${product.id}`}
        className="relative block aspect-square w-full overflow-hidden bg-slate-100"
      >
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {isOutOfStock ? (
            <Badge status="OUT_OF_STOCK" size="sm">Sold Out</Badge>
          ) : product.stock <= 5 ? (
            <Badge variant="WARNING" size="sm">Only {product.stock} left</Badge>
          ) : product.isBestSeller ? (
            <Badge variant="INFO" size="sm">Best Seller</Badge>
          ) : null}
        </div>

        {/* Category Pill Tag */}
        {product.category && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-slate-700 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border border-slate-200/80 shadow-xs">
            {product.category.name}
          </div>
        )}
      </Link>

      {/* Content Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Vendor Attribution */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium text-indigo-600 truncate max-w-[140px]">
              {product.vendor?.name || 'Verified Vendor'}
            </span>
            <span className="text-[11px] text-slate-400">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Title */}
          <Link
            to={`/products/${product.id}`}
            className="block font-semibold text-sm text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors leading-snug"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1.5">
            <RatingStars
              rating={product.rating || 4.8}
              size="sm"
              showScore
              reviewCount={product.reviewCount || 12}
            />
          </div>
        </div>

        {/* Price & Quick Add Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block -mb-0.5">
              Price
            </span>
            <span className="text-base font-extrabold text-slate-900 tracking-tight">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`p-2 rounded-xl border transition-all duration-150 flex items-center justify-center cursor-pointer ${
              isInCart
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                : isOutOfStock
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
            }`}
            title={isInCart ? 'In your cart' : 'Add to cart'}
          >
            {isInCart ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
