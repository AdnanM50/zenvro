'use client';

import React, { useState } from 'react';
import { Sliders, Plus, Edit3, Trash2 } from 'lucide-react';
import type { Attribute } from '@/types';
import { useApiGet, useApiPost, useApiPut, useApiDelete, createQueryKeys } from '@/hooks';
import { getAttributes, createAttribute, updateAttribute, deleteAttribute } from '@/services/attribute.service';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const attributeQueryKeys = createQueryKeys('admin-attributes');

export default function AttributeTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [name, setName] = useState('');
  const [valuesInput, setValuesInput] = useState('');
  const [isVariant, setIsVariant] = useState(true);

  // Fetch Attributes using generic React Query hook
  const { data: attributeResponse, isLoading, refetch } = useApiGet<Attribute[]>({
    queryKey: attributeQueryKeys.list({ search, page, limit }),
    queryFn: () => getAttributes({ page, limit, search }),
  });

  const attributes = attributeResponse?.data || [];
  const meta = attributeResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Mutations using generic hooks
  const createMutation = useApiPost({
    mutationFn: createAttribute,
    invalidateKeys: [attributeQueryKeys.all, attributeQueryKeys.lists()],
    successMessage: 'Attribute created successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const updateMutation = useApiPut({
    mutationFn: updateAttribute,
    invalidateKeys: [attributeQueryKeys.all, attributeQueryKeys.lists()],
    successMessage: 'Attribute updated successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const deleteMutation = useApiDelete({
    mutationFn: deleteAttribute,
    invalidateKeys: [attributeQueryKeys.all, attributeQueryKeys.lists()],
    successMessage: 'Attribute deleted successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const openCreateModal = () => {
    setEditingAttribute(null);
    setName('');
    setValuesInput('');
    setIsVariant(true);
    setModalOpen(true);
  };

  const openEditModal = (attr: Attribute) => {
    setEditingAttribute(attr);
    setName(attr.name);
    setValuesInput(attr.values ? attr.values.join(', ') : '');
    setIsVariant(attr.isVariant);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAttribute(null);
    setName('');
    setValuesInput('');
    setIsVariant(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedValues = valuesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name,
      values: parsedValues,
      isVariant,
    };

    if (editingAttribute) {
      updateMutation.mutate({ _id: editingAttribute._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this attribute?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: ColumnDef<Attribute>[] = [
    {
      key: 'name',
      header: 'Attribute Name',
      render: (attr) => (
        <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
          <Sliders className="h-4 w-4 text-purple-500" />
          {attr.name}
        </div>
      ),
    },
    {
      key: 'values',
      header: 'Values',
      render: (attr) => (
        <div className="flex flex-wrap gap-1 max-w-sm">
          {attr.values && attr.values.length > 0 ? (
            attr.values.map((v, idx) => (
              <span
                key={idx}
                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-[11px] font-medium"
              >
                {v}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'isVariant',
      header: 'Variant Support',
      render: (attr) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            attr.isVariant
              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }`}
        >
          {attr.isVariant ? 'Variant Enabled' : 'Static Option'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (attr) => new Date(attr.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (attr) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditModal(attr)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Edit"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(attr._id)}
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
        title="Product Attributes"
        description="Configure product variants such as Size, Color, Material, and Storage."
        columns={columns}
        data={attributes}
        keyExtractor={(attr) => attr._id}
        loading={isLoading}
        emptyMessage="No attributes found. Add your first attribute!"
        emptyIcon={<Sliders className="h-10 w-10 mb-2 text-gray-400 opacity-50" />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search attributes...',
        }}
        headerActions={
          <button
            onClick={openCreateModal}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Attribute
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
          itemUnitName: 'attributes',
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingAttribute ? 'Edit Attribute' : 'Create New Attribute'}
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
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingAttribute ? 'Update Attribute' : 'Create Attribute'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="attr-name">Attribute Name</Label>
            <Input
              id="attr-name"
              placeholder="e.g. Size, Color, Ram"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attr-values">Option Values (Comma separated)</Label>
            <Input
              id="attr-values"
              placeholder="e.g. Small, Medium, Large, XL"
              value={valuesInput}
              onChange={(e) => setValuesInput(e.target.value)}
            />
            <p className="text-[11px] text-gray-400">Separate each option with a comma.</p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="attr-variant"
              checked={isVariant}
              onChange={(e) => setIsVariant(e.target.checked)}
              className="rounded text-black focus:ring-0"
            />
            <Label htmlFor="attr-variant">Use for Product Variants</Label>
          </div>
        </form>
      </Modal>
    </>
  );
}
