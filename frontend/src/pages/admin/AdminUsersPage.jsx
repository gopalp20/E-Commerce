import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { SearchBar } from '../../components/common/SearchBar';
import { Select } from '../../components/common/Select';
import { Pagination } from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';
import { User, Shield, Store, CheckCircle } from 'lucide-react';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const toast = useToast();
  const limit = 8;

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getUsers({ role: roleFilter || undefined, search: search || undefined });
      if (res.users) setUsers(res.users);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      await adminApi.updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.ceil(users.length / limit) || 1;
  const paginated = users.slice((page - 1) * limit, page * limit);

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt=""
            className="w-9 h-9 rounded-full object-cover border border-slate-200"
          />
          <div>
            <p className="font-bold text-slate-900 text-xs">{row.name}</p>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Role',
      accessor: 'role',
      render: (row) => <Badge status={row.role} showDot size="sm" />,
    },
    {
      header: 'Created On',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-xs text-slate-500">
          {new Date(row.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Account Status',
      render: () => (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle className="w-3 h-3 text-emerald-600" /> Active
        </span>
      ),
    },
    {
      header: 'Change Role Action',
      align: 'right',
      render: (row) => (
        <div className="w-36 ml-auto">
          <select
            value={row.role}
            disabled={updatingId === row.id}
            onChange={(e) => handleRoleChange(row.id, e.target.value)}
            className="w-full text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="CUSTOMER">Customer</option>
            <option value="VENDOR">Vendor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            User Accounts ({users.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Audit user accounts, security roles, and platform permissions
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-80">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search by name or email..."
          />
        </div>

        <div className="w-full sm:w-48 sm:ml-auto">
          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { label: 'All Roles', value: '' },
              { label: 'Customers Only', value: 'CUSTOMER' },
              { label: 'Vendors Only', value: 'VENDOR' },
              { label: 'Administrators', value: 'ADMIN' },
            ]}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={paginated}
        isLoading={isLoading}
        emptyMessage="No registered users found matching your criteria."
      />

      {!isLoading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={users.length}
          limit={limit}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
};
