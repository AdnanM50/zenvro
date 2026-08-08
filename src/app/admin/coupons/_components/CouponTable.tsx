'use client';

import React, { useRef, useState } from 'react';
import { Tag, Plus, Edit3, Trash2 } from 'lucide-react';
import type {
  Coupon,
  CreateCouponPayload,
  UpdateCouponPayload,
  CouponStatus,
} from '@/types';
import { useApiGet, useApiPost, useApiPut, useApiDelete, createQueryKeys } from '@/hooks';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '@/services/coupon.service';
import DataTable, { ColumnDef } from '@/app/admin/_components/common/DataTable';
import Modal from '@/app/admin/_components/common/Modal';
import CouponForm, { CouponFormHandle } from './CouponForm';

const couponQueryKeys = createQueryKeys('admin-coupons');

const formatPrice = (value: number | undefined) =>
  value === undefined || value === null
    ? '—'
    : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDiscount = (coupon: Coupon) =>
  coupon.type === 'percentage' ? `${coupon.value}% off` : `${formatPrice(coupon.value)} off`;

const formatDate = (value: string | undefined) =>
  value ? new Date(value).toLocaleDateString() : '—';

export default function CouponTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const formRef = useRef<CouponFormHandle>(null);

  const { data: couponResponse, isLoading, refetch } = useApiGet<Coupon[]>({
    queryKey: couponQueryKeys.list({ search, page, limit }),
    queryFn: () => getCoupons({ page, limit, search }),
  });

  const coupons = couponResponse?.data || [];
  const meta = couponResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const createMutation = useApiPost<Coupon, CreateCouponPayload>({
    mutationFn: createCoupon,
    invalidateKeys: [couponQueryKeys.all, couponQueryKeys.lists()],
    successMessage: 'Coupon created successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const updateMutation = useApiPut<Coupon, UpdateCouponPayload>({
    mutationFn: updateCoupon,
    invalidateKeys: [couponQueryKeys.all, couponQueryKeys.lists()],
    successMessage: 'Coupon updated successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const deleteMutation = useApiDelete({
    mutationFn: deleteCoupon,
    invalidateKeys: [couponQueryKeys.all, couponQueryKeys.lists()],
    successMessage: 'Coupon deleted successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const openCreateModal = () => {
    setEditingCoupon(null);
    setModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = (payload: CreateCouponPayload) => {
    if (editingCoupon) {
      updateMutation.mutate({ _id: editingCoupon._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: ColumnDef<Coupon>[] = [
    {
      key: 'code',
      header: 'Coupon',
      render: (coupon) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Tag className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white truncate">{coupon.name}</div>
            <code className="font-mono text-[11px] text-purple-600 dark:text-purple-400">{coupon.code}</code>
          </div>
        </div>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (coupon) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatDiscount(coupon)}
        </span>
      ),
    },
    {
      key: 'validity',
      header: 'Validity',
      render: (coupon) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {coupon.startDate || coupon.endDate ? (
            <span>
              {formatDate(coupon.startDate)} → {formatDate(coupon.endDate)}
            </span>
          ) : (
            <span>No expiry</span>
          )}
        </div>
      ),
    },
    {
      key: 'usage',
      header: 'Usage',
      render: (coupon) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {coupon.usedCount} / {coupon.usageLimit ?? '∞'}
        </span>
      ),
    },
    {
      key: 'minOrder',
      header: 'Min Order',
      render: (coupon) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {coupon.minOrderAmount !== undefined && coupon.minOrderAmount !== null
            ? formatPrice(coupon.minOrderAmount)
            : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (coupon) => {
        const tones: Record<CouponStatus, string> = {
          active: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
          inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
          expired: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${tones[coupon.status || 'inactive']}`}>
            {coupon.status || 'inactive'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (coupon) => new Date(coupon.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (coupon) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditModal(coupon)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Edit"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(coupon._id)}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Coupons"
        description="Create discount codes, set usage limits and manage promotions."
        columns={columns}
        data={coupons}
        keyExtractor={(coupon) => coupon._id}
        loading={isLoading}
        emptyMessage="No coupons found. Add your first coupon!"
        emptyIcon={<Tag className="h-10 w-10 mb-2 text-gray-400 opacity-50" />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search coupons...',
        }}
        headerActions={
          <button
            onClick={openCreateModal}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Coupon
          </button>
        }
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
          itemUnitName: 'coupons',
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
        maxWidth="2xl"
        footer={
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => formRef.current?.submit()}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        }
      >
        <CouponForm
          key={editingCoupon?._id ?? 'create'}
          ref={formRef}
          coupon={editingCoupon}
          onSubmit={handleSubmit}
        />
      </Modal>
    </>
  );
}
