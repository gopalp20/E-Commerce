import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { vendorApi } from '../../api/vendor';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import {
  User,
  Mail,
  Shield,
  Store,
  CheckCircle2,
  Clock,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const CustomerProfilePage = () => {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [hasApplied, setHasApplied] = useState(user?.vendorRequest || false);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyVendor = async () => {
    try {
      setIsApplying(true);
      await vendorApi.applyVendor();
      setHasApplied(true);
      toast.success('Your vendor application has been submitted to platform admins for review!');
    } catch (err) {
      toast.error('Failed to submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Profile & Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal information, security preferences, and marketplace privileges
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-6 sm:p-8 space-y-6">
        {/* User Avatar + Role Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
            />
            <div>
              <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge status={user?.role || 'CUSTOMER'} showDot />
                <span className="text-[11px] text-slate-400">
                  Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" leftIcon={LogOut} onClick={logout}>
            Sign Out
          </Button>
        </div>

        {/* Account Details Form */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Profile Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={user?.name || ''} readOnly />
            <Input label="Email Address" value={user?.email || ''} readOnly />
            <Input label="Account Role" value={user?.role || 'CUSTOMER'} readOnly />
            <Input label="Security Clearance" value="Standard 2FA Enabled" readOnly />
          </div>
        </div>

        {/* Vendor Application Box (if Customer) */}
        {user?.role === 'CUSTOMER' && (
          <div className="mt-8 p-6 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">
                  Interested in Selling on MarketPulse?
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Upgrade your customer account to a Verified Vendor. Gain access to our dedicated merchant dashboard, listing tools, and multi-vendor analytics.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {hasApplied ? (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-100/70 px-3 py-2 rounded-xl border border-amber-200">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Vendor Application Pending Review by Platform Admin</span>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isApplying}
                  onClick={handleApplyVendor}
                >
                  Submit Vendor Application
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
