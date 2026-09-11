import React from 'react';
import { Clock, CheckCircle2, Truck, PackageCheck, XCircle } from 'lucide-react';

const STEPS = [
  { status: 'PENDING', label: 'Order Placed', desc: 'Received & awaiting merchant confirmation', icon: Clock },
  { status: 'CONFIRMED', label: 'Confirmed', desc: 'Merchant prepared parcel for carrier dispatch', icon: CheckCircle2 },
  { status: 'SHIPPED', label: 'In Transit', desc: 'Carrier moving shipment to regional center', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', desc: 'Package signed and delivered to destination', icon: PackageCheck },
];

export const OrderStatusTimeline = ({ status = 'PENDING', deliveredAt, createdAt }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-6 text-rose-900 flex items-start gap-3.5">
        <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Order Cancelled</h4>
          <p className="text-xs text-rose-700 mt-1">
            This order has been cancelled. Any pre-authorized payment has been refunded to your original payment method.
          </p>
        </div>
      </div>
    );
  }

  const statusIndexMap = {
    PENDING: 0,
    CONFIRMED: 1,
    SHIPPED: 2,
    DELIVERED: 3,
  };

  const currentIndex = statusIndexMap[status] ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
        Fulfillment Timeline
      </h4>

      <div className="relative">
        {/* Progress Bar Line */}
        <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-slate-100 rounded-full z-0">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-2 relative z-10">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.status} className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-3 sm:gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 flex-shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md ring-4 ring-indigo-50'
                      : isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-indigo-600'
                        : isCompleted
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-[150px] mx-auto mt-0.5 hidden sm:block">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
