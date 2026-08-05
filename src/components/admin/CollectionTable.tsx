'use client';

import React, { useState } from 'react';
import { Layers, Plus, Edit3, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';
import type { CollectionItem } from '@/types';
import { useApiGet, useApiPost, useApiPut, useApiDelete, createQueryKeys } from '@/hooks';
import { getCollections, createCollection, updateCollection, deleteCollection } from '@/services/collection.service';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const collectionQueryKeys = createQueryKeys('admin-collections');

export default function CollectionTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [banner, setBanner] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Fetch Collections using generic React Query hook
  const { data: collectionResponse, isLoading, refetch } = useApiGet<CollectionItem[]>({
    queryKey: collectionQueryKeys.list({ search, page, limit }),
    queryFn: () => getCollections({ page, limit, search }),
  });

  const collections = collectionResponse?.data || [];
  const meta = collectionResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Mutations using generic hooks
  const createMutation = useApiPost({
    mutationFn: createCollection,
    invalidateKeys: [collectionQueryKeys.all, collectionQueryKeys.lists()],
    successMessage: 'Collection created successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const updateMutation = useApiPut({
    mutationFn: updateCollection,
    invalidateKeys: [collectionQueryKeys.all, collectionQueryKeys.lists()],
    successMessage: 'Collection updated successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const deleteMutation = useApiDelete({
    mutationFn: deleteCollection,
    invalidateKeys: [collectionQueryKeys.all, collectionQueryKeys.lists()],
    successMessage: 'Collection deleted successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const openCreateModal = () => {
    setEditingCollection(null);
    setName('');
    setSlug('');
    setBanner('');
    setStartDate('');
    setEndDate('');
    setDescription('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (col: CollectionItem) => {
    setEditingCollection(col);
    setName(col.name);
    setSlug(col.slug);
    setBanner(col.banner || '');
    setStartDate(col.startDate ? String(col.startDate).slice(0, 10) : '');
    setEndDate(col.endDate ? String(col.endDate).slice(0, 10) : '');
    setDescription(col.description || '');
    setIsActive(col.isActive);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCollection(null);
    setName('');
    setSlug('');
    setBanner('');
    setStartDate('');
    setEndDate('');
    setDescription('');
    setIsActive(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      slug,
      banner,
      startDate,
      endDate,
      description,
      isActive,
    };

    if (editingCollection) {
      updateMutation.mutate({ _id: editingCollection._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (col: CollectionItem) => {
    updateMutation.mutate({ _id: col._id, isActive: !col.isActive });
  };

  const columns: ColumnDef<CollectionItem>[] = [
    {
      key: 'name',
      header: 'Collection',
      render: (col) => (
        <div className="flex items-center gap-3 font-medium text-gray-900 dark:text-white">
          {col.banner ? (
            <img src={col.banner} alt={col.name} className="w-10 h-8 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
          ) : (
            <div className="w-10 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
              <Layers className="h-4 w-4" />
            </div>
          )}
          <div>
            <div className="font-bold">{col.name}</div>
            {col.description && <div className="text-[11px] text-gray-400 max-w-xs truncate">{col.description}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (col) => <code className="text-gray-500 dark:text-gray-400 font-mono text-xs">{col.slug}</code>,
    },
    {
      key: 'schedule',
      header: 'Active Schedule',
      render: (col) => (
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          {col.startDate || col.endDate ? (
            <span>
              {col.startDate ? new Date(col.startDate).toLocaleDateString() : 'Now'} → {col.endDate ? new Date(col.endDate).toLocaleDateString() : 'Forever'}
            </span>
          ) : (
            <span>Always active</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (col) => (
        <button
          onClick={() => handleToggleActive(col)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            col.isActive
              ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }`}
        >
          {col.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {col.isActive ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (col) => new Date(col.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (col) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditModal(col)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Edit"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(col._id)}
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
        title="Collections & Campaigns"
        description="Curate seasonal product collections and promotional banners."
        columns={columns}
        data={collections}
        keyExtractor={(col) => col._id}
        loading={isLoading}
        emptyMessage="No collections found. Add your first collection!"
        emptyIcon={<Layers className="h-10 w-10 mb-2 text-gray-400 opacity-50" />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search collections...',
        }}
        headerActions={
          <button
            onClick={openCreateModal}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Collection
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
          itemUnitName: 'collections',
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingCollection ? 'Edit Collection' : 'Create New Collection'}
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
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingCollection ? 'Update Collection' : 'Create Collection'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="col-name">Collection Name</Label>
            <Input
              id="col-name"
              placeholder="e.g. Winter Sale 2026, New Arrivals"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="col-slug">Slug (Optional)</Label>
            <Input
              id="col-slug"
              placeholder="e.g. winter-sale-2026"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="col-banner">Banner Image URL</Label>
            <Input
              id="col-banner"
              placeholder="https://..."
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="col-start">Start Date</Label>
              <Input
                id="col-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="col-end">End Date</Label>
              <Input
                id="col-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="col-desc">Description</Label>
            <Input
              id="col-desc"
              placeholder="Collection details & story"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="col-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-black focus:ring-0"
            />
            <Label htmlFor="col-active">Active Campaign</Label>
          </div>
        </form>
      </Modal>
    </>
  );
}
