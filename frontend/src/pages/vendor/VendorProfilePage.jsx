import React from 'react';
import { Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const VendorProfilePage = () => {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Vendor account</h2>
        <p className="mt-1 text-sm text-slate-600">Account details associated with your marketplace login.</p>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Store className="h-5 w-5" /></span>
          <div><h3 className="font-semibold text-slate-900">{user?.name}</h3><p className="text-sm text-slate-500">Vendor account · ID {user?.id}</p></div>
        </div>
        <dl className="grid gap-5 pt-5 sm:grid-cols-2">
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</dt><dd className="mt-1 text-sm text-slate-900">{user?.name}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt><dd className="mt-1 text-sm text-slate-900">{user?.email}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</dt><dd className="mt-1 text-sm text-slate-900">{user?.role}</dd></div>
        </dl>
      </section>
      <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">The backend does not currently support store profiles, payout settings, or vendor biographies. Manage your product listings and order fulfillment from the vendor dashboard.</p>
    </div>
  );
};
