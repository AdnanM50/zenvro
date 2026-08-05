'use client';

import React, { useState } from 'react';
import { Tag, Plus, Edit3, Trash2 } from 'lucide-react';
import type {
  Coupon,
  CreateCouponPayload,
  UpdateCouponPayload,
  CouponType,
  CouponStatus,
  CouponAppliesTo,
} from '@/types';
import { useApiGet, useApiPost, useApiPut, useApiDelete, createQueryKeys } from '@/hooks';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '@/services/coupon.service';
import DataTable, { ColumnDef } from '@/app/admin/_components/common/DataTable';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const couponQueryKeys = createQueryKeys('admin-coupons');

const formatPrice = (value: number | undefined) =>
  value === undefined || value === null
    ? '—'
    : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDiscount = (coupon: Coupon) =>
  coupon.type === 'percentage' ? `${coupon.value}% off` : `${formatPrice(coupon.value)} off`;

const splitCsv = (value: string): string[] =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const toFiniteOrUndefined = (raw: string): number | undefined => {
  if (raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
};

const formatDate = (value: string | undefined) =>
  value ? new Date(value).toLocaleDateString() : '—';

export default function CouponTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<CouponType>('percentage');
  const [value, setValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [perUserLimit, setPerUserLimit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<CouponStatus>('active');
  const [appliesTo, setAppliesTo] = useState<CouponAppliesTo>('all');
  const [products, setProducts] = useState('');
  const [categories, setCategories] = useState('');

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

  const resetForm = () => {
    setName('');
    setCode('');
    setType('percentage');
    setValue('');
    setMinOrderAmount('');
    setMaxDiscountAmount('');
    setUsageLimit('');
    setPerUserLimit('');
    setStartDate('');
    setEndDate('');
    setStatus('active');
    setAppliesTo('all');
    setProducts('');
    setCategories('');
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setName(coupon.name);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value !== undefined ? String(coupon.value) : '');
    setMinOrderAmount(coupon.minOrderAmount !== undefined && coupon.minOrderAmount !== null ? String(coupon.minOrderAmount) : '');
    setMaxDiscountAmount(coupon.maxDiscountAmount !== undefined && coupon.maxDiscountAmount !== null ? String(coupon.maxDiscountAmount) : '');
    setUsageLimit(coupon.usageLimit !== undefined && coupon.usageLimit !== null ? String(coupon.usageLimit) : '');
    setPerUserLimit(coupon.perUserLimit !== undefined && coupon.perUserLimit !== null ? String(coupon.perUserLimit) : '');
    setStartDate(coupon.startDate || '');
    setEndDate(coupon.endDate || '');
    setStatus(coupon.status || 'active');
    setAppliesTo(coupon.appliesTo || 'all');
    setProducts((coupon.products || []).join(', '));
    setCategories((coupon.categories || []).join(', '));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCoupon(null);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameValue = name.trim();
    const codeValue = code.trim();
    const valueNum = toFiniteOrUndefined(value);

    if (!nameValue || !codeValue || valueNum === undefined || valueNum <= 0) return;
    if (type === 'percentage' && valueNum > 100) return;

    const payload: CreateCouponPayload = {
      name: nameValue,
      code: codeValue,
      type,
      value: valueNum,
      minOrderAmount: toFiniteOrUndefined(minOrderAmount),
      maxDiscountAmount: toFiniteOrUndefined(maxDiscountAmount),
      usageLimit: toFiniteOrUndefined(usageLimit),
      perUserLimit: toFiniteOrUndefined(perUserLimit),
      startDate: startDate.trim() || undefined,
      endDate: endDate.trim() || undefined,
      appliesTo,
      products: appliesTo === 'products' ? splitCsv(products) : [],
      categories: appliesTo === 'categories' ? splitCsv(categories) : [],
      status,
    };

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
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basics */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Basics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-name">Name</Label>
                <Input
                  id="coupon-name"
                  placeholder="e.g. Summer Sale"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-code">Code</Label>
                <Input
                  id="coupon-code"
                  placeholder="e.g. SUMMER10"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-type">Type</Label>
                <select
                  id="coupon-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as CouponType)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-value">
                  Value ({type === 'percentage' ? '%' : '$'})
                </Label>
                <Input
                  id="coupon-value"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={type === 'percentage' ? 'e.g. 10' : 'e.g. 5.00'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Limits */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Limits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-min-order">Minimum Order ($)</Label>
                <Input
                  id="coupon-min-order"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-max-discount">Maximum Discount ($)</Label>
                <Input
                  id="coupon-max-discount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-usage-limit">Usage Limit</Label>
                <Input
                  id="coupon-usage-limit"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 100"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-per-user-limit">Per-User Limit</Label>
                <Input
                  id="coupon-per-user-limit"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 1"
                  value={perUserLimit}
                  onChange={(e) => setPerUserLimit(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Validity */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Validity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-start-date">Start Date</Label>
                <Input
                  id="coupon-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-end-date">End Date</Label>
                <Input
                  id="coupon-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-status">Status</Label>
                <select
                  id="coupon-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CouponStatus)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-applies-to">Applies To</Label>
                <select
                  id="coupon-applies-to"
                  value={appliesTo}
                  onChange={(e) => setAppliesTo(e.target.value as CouponAppliesTo)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All products</option>
                  <option value="products">Specific products</option>
                  <option value="categories">Specific categories</option>
                </select>
              </div>
            </div>
            {appliesTo === 'products' && (
              <div className="space-y-2">
                <Label htmlFor="coupon-products">Products</Label>
                <Input
                  id="coupon-products"
                  placeholder="Comma separated product IDs"
                  value={products}
                  onChange={(e) => setProducts(e.target.value)}
                />
              </div>
            )}
            {appliesTo === 'categories' && (
              <div className="space-y-2">
                <Label htmlFor="coupon-categories">Categories</Label>
                <Input
                  id="coupon-categories"
                  placeholder="Comma separated category IDs"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                />
              </div>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
}
