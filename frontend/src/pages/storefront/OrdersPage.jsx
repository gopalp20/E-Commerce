import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Package,
  Calendar,
  DollarSign,
  ChevronRight,
  Truck,
  ShoppingBag,
} from 'lucide-react';

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await ordersApi.getMyOrders();
        if (res.orders) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = activeTab === 'ALL'
    ? orders
    : orders.filter((o) => o.status === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Purchases & Orders
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor shipment milestones, delivery statuses, and invoices
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 mb-6">
        {STATUS_TABS.map((tab) => {
          const count = tab === 'ALL'
            ? orders.length
            : orders.filter((o) => o.status === tab).length;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab === 'ALL' ? 'All Orders' : tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-500">Retrieving order history...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description={
            activeTab === 'ALL'
              ? 'You have not placed any orders yet on MarketPulse.'
              : `You have no orders currently in "${activeTab}" status.`
          }
          actionText="Browse Marketplace"
          onAction={() => window.location.href = '/products'}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const itemCount = order.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 1;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle hover:border-slate-300 transition-all p-5 sm:p-6"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-extrabold text-sm text-slate-900">
                      Order #{order.id}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge status={order.status} showDot />
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-x-auto max-w-2xl py-1">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 min-w-max">
                        <img
                          src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-slate-100"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-slate-900 max-w-[180px] truncate">
                            {item.product?.name}
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Qty: {item.quantity} • ${Number(item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="sm:text-right flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto flex sm:flex-col justify-between items-baseline sm:items-end">
                    <span className="text-xs text-slate-500 block">Total Amount</span>
                    <span className="text-lg font-black text-slate-900">
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Tracking teaser */}
                {order.trackingNumber && order.trackingNumber !== 'PENDING' && (
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                    <Truck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Tracking: <strong className="text-slate-900">{order.trackingNumber}</strong> ({order.carrier || 'Carrier'})</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
