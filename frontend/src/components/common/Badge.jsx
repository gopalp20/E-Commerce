import React from 'react';

const BADGE_STYLES = {
  // Order Statuses
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200/80',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200/80',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200/80',

  // Product Statuses
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  OUT_OF_STOCK: 'bg-rose-50 text-rose-700 border-rose-200/80',
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
  ARCHIVED: 'bg-slate-100 text-slate-500 border-slate-200',

  // Roles
  CUSTOMER: 'bg-slate-100 text-slate-700 border-slate-200',
  VENDOR: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  ADMIN: 'bg-purple-50 text-purple-700 border-purple-200/80',

  // Generic
  SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  INFO: 'bg-sky-50 text-sky-700 border-sky-200/80',
  WARNING: 'bg-amber-50 text-amber-700 border-amber-200/80',
  DANGER: 'bg-rose-50 text-rose-700 border-rose-200/80',
  NEUTRAL: 'bg-slate-100 text-slate-700 border-slate-200',
};

const DOT_STYLES = {
  PENDING: 'bg-amber-500',
  CONFIRMED: 'bg-blue-500',
  SHIPPED: 'bg-indigo-500',
  DELIVERED: 'bg-emerald-500',
  CANCELLED: 'bg-rose-500',
  ACTIVE: 'bg-emerald-500',
  OUT_OF_STOCK: 'bg-rose-500',
  DRAFT: 'bg-slate-400',
  ARCHIVED: 'bg-slate-400',
  CUSTOMER: 'bg-slate-400',
  VENDOR: 'bg-indigo-500',
  ADMIN: 'bg-purple-500',
};

export const Badge = ({
  status,
  children,
  variant,
  showDot = false,
  className = '',
  size = 'md',
}) => {
  const key = (variant || status || 'NEUTRAL').toUpperCase();
  const style = BADGE_STYLES[key] || BADGE_STYLES.NEUTRAL;
  const dot = DOT_STYLES[key] || 'bg-slate-400';

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClass} ${style} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {children || status}
    </span>
  );
};
