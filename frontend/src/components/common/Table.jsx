import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No records found',
  className = '',
}) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-subtle ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3.5 px-4 font-semibold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <LoadingSpinner size="lg" className="text-indigo-600" />
                  <p className="text-xs text-slate-500 font-medium">Loading records...</p>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                <p className="text-sm font-medium">{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className="hover:bg-slate-50/80 transition-colors duration-100"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
