import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export const CartPage = () => {
  const { items, subtotal, shipping, tax, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your shopping bag is empty"
          description="Explore our curated catalog of precision audio, peripherals, and technical apparel to find something extraordinary."
          actionText="Explore Marketplace Catalog"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  const freeShippingThreshold = 150;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Bag
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review items from independent creator studios before checkout
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-800 font-semibold transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Progress Indicator */}
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900">
            <div className="flex items-center justify-between font-semibold mb-2">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-600" />
                {remainingForFreeShipping > 0
                  ? `Add $${remainingForFreeShipping.toFixed(2)} more to unlock Free Express Shipping!`
                  : '🎉 You have unlocked Free Insured Express Shipping!'}
              </span>
              <span className="text-[11px] font-bold">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="h-1.5 w-full bg-indigo-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle divide-y divide-slate-100 overflow-hidden">
            {items.map((item) => {
              const product = item.product || {};
              const unitPrice = Number(product.price) || 0;
              const lineTotal = unitPrice * item.quantity;

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/products/${product.id}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0"
                  >
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Title & Vendor */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                      {product.vendor?.name || 'Verified Vendor'}
                    </span>
                    <Link
                      to={`/products/${product.id}`}
                      className="block font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors mt-0.5 truncate"
                    >
                      {product.name}
                    </Link>
                    <span className="text-xs text-slate-500 block mt-1">
                      ${unitPrice.toFixed(2)} each
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-xs text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-900"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="w-20 text-right">
                      <span className="font-extrabold text-sm text-slate-900">
                        ${lineTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              ← Continue browsing products
            </Link>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-5 sticky top-24">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Shipping</span>
              <span className="font-bold text-slate-900">
                {shipping === 0 ? (
                  <span className="text-emerald-600 uppercase font-extrabold">Free</span>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Sales Tax (8%)</span>
              <span className="font-bold text-slate-900">${tax.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Grand Total</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            size="lg"
            variant="primary"
            rightIcon={ArrowRight}
            onClick={() => navigate('/checkout')}
            className="w-full"
          >
            Proceed to Checkout
          </Button>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>256-Bit SSL Encrypted & Escrow Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
