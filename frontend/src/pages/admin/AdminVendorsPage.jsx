import React, { useState, useEffect } from 'react';
import { vendorApi } from '../../api/vendor';
import { adminApi } from '../../api/admin';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { Store, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

export const AdminVendorsPage = () => {
  const [requests, setRequests] = useState([]);
  const [activeVendors, setActiveVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const toast = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [reqRes, usersRes] = await Promise.all([
        vendorApi.getVendorRequests(),
        adminApi.getUsers({ role: 'VENDOR' }),
      ]);
      if (reqRes.requests) setRequests(reqRes.requests);
      if (usersRes.users) setActiveVendors(usersRes.users);
    } catch (err) {
      console.error('Failed to load vendors', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (userId, name) => {
    try {
      setApprovingId(userId);
      await vendorApi.approveVendor(userId);
      toast.success(`${name} has been approved as a Verified Vendor!`);
      fetchData();
    } catch (err) {
      toast.error('Failed to approve vendor.');
    } finally {
      setApprovingId(null);
    }
  };

  const pendingColumns = [
    {
      header: 'Applicant',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'}
            alt=""
            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
          />
          <div>
            <p className="font-bold text-slate-900 text-xs">{row.name}</p>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Requested Status',
      render: () => (
        <Badge variant="WARNING" showDot size="sm">
          Pending Verification
        </Badge>
      ),
    },
    {
      header: 'Decision Action',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="primary"
            size="sm"
            isLoading={approvingId === row.id}
            onClick={() => handleApprove(row.id, row.name)}
          >
            Approve Merchant
          </Button>
        </div>
      ),
    },
  ];

  const vendorColumns = [
    {
      header: 'Merchant Studio',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-xs">{row.storeName || `${row.name}'s Studio`}</p>
            <p className="text-[11px] text-slate-400">Owner: {row.name} ({row.email})</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Merchant Tier',
      render: () => (
        <Badge variant="SUCCESS" size="sm" showDot>
          Tier-1 Verified
        </Badge>
      ),
    },
    {
      header: 'Account Status',
      render: () => (
        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" /> Good Standing
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Vendor Ecosystem & Approvals
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review onboarding applications, verify merchant credentials, and audit active sellers
        </p>
      </div>

      {/* Pending Applications Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900">
              Pending Vendor Applications ({requests.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Action required</span>
        </div>

        <Table
          columns={pendingColumns}
          data={requests}
          isLoading={isLoading}
          emptyMessage="No pending vendor requests at this time. All applicants processed."
        />
      </div>

      {/* Active Vendors Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Active Marketplace Vendors ({activeVendors.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Audited sellers</span>
        </div>

        <Table
          columns={vendorColumns}
          data={activeVendors}
          isLoading={isLoading}
          emptyMessage="No active vendors registered."
        />
      </div>
    </div>
  );
};
