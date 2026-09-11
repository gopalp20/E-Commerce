import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Store, ShieldCheck, DollarSign, Save } from 'lucide-react';

export const VendorProfilePage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [storeName, setStoreName] = useState(user?.storeName || 'Aura Studio Tech');
  const [storeBio, setStoreBio] = useState(
    user?.storeBio ||
      'Precision engineered modern peripherals and acoustic sound systems designed in California.'
  );
  const [payoutBank, setPayoutBank] = useState('Silicon Valley Bank (•••• 8912)');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Merchant profile and store details updated.');
    }, 500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Merchant Studio Settings
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Public brand presence, merchant identity, and automated payout preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-6 sm:p-8 space-y-6">
        {/* Verification Status */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{storeName}</h3>
              <p className="text-xs text-slate-400">Merchant Account ID: VEN-{user?.id || 2}</p>
            </div>
          </div>
          <Badge variant="SUCCESS" showDot>
            Verified Tier-1 Seller
          </Badge>
        </div>

        {/* Store Information */}
        <div className="space-y-4">
          <Input
            label="Brand / Store Name"
            required
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Public Storefront Bio
            </label>
            <textarea
              rows="3"
              value={storeBio}
              onChange={(e) => setStoreBio(e.target.value)}
              className="w-full text-sm p-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Merchant Support Email" value={user?.email || 'vendor@marketplace.com'} readOnly />
            <Input label="Payout Routing" value={payoutBank} onChange={(e) => setPayoutBank(e.target.value)} />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button variant="primary" size="md" type="submit" isLoading={isSaving} leftIcon={Save}>
            Save Store Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
