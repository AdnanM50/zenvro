'use client';

import React, { useState } from 'react';
import { ShieldCheck, Plus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Brand } from '@/types';
import { useApiGet, useApiPost, useApiPut, useApiDelete, createQueryKeys } from '@/hooks';
import { getBrands, createBrand, updateBrand, deleteBrand } from '@/services/brand.service';
import DataTable, { ColumnDef } from '@/app/admin/_components/common/DataTable';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GalleryPickerButton from './GalleryPickerButton';

const brandQueryKeys = createQueryKeys('admin-brands');

export default function BrandTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Fetch Brands using generic React Query hook
  const { data: brandResponse, isLoading, refetch } = useApiGet<Brand[]>({
    queryKey: brandQueryKeys.list({ search, page, limit }),
    queryFn: () => getBrands({ page, limit, search }),
  });

  const brands = brandResponse?.data || [];
  const meta = brandResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Mutations using generic hooks
  const createMutation = useApiPost({
    mutationFn: createBrand,
    invalidateKeys: [brandQueryKeys.all, brandQueryKeys.lists()],
    successMessage: 'Brand created successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const updateMutation = useApiPut({
    mutationFn: updateBrand,
    invalidateKeys: [brandQueryKeys.all, brandQueryKeys.lists()],
    successMessage: 'Brand updated successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const deleteMutation = useApiDelete({
    mutationFn: deleteBrand,
    invalidateKeys: [brandQueryKeys.all, brandQueryKeys.lists()],
    successMessage: 'Brand deleted successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const openCreateModal = () => {
    setEditingBrand(null);
    setName('');
    setSlug('');
    setLogo('');
    setDescription('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setSlug(brand.slug);
    setLogo(brand.logo || '');
    setDescription(brand.description || '');
    setIsActive(brand.isActive);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBrand(null);
    setName('');
    setSlug('');
    setLogo('');
    setDescription('');
    setIsActive(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      slug,
      logo,
      description,
      isActive,
    };

    if (editingBrand) {
      updateMutation.mutate({ _id: editingBrand._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (brand: Brand) => {
    updateMutation.mutate({ _id: brand._id, isActive: !brand.isActive });
  };

  const columns: ColumnDef<Brand>[] = [
    {
      key: 'name',
      header: 'Brand',
      render: (brand) => (
        <div className="flex items-center gap-3 font-medium text-gray-900 dark:text-white">
          {brand.logo ? (
            <img src={brand.logo} alt={brand.name} className="w-8 h-8 rounded-lg object-contain bg-gray-100 dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          )}
          <div>
            <div className="font-bold">{brand.name}</div>
            {brand.description && <div className="text-[11px] text-gray-400 max-w-xs truncate">{brand.description}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (brand) => <code className="text-gray-500 dark:text-gray-400 font-mono text-xs">{brand.slug}</code>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (brand) => (
        <button
          onClick={() => handleToggleActive(brand)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            brand.isActive
              ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }`}
        >
          {brand.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {brand.isActive ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (brand) => new Date(brand.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (brand) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditModal(brand)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Edit"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(brand._id)}
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
        title="Brands Management"
        description="Manage product manufacturers and brand partners."
        columns={columns}
        data={brands}
        keyExtractor={(brand) => brand._id}
        loading={isLoading}
        emptyMessage="No brands found. Add your first brand!"
        emptyIcon={<ShieldCheck className="h-10 w-10 mb-2 text-gray-400 opacity-50" />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search brands...',
        }}
        headerActions={
          <button
            onClick={openCreateModal}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Brand
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
          itemUnitName: 'brands',
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingBrand ? 'Edit Brand' : 'Create New Brand'}
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
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingBrand ? 'Update Brand' : 'Create Brand'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand-name">Brand Name</Label>
            <Input
              id="brand-name"
              placeholder="e.g. Nike, Apple, Samsung"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-slug">Slug (Optional)</Label>
            <Input
              id="brand-slug"
              placeholder="e.g. nike"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-logo">Logo Image URL</Label>
            <Input
              id="brand-logo"
              placeholder="https://..."
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
            />
            <GalleryPickerButton
              onSelect={(urls) => {
                if (urls[0]) setLogo(urls[0]);
              }}
              selectedUrls={logo ? [logo] : []}
              label="Browse Gallery"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-desc">Description</Label>
            <Input
              id="brand-desc"
              placeholder="Short brand overview"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="brand-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-black focus:ring-0"
            />
            <Label htmlFor="brand-active">Active Brand</Label>
          </div>
        </form>
      </Modal>
    </>
  );
}
