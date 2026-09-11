import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Store, User, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const RoleSwitcherBar = () => {
  const { user, switchRole } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentRole = user?.role || 'CUSTOMER';

  const handleSwitch = (role, path) => {
    switchRole(role);
    if (path && !location.pathname.startsWith(path)) {
      navigate(path);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/60 p-2 text-xs transition-all duration-200">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Demo Role:</span>
            <span className="font-bold text-white uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
              {currentRole}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Toggle role switcher"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-slate-800 flex flex-col gap-1 w-52">
            <p className="text-[10px] uppercase font-semibold text-slate-400 px-2 tracking-wider">
              Switch Persona & Route:
            </p>

            <button
              onClick={() => handleSwitch('CUSTOMER', '/')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                currentRole === 'CUSTOMER'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 flex-shrink-0" />
              <div className="truncate">
                <p className="text-xs font-semibold leading-tight">Customer</p>
                <p className="text-[10px] text-slate-300/80">Storefront & Bag</p>
              </div>
            </button>

            <button
              onClick={() => handleSwitch('VENDOR', '/vendor')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                currentRole === 'VENDOR'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5 flex-shrink-0" />
              <div className="truncate">
                <p className="text-xs font-semibold leading-tight">Vendor Merchant</p>
                <p className="text-[10px] text-slate-300/80">Aura Studio Tech</p>
              </div>
            </button>

            <button
              onClick={() => handleSwitch('ADMIN', '/admin')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                currentRole === 'ADMIN'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              <div className="truncate">
                <p className="text-xs font-semibold leading-tight">Platform Admin</p>
                <p className="text-[10px] text-slate-300/80">Oversight & Approvals</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
