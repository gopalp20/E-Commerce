import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import { OrderStatusTimeline } from '../../components/customer/OrderStatusTimeline';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import {
  ChevronLeft,
  Calendar,
  Truck,
  CreditCard,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const toast = useToast();

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const res = await ordersApi.getOrderById(id);
      if (res.order) {
        setOrder(res.order);
      }
    } catch (err) {
      console.error('Failed to load order', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      setIsCancelling(true);
      await ordersApi.updateOrderStatus(id, 'CANCELLED');
      toast.success('Order has been cancelled.');
      setCancelModalOpen(false);
      fetchOrder();
    } catch (err) {
      toast.error('Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500">Retrieving order shipment information...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">Order #{id} does not exist in your account.</p>
        <Link to="/orders" className="mt-4 inline-block text-xs font-bold text-indigo-600">
          Back to All Orders
        </Link>
      </div>
    );
  }

  const isPending = order.status === 'PENDING';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top back navigation & Header */}
      <div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" /> Back to My Orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Order #{order.id}
              </h1>
              <Badge status={order.status} showDot size="md" />
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {isPending && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setCancelModalOpen(true)}
              >
                Cancel Order
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              leftIcon={FileText}
              onClick={() => window.print()}
            >
              Print Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Visual Timeline */}
      <OrderStatusTimeline
        status={order.status}
        deliveredAt={order.deliveredAt}
        createdAt={order.createdAt}
      />

      {/* Tracking info callout */}
      {order.trackingNumber && order.trackingNumber !== 'PENDING' && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between gap-4 text-xs text-indigo-950">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Carrier Tracking: {order.trackingNumber}</p>
              <p className="text-slate-500 text-[11px]">Dispatched via {order.carrier || 'FedEx Express'} - Real-time transit updates</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
            Active Shipment
          </span>
        </div>
      )}

      {/* 2-Column Details: Products + Shipping/Payment Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Purchased Products List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Purchased Items ({order.items?.length || 0})
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                <img
                  src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                    {item.product?.vendorName || 'Verified Merchant'}
                  </span>
                  <Link
                    to={`/products/${item.productId}`}
                    className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors block truncate"
                  >
                    {item.product?.name}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sm text-slate-900">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing summary */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Total</span>
              <span className="font-semibold text-slate-900">
                ${Number(order.totalAmount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Express Delivery</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Grand Total</span>
              <span className="text-xl font-black text-slate-900">
                ${Number(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-5 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Shipping Destination</span>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900 text-sm">
                {order.shippingAddress?.fullName || 'Alex Johnson'}
              </p>
              <p>{order.shippingAddress?.street || '742 Evergreen Terrace'}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                {order.shippingAddress?.postalCode}
              </p>
              <p>{order.shippingAddress?.country || 'United States'}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-5 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Payment Details</span>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">
                {order.paymentMethod || 'Credit Card'}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Escrow Protected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? It is currently pending merchant dispatch."
        confirmText="Confirm Cancellation"
        isDanger
        isLoading={isCancelling}
      />
    </div>
  );
};
