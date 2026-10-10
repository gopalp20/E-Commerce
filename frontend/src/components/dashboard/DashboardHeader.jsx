import React, { startTransition } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ExternalLink, LogOut } from "lucide-react";

export const DashboardHeader = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Quick link to main storefront */}
        <Link
          to="/products"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
        >
          <span>Live Store</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        {/* User profile tag */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="flex flex-col items-end text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {user?.name}
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              {user?.role}
            </span>
          </div>

          <span className="account-avatar" aria-hidden="true">
            {user?.name?.[0]}
          </span>
          <button
            className="icon-button"
            title="Sign out"
            aria-label="Sign out"
            onClick={() =>
              startTransition(() => {
                logout();
                navigate("/login", { replace: true });
              })
            }
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
