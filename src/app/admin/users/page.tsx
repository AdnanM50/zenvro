'use client';

import React, { useState } from 'react';
import { Users, UserCheck, UserX, Shield, Ban, Loader2 } from 'lucide-react';
import type { UserRole } from '@/types';
import {
  useGetUsers,
  useGetUserStats,
  useUpdateUserRole,
  useUpdateUserStatus,
  useDeleteUser,
} from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import UserTable from '@/components/admin/UserTable';
import type { UserTableItem } from '@/components/admin/UserTable';

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  tone: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-3 ${tone}`}>
      <div className="w-10 h-10 rounded-xl bg-white/60 dark:bg-white/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-black leading-none">
          {value === undefined ? <Loader2 className="h-5 w-5 animate-spin" /> : value}
        </div>
        <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate">{label}</div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { data: userResponse, isLoading, refetch } = useGetUsers({ params: { page, limit, search } });
  const { data: statsResponse } = useGetUserStats();

  const users = (userResponse?.data || []) as UserTableItem[];
  const meta = userResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const stats = statsResponse?.data;

  const roleMutation = useUpdateUserRole({ options: { onSuccess: () => refetch() } });
  const statusMutation = useUpdateUserStatus({ options: { onSuccess: () => refetch() } });
  const deleteMutation = useDeleteUser({ options: { onSuccess: () => refetch() } });

  const handleRoleChange = (userId: string, role: UserRole) => {
    if (confirm(`Change this user's role to ${role}?`)) {
      roleMutation.mutate({ userId, role });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(userId);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Registered Users Overview */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          Registered Users
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            icon={<Users className="h-5 w-5 text-gray-700 dark:text-gray-200" />}
            label="Total Users"
            value={stats?.total}
            tone="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
          />
          <StatCard
            icon={<Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
            label="Admins"
            value={stats?.admins}
            tone="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900"
          />
          <StatCard
            icon={<UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            label="Customers"
            value={stats?.users}
            tone="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900"
          />
          <StatCard
            icon={<UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />}
            label="Active"
            value={stats?.active}
            tone="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900"
          />
          <StatCard
            icon={<UserX className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
            label="Inactive"
            value={stats?.inactive}
            tone="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900"
          />
          <StatCard
            icon={<Ban className="h-5 w-5 text-red-600 dark:text-red-400" />}
            label="Blocked"
            value={stats?.blocked}
            tone="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
          />
        </div>
      </div>

      <UserTable
        users={users}
        loading={isLoading}
        search={search}
        onSearchChange={setSearch}
        pagination={{
          page: meta.page,
          limit: meta.limit,
          total: meta.total,
          totalPages: meta.totalPages,
          onPageChange: setPage,
          onLimitChange: (newLimit) => {
            setLimit(newLimit);
            setPage(1);
          },
        }}
        onRoleChange={handleRoleChange}
        onDeleteUser={handleDeleteUser}
        currentUserId={currentUser?._id}
      />
    </div>
  );
}
