import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helper,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      id,
      className = '',
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <LeftIcon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-lg border text-sm transition-colors duration-150 py-2.5 px-3 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
              LeftIcon ? 'pl-9' : ''
            } ${RightIcon ? 'pr-9' : ''} ${
              error
                ? 'border-rose-300 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-slate-300 hover:border-slate-400'
            } ${className}`}
            {...props}
          />
          {RightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <RightIcon className="w-4 h-4" />
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-rose-600">{error}</p>
        ) : helper ? (
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
