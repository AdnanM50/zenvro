'use client';

import React, { useRef, useState } from 'react';
import { Megaphone, Plus, Edit3, Trash2, Eye, Tag, Sparkles, Zap, ArrowRight, X, Copy, CheckCircle2 } from 'lucide-react';
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
  const [previewBanner, setPreviewBanner] = useState<PopupBanner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

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

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const columns: ColumnDef<PopupBanner>[] = [
    {
      key: 'banner',
      header: 'Banner & Code',
      render: (banner) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {banner.imageUrl ? (
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Megaphone className="h-5 w-5 text-fuchsia-500" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white truncate max-w-xs">{banner.title}</div>
            <div className="flex items-center gap-2 mt-0.5">
              {banner.discountCode && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <Tag className="w-2.5 h-2.5" />
                  {banner.discountCode}
                </span>
              )}
              {banner.targetPage && (
                <span className="text-[10px] text-gray-400">
                  Page: {banner.targetPage}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'trigger',
      header: 'Trigger',
      render: (banner) => {
        const triggers: Record<string, string> = {
          delay: '4s Delay',
          scroll: '35% Scroll',
          exit_intent: 'Exit Intent',
        };
        return (
          <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
            {triggers[banner.triggerType || 'delay'] || banner.triggerType || 'Delay'}
          </span>
        );
      },
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
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Always Active</span>
          )}
        </div>
      ),
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
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (banner) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setPreviewBanner(banner)}
            className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg text-gray-400 hover:text-amber-500 transition-colors"
            title="Preview Popup"
          >
            <Eye className="h-4 w-4" />
          </button>
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
        description="Create and customize marketing popups with promo codes, triggers, and full visitor previews."
        columns={columns}
        data={banners}
        keyExtractor={(banner) => banner._id}
        loading={isLoading}
        emptyMessage="No popup banners found. Create your first promotional popup!"
        emptyIcon={<Megaphone className="h-10 w-10 mb-2 text-gray-400 opacity-50" />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search popups by title...',
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
        }}
      />

      {/* Edit / Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingBanner ? 'Edit Popup Banner' : 'Create Popup Banner'}
        maxWidth="3xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => formRef.current?.submit()}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingBanner
                ? 'Update Popup'
                : 'Create Popup'}
            </button>
          </div>
        }
      >
        <PopupForm
          ref={formRef}
          banner={editingBanner}
          onSubmit={handleSubmit}
        />
      </Modal>

      {/* Standalone Full Popup Preview Modal */}
      {previewBanner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setPreviewBanner(null)}
        >
          <div
            className="relative w-full max-w-xl bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setPreviewBanner(null)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/10 transition-all cursor-pointer shadow-lg group"
            >
              <X className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[360px]">
              {/* Left Column Image */}
              <div className="md:col-span-5 relative bg-gray-900 overflow-hidden hidden md:block">
                <img
                  src={
                    previewBanner.imageUrl ||
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'
                  }
                  alt={previewBanner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/30" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider shadow-lg">
                    <Zap className="w-3 h-3 fill-black" />
                    {previewBanner.imageBadgeText || 'Limited Offer'}
                  </span>
                </div>
              </div>

              {/* Right Column Content */}
              <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                      {previewBanner.badgeText || 'Exclusive Reward'}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-2 leading-tight">
                    {previewBanner.title}
                  </h3>

                  {previewBanner.description && (
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
                      {previewBanner.description}
                    </p>
                  )}

                  {/* Promo Code Box */}
                  {previewBanner.discountCode && (
                    <div className="mb-6 p-3 bg-gray-900/90 border border-dashed border-amber-500/40 rounded-2xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Promo Code</div>
                          <div className="font-mono font-bold text-amber-300 text-sm tracking-widest">
                            {previewBanner.discountCode}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyCode(previewBanner.discountCode!)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        {copiedCode ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Code
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <div className="space-y-2">
                  <div className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20">
                    {previewBanner.buttonText || 'Claim My Discount Now'}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] text-center text-gray-500">
                    {previewBanner.footerText || 'No spam. Unsubscribe anytime.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Popup Banner"
        description="Are you sure you want to delete this popup banner? This action cannot be undone."
        confirmLabel="Delete"
        confirming={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
