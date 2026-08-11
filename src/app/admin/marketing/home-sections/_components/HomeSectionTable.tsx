'use client';

import React, { useRef, useState } from 'react';
import { LayoutGrid, Plus, Edit3, Trash2 } from 'lucide-react';
import type {
  HomeSection,
  CreateHomeSectionPayload,
  UpdateHomeSectionPayload,
  HomeSectionType,
} from '@/types';
import { useApiGet, useApiPost, useApiPut, useApiDelete, createQueryKeys } from '@/hooks';
import {
  getHomeSections,
  createHomeSection,
  updateHomeSection,
  deleteHomeSection,
} from '@/services/home-section.service';
import DataTable, { ColumnDef } from '@/app/admin/_components/common/DataTable';
import Modal from '@/app/admin/_components/common/Modal';
import ConfirmDialog from '@/app/admin/_components/common/ConfirmDialog';
import HomeSectionForm, { HomeSectionFormHandle } from './HomeSectionForm';

const homeSectionQueryKeys = createQueryKeys('admin-home-sections');

const sectionTypeLabels: Record<HomeSectionType, string> = {
  'featured-products': 'Featured Products',
  'promo-banner': 'Promo Banner',
  'flash-sale': 'Flash Sale',
  custom: 'Custom',
};

const sectionTypeTones: Record<HomeSectionType, string> = {
  'featured-products': 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  'promo-banner': 'bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-800',
  'flash-sale': 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  custom: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
};

export default function HomeSectionTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const formRef = useRef<HomeSectionFormHandle>(null);

  const { data: sectionResponse, isLoading, refetch } = useApiGet<HomeSection[]>({
    queryKey: homeSectionQueryKeys.list({ search, page, limit }),
    queryFn: () => getHomeSections({ page, limit, search }),
  });

  const sections = sectionResponse?.data || [];
  const meta = sectionResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const createMutation = useApiPost<HomeSection, CreateHomeSectionPayload>({
    mutationFn: createHomeSection,
    invalidateKeys: [homeSectionQueryKeys.all, homeSectionQueryKeys.lists()],
    successMessage: 'Home section created successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const updateMutation = useApiPut<HomeSection, UpdateHomeSectionPayload>({
    mutationFn: updateHomeSection,
    invalidateKeys: [homeSectionQueryKeys.all, homeSectionQueryKeys.lists()],
    successMessage: 'Home section updated successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const deleteMutation = useApiDelete({
    mutationFn: deleteHomeSection,
    invalidateKeys: [homeSectionQueryKeys.all, homeSectionQueryKeys.lists()],
    successMessage: 'Home section deleted successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const openCreateModal = () => {
    setEditingSection(null);
    setModalOpen(true);
  };

  const openEditModal = (section: HomeSection) => {
    setEditingSection(section);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSection(null);
  };

  const handleSubmit = (payload: CreateHomeSectionPayload) => {
    if (editingSection) {
      updateMutation.mutate({ _id: editingSection._id, ...payload });
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

  const columns: ColumnDef<HomeSection>[] = [
    {
      key: 'section',
      header: 'Section',
      render: (section) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white truncate">{section.title}</div>
            {section.subtitle && (
              <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{section.subtitle}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (section) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${sectionTypeTones[section.sectionType || 'custom']}`}>
          {sectionTypeLabels[section.sectionType] || 'Custom'}
        </span>
      ),
    },
    {
      key: 'products',
      header: 'Products',
      render: (section) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {section.sectionType === 'featured-products' ? section.productIds.length : '—'}
        </span>
      ),
    },
    {
      key: 'sortOrder',
      header: 'Sort',
      render: (section) => <span className="text-xs text-gray-500 dark:text-gray-400">{section.sortOrder}</span>,
    },
    {
      key: 'enabled',
      header: 'Home',
      render: (section) => (
        <span className={`text-xs font-medium ${section.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
          {section.enabled ? 'Visible' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (section) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditModal(section)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Edit"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(section._id)}
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
        title="Home Sections"
        description="Pick the 1-2 sections you want shown on the home page and control their order."
        columns={columns}
        data={sections}
        keyExtractor={(section) => section._id}
        loading={isLoading}
        emptyMessage="No home sections found. Add your first section!"
        emptyIcon={<LayoutGrid className="h-10 w-10 mb-2 text-gray-400 opacity-50" />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search home sections...',
        }}
        headerActions={
          <button
            onClick={openCreateModal}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Section
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
          itemUnitName: 'sections',
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingSection ? 'Edit Home Section' : 'Create New Home Section'}
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
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingSection ? 'Update Section' : 'Create Section'}
            </button>
          </div>
        }
      >
        <HomeSectionForm
          key={editingSection?._id ?? 'create'}
          ref={formRef}
          section={editingSection}
          onSubmit={handleSubmit}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        description="Are you sure you want to delete this home section? This action cannot be undone."
      />
    </>
  );
}
