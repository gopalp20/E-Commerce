import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type, message, title = '') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const toast = {
    success: (msg, title = 'Success') => showToast('success', msg, title),
    error: (msg, title = 'Error') => showToast('error', msg, title),
    info: (msg, title = 'Info') => showToast('info', msg, title),
    warning: (msg, title = 'Warning') => showToast('warning', msg, title),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300 transform translate-y-0 ${
              t.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-950'
                : t.type === 'error'
                ? 'bg-rose-50/95 border-rose-200 text-rose-950'
                : t.type === 'warning'
                ? 'bg-amber-50/95 border-amber-200 text-amber-950'
                : 'bg-indigo-50/95 border-indigo-200 text-indigo-950'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-indigo-600" />}
            </div>
            <div className="flex-1 min-w-0 text-sm">
              {t.title && <p className="font-semibold">{t.title}</p>}
              <p className="text-xs text-slate-600 mt-0.5">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 -mt-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
