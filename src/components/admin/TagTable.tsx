'use client';

import React, { useState } from 'react';
import { Tag as TagIcon, Plus, Edit3, Trash2 } from 'lucide-react';
import type { Tag } from '@/types';
import { useApiGet, useApiPost, useApiPut, useApiDelete, createQueryKeys } from '@/hooks';
import { getTags, createTag, updateTag, deleteTag } from '@/services/tag.service';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const tagQueryKeys = createQueryKeys('admin-tags');

export default function TagTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  // Fetch Tags using generic React Query hook
  const { data: tagResponse, isLoading, refetch } = useApiGet<Tag[]>({
    queryKey: tagQueryKeys.list({ search, page, limit }),
    queryFn: () => getTags({ page, limit, search }),
  });

  const tags = tagResponse?.data || [];
  const meta = tagResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Mutations using generic hooks
  const createMutation = useApiPost({
    mutationFn: createTag,
    invalidateKeys: [tagQueryKeys.all, tagQueryKeys.lists()],
    successMessage: 'Tag created successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const updateMutation = useApiPut({
    mutationFn: updateTag,
    invalidateKeys: [tagQueryKeys.all, tagQueryKeys.lists()],
    successMessage: 'Tag updated successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const deleteMutation = useApiDelete({
    mutationFn: deleteTag,
    invalidateKeys: [tagQueryKeys.all, tagQueryKeys.lists()],
    successMessage: 'Tag deleted successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const openCreateModal = () => {
    setEditingTag(null);
    setName('');
    setSlug('');
    setModalOpen(true);
  };

  const openEditModal = (tag: Tag) => {
    setEditingTag(tag);
    setName(tag.name);
    setSlug(tag.slug);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTag(null);
    setName('');
    setSlug('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingTag) {
      updateMutation.mutate({ _id: editingTag._id, name, slug });
    } else {
      createMutation.mutate({ name, slug });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: ColumnDef<Tag>[] = [
    {
      key: 'name',
      header: 'Tag Name',
      render: (tag) => (
        <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
          <TagIcon className="h-4 w-4 text-blue-500" />
          {tag.name}
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (tag) => <code className="text-gray-500 dark:text-gray-400 font-mono text-xs">{tag.slug}</code>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (tag) => new Date(tag.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (tag) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditModal(tag)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Edit"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(tag._id)}
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
        title="Tags Management"
        description="Organize your store products with searchable tags."
        columns={columns}
        data={tags}
        keyExtractor={(tag) => tag._id}
        loading={isLoading}
        emptyMessage="No tags found. Add your first tag!"
        emptyIcon={<TagIcon className="h-10 w-10 mb-2 text-gray-400 opacity-50" />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search tags...',
        }}
        headerActions={
          <button
            onClick={openCreateModal}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Tag
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
          itemUnitName: 'tags',
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingTag ? 'Edit Tag' : 'Create New Tag'}
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
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingTag ? 'Update Tag' : 'Create Tag'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tag-name">Tag Name</Label>
            <Input
              id="tag-name"
              placeholder="e.g. Summer, Featured, On Sale"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tag-slug">Slug (Optional)</Label>
            <Input
              id="tag-slug"
              placeholder="e.g. summer-sale"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
