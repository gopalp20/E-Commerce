import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const DashboardCard = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  subtitle,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(change || subtitle) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-0.5 font-bold ${
                isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-500 font-medium truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
