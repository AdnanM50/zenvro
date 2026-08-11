'use client';

import React, { useRef, useState } from 'react';
import { Megaphone, Plus, Edit3, Trash2 } from 'lucide-react';
import type {
  PopupBanner,
  CreatePopupBannerPayload,
  UpdatePopupBannerPayload,
  PopupBannerStatus,
} from '@/types';
import { useApiGet, useApiPost, useApiPut, useApiDelete, createQueryKeys } from '@/hooks';
import {
  getPopupBanners,
  createPopupBanner,
  updatePopupBanner,
  deletePopupBanner,
} from '@/services/popup.service';
import DataTable, { ColumnDef } from '@/app/admin/_components/common/DataTable';
import Modal from '@/app/admin/_components/common/Modal';
import ConfirmDialog from '@/app/admin/_components/common/ConfirmDialog';
import PopupForm, { PopupFormHandle } from './PopupForm';

const popupQueryKeys = createQueryKeys('admin-popup-banners');

const formatDate = (value: string | undefined) =>
  value ? new Date(value).toLocaleDateString() : '—';

export default function PopupTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PopupBanner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const formRef = useRef<PopupFormHandle>(null);

  const { data: bannerResponse, isLoading, refetch } = useApiGet<PopupBanner[]>({
    queryKey: popupQueryKeys.list({ search, page, limit }),
    queryFn: () => getPopupBanners({ page, limit, search }),
  });

  const banners = bannerResponse?.data || [];
  const meta = bannerResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const createMutation = useApiPost<PopupBanner, CreatePopupBannerPayload>({
    mutationFn: createPopupBanner,
    invalidateKeys: [popupQueryKeys.all, popupQueryKeys.lists()],
    successMessage: 'Popup banner created successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const updateMutation = useApiPut<PopupBanner, UpdatePopupBannerPayload>({
    mutationFn: updatePopupBanner,
    invalidateKeys: [popupQueryKeys.all, popupQueryKeys.lists()],
    successMessage: 'Popup banner updated successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const deleteMutation = useApiDelete({
    mutationFn: deletePopupBanner,
    invalidateKeys: [popupQueryKeys.all, popupQueryKeys.lists()],
    successMessage: 'Popup banner deleted successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const openCreateModal = () => {
    setEditingBanner(null);
    setModalOpen(true);
  };

  const openEditModal = (banner: PopupBanner) => {
    setEditingBanner(banner);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBanner(null);
  };

  const handleSubmit = (payload: CreatePopupBannerPayload) => {
    if (editingBanner) {
      updateMutation.mutate({ _id: editingBanner._id, ...payload });
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

  const columns: ColumnDef<PopupBanner>[] = [
    {
      key: 'banner',
      header: 'Banner',
      render: (banner) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-950/40 border border-fuchsia-100 dark:border-fuchsia-900 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400">
            <Megaphone className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white truncate">{banner.title}</div>
            {banner.description && (
              <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{banner.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'schedule',
      header: 'Schedule',
      render: (banner) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {banner.startDate || banner.endDate ? (
            <span>
              {formatDate(banner.startDate)} → {formatDate(banner.endDate)}
            </span>
          ) : (
            <span>Always on</span>
          )}
        </div>
      ),
    },
    {
      key: 'sortOrder',
      header: 'Sort',
      render: (banner) => <span className="text-xs text-gray-500 dark:text-gray-400">{banner.sortOrder}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (banner) => {
        const tones: Record<PopupBannerStatus, string> = {
          active: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
          inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${tones[banner.status || 'inactive']}`}>
            {banner.status || 'inactive'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (banner) => new Date(banner.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (banner) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditModal(banner)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Edit"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(banner._id)}
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
        title="Popup Banners"
        description="Create announcement popups with scheduling and homepage visibility."
        columns={columns}
        data={banners}
        keyExtractor={(banner) => banner._id}
        loading={isLoading}
        emptyMessage="No popup banners found. Add your first banner!"
        emptyIcon={<Megaphone className="h-10 w-10 mb-2 text-gray-400 opacity-50" />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search popup banners...',
        }}
        headerActions={
          <button
            onClick={openCreateModal}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Popup Banner
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
          itemUnitName: 'banners',
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingBanner ? 'Edit Popup Banner' : 'Create New Popup Banner'}
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
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        }
      >
        <PopupForm
          key={editingBanner?._id ?? 'create'}
          ref={formRef}
          banner={editingBanner}
          onSubmit={handleSubmit}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        description="Are you sure you want to delete this popup banner? This action cannot be undone."
      />
    </>
  );
}
