'use client';

import React, { useRef, useState } from 'react';
import { Zap, Plus, Edit3, Trash2 } from 'lucide-react';
import type {
  FlashSale,
  CreateFlashSalePayload,
  UpdateFlashSalePayload,
  FlashSaleStatus,
} from '@/types';
import { useApiGet, useApiPost, useApiPut, useApiDelete, createQueryKeys } from '@/hooks';
import {
  getFlashSales,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
} from '@/services/flash-sale.service';
import DataTable, { ColumnDef } from '@/app/admin/_components/common/DataTable';
import Modal from '@/app/admin/_components/common/Modal';
import ConfirmDialog from '@/app/admin/_components/common/ConfirmDialog';
import FlashSaleForm, { FlashSaleFormHandle } from './FlashSaleForm';

const flashSaleQueryKeys = createQueryKeys('admin-flash-sales');

const formatPrice = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDiscount = (sale: FlashSale) =>
  sale.discountType === 'percentage' ? `${sale.discountValue}% off` : `${formatPrice(sale.discountValue)} off`;

const formatDate = (value: string | undefined) =>
  value ? new Date(value).toLocaleDateString() : '—';

export default function FlashSaleTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const formRef = useRef<FlashSaleFormHandle>(null);

  const { data: saleResponse, isLoading, refetch } = useApiGet<FlashSale[]>({
    queryKey: flashSaleQueryKeys.list({ search, page, limit }),
    queryFn: () => getFlashSales({ page, limit, search }),
  });

  const sales = saleResponse?.data || [];
  const meta = saleResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const createMutation = useApiPost<FlashSale, CreateFlashSalePayload>({
    mutationFn: createFlashSale,
    invalidateKeys: [flashSaleQueryKeys.all, flashSaleQueryKeys.lists()],
    successMessage: 'Flash sale created successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const updateMutation = useApiPut<FlashSale, UpdateFlashSalePayload>({
    mutationFn: updateFlashSale,
    invalidateKeys: [flashSaleQueryKeys.all, flashSaleQueryKeys.lists()],
    successMessage: 'Flash sale updated successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const deleteMutation = useApiDelete({
    mutationFn: deleteFlashSale,
    invalidateKeys: [flashSaleQueryKeys.all, flashSaleQueryKeys.lists()],
    successMessage: 'Flash sale deleted successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const openCreateModal = () => {
    setEditingSale(null);
    setModalOpen(true);
  };

  const openEditModal = (sale: FlashSale) => {
    setEditingSale(sale);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSale(null);
  };

  const handleSubmit = (payload: CreateFlashSalePayload) => {
    if (editingSale) {
      updateMutation.mutate({ _id: editingSale._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const columns: ColumnDef<FlashSale>[] = [
    {
      key: 'sale',
      header: 'Flash Sale',
      render: (sale) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Zap className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white truncate">{sale.title}</div>
            {sale.description && (
              <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{sale.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (sale) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatDiscount(sale)}
        </span>
      ),
    },
    {
      key: 'schedule',
      header: 'Schedule',
      render: (sale) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(sale.startsAt)} → {formatDate(sale.endsAt)}
        </div>
      ),
    },
    {
      key: 'products',
      header: 'Products',
      render: (sale) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">{sale.productIds.length}</span>
      ),
    },
    {
      key: 'home',
      header: 'Home',
      render: (sale) => (
        <span className={`text-xs font-medium ${sale.showOnHome ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
          {sale.showOnHome ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (sale) => {
        const tones: Record<FlashSaleStatus, string> = {
          active: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
          scheduled: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
          ended: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
          inactive: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${tones[sale.status || 'inactive']}`}>
            {sale.status || 'inactive'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (sale) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditModal(sale)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Edit"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(sale._id)}
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
        title="Flash Sales"
        description="Create timed discounts with products and home page placement."
        columns={columns}
        data={sales}
        keyExtractor={(sale) => sale._id}
        loading={isLoading}
        emptyMessage="No flash sales found. Add your first flash sale!"
        emptyIcon={<Zap className="h-10 w-10 mb-2 text-gray-400 opacity-50" />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search flash sales...',
        }}
        headerActions={
          <button
            onClick={openCreateModal}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Flash Sale
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
          itemUnitName: 'flash sales',
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingSale ? 'Edit Flash Sale' : 'Create New Flash Sale'}
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
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingSale ? 'Update Flash Sale' : 'Create Flash Sale'}
            </button>
          </div>
        }
      >
        <FlashSaleForm
          key={editingSale?._id ?? 'create'}
          ref={formRef}
          sale={editingSale}
          onSubmit={handleSubmit}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        description="Are you sure you want to delete this flash sale? This action cannot be undone."
      />
    </>
  );
}
