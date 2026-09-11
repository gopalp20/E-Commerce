import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Store, Shield, ArrowLeft } from 'lucide-react';

export const DashboardSidebar = ({
  items = [],
  title = 'Portal',
  badgeText = 'Dashboard',
  isCollapsed = false,
  onToggleCollapse,
  role = 'VENDOR',
}) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 bg-slate-900 text-slate-300 transition-all duration-200 flex flex-col border-r border-slate-800 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0 ${
              role === 'ADMIN' ? 'bg-purple-600' : 'bg-indigo-600'
            }`}>
              {role === 'ADMIN' ? <Shield className="w-4 h-4" /> : <Store className="w-4 h-4" />}
            </div>
            <div className="truncate">
              <h2 className="font-extrabold text-sm text-white tracking-tight leading-none">{title}</h2>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                {badgeText}
              </span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm ${
              role === 'ADMIN' ? 'bg-purple-600' : 'bg-indigo-600'
            }`}>
              {role === 'ADMIN' ? 'A' : 'V'}
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end !== undefined ? item.end : item.href.split('/').length <= 2}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? role === 'ADMIN'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                } ${isCollapsed ? 'justify-center px-2' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-indigo-300 font-bold border border-slate-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Return Link */}
      <div className="p-3 border-t border-slate-800">
        <Link
          to="/"
          className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
          title="Return to Customer Storefront"
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Storefront</span>}
        </Link>
      </div>
    </aside>
  );
};
