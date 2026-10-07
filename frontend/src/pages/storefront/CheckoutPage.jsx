import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ordersApi } from '../../api/orders';
import { cartApi } from '../../api/cart';
import { Button } from '../../components/common/Button';

export const CheckoutPage = () => {
  const { items, subtotal, total, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const placeOrder = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.info('Sign in to place your order.');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    if (user.role !== 'CUSTOMER') {
      toast.error('Only customer accounts can place orders.');
      return;
    }
    try {
      setIsSubmitting(true);
      await cartApi.syncGuestCart();
      const result = await ordersApi.createOrder();
      if (result.order) {
        await clearCart();
        toast.success('Your order has been placed.');
        navigate(`/orders/${result.order.id}`);
      }
    } catch (error) {
      toast.error(error.message || 'Could not place your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items.length) return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
      <p className="mt-2 text-sm text-slate-600">Add a product before checking out.</p>
      <Link to="/products" className="mt-5 inline-flex font-semibold text-indigo-600">Browse products</Link>
    </section>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold text-indigo-600">Checkout</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Review your order</h1>
        <p className="mt-2 text-sm text-slate-600">Confirm the items and quantities before placing the order.</p>
      </header>

      <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-5">
                <img className="h-16 w-16 rounded-xl bg-slate-100 object-cover" src={item.product?.imageUrl || item.product?.images?.[0]?.url || ''} alt="" />
                <div className="min-w-0 flex-1">
                  <Link to={`/products/${item.product?.id}`} className="font-semibold text-slate-900 hover:text-indigo-600">{item.product?.name}</Link>
                  <p className="mt-1 text-sm text-slate-500">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold text-slate-900">${(Number(item.product?.price || 0) * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-3 border-t border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
            <p>Placing this order reserves available stock and creates an order record. Shipping address and payment processing are not part of the current backend flow.</p>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">Order summary</h2>
          <div className="mt-5 flex justify-between border-t border-slate-100 pt-4 text-sm">
            <span className="text-slate-600">Items subtotal</span>
            <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="mt-4 flex justify-between text-lg font-bold">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
          <Button type="submit" size="lg" variant="primary" rightIcon={ArrowRight} isLoading={isSubmitting} className="mt-6 w-full">
            Place order
          </Button>
          <Link to="/cart" className="mt-4 block text-center text-sm font-medium text-slate-600 hover:text-slate-900">Return to cart</Link>
        </aside>
      </form>
    </div>
  );
};
