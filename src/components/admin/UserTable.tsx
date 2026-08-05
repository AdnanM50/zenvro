'use client';

import React from 'react';
import { Users, Trash2, Shield, User as UserIcon } from 'lucide-react';
import type { AuthUser, UserRole } from '@/types';
import DataTable, { ColumnDef } from '@/app/admin/_components/common/DataTable';

export interface UserTableItem extends AuthUser {
  createdAt?: string | Date;
}

interface UserTableProps {
  users: UserTableItem[];
  loading?: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
  onRoleChange?: (userId: string, role: UserRole) => void;
  onDeleteUser?: (userId: string) => void;
  currentUserId?: string;
}

export default function UserTable({
  users,
  loading = false,
  search,
  onSearchChange,
  pagination,
  onRoleChange,
  onDeleteUser,
  currentUserId,
}: UserTableProps) {
  const columns: ColumnDef<UserTableItem>[] = [
    {
      key: 'name',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-200">
            {u.name ? u.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              {u.name}
              {u._id === currentUserId && (
                <span className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">
                  You
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-400 font-mono select-all">ID: {u._id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (u) => <span className="text-gray-600 dark:text-gray-300 font-medium">{u.email}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => {
        const isAdmin = u.role === 'admin';
        return (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isAdmin
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Shield className={`h-3 w-3 ${isAdmin ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
              {isAdmin ? 'Admin' : 'User'}
            </span>
            {onRoleChange && u._id !== currentUserId && (
              <button
                type="button"
                onClick={() => onRoleChange(u._id, isAdmin ? 'user' : 'admin')}
                className="text-[10px] text-gray-400 hover:text-black dark:hover:text-white underline font-medium"
              >
                Change to {isAdmin ? 'User' : 'Admin'}
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (u) => (
        <span className="text-gray-500 text-xs">
          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-2">
          {onDeleteUser && u._id !== currentUserId && (
            <button
              type="button"
              onClick={() => onDeleteUser(u._id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              title="Delete user"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      title="User Management"
      description="Manage accounts, user roles, and system access"
      columns={columns}
      data={users}
      keyExtractor={(u) => u._id}
      loading={loading}
      emptyMessage="No users found"
      emptyIcon={<Users className="h-10 w-10 text-gray-400 mb-2" />}
      search={{
        value: search,
        onChange: onSearchChange,
        placeholder: "Search users by name or email...",
      }}
      pagination={{
        ...pagination,
        itemUnitName: 'users',
      }}
    />
  );
}
