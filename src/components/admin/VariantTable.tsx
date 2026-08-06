'use client';

import React, { useState } from 'react';
import { Layers, Plus, Edit3, Trash2 } from 'lucide-react';
import type { Variant } from '@/types';
import { useApiGet, useApiPost, useApiPut, useApiDelete, createQueryKeys } from '@/hooks';
import { getVariants, createVariant, updateVariant, deleteVariant } from '@/services/variant.service';
import DataTable, { ColumnDef } from '@/app/admin/_components/common/DataTable';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GalleryPickerButton from './GalleryPickerButton';

const variantQueryKeys = createQueryKeys('admin-variants');

interface AttributeRow {
  key: string;
  value: string;
}

const emptyAttributeRow = (): AttributeRow => ({ key: '', value: '' });

const formatPrice = (value: number | undefined) =>
  value === undefined || value === null ? '—' : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function VariantTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [sku, setSku] = useState('');
  const [attributeRows, setAttributeRows] = useState<AttributeRow[]>([emptyAttributeRow()]);
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [weight, setWeight] = useState('');

  // Fetch variants using generic React Query hook
  const { data: variantResponse, isLoading, refetch } = useApiGet<Variant[]>({
    queryKey: variantQueryKeys.list({ search, page, limit }),
    queryFn: () => getVariants({ page, limit, search }),
  });

  const variants = variantResponse?.data || [];
  const meta = variantResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Mutations using generic hooks
  const createMutation = useApiPost({
    mutationFn: createVariant,
    invalidateKeys: [variantQueryKeys.all, variantQueryKeys.lists()],
    successMessage: 'Variant created successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const updateMutation = useApiPut({
    mutationFn: updateVariant,
    invalidateKeys: [variantQueryKeys.all, variantQueryKeys.lists()],
    successMessage: 'Variant updated successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const deleteMutation = useApiDelete({
    mutationFn: deleteVariant,
    invalidateKeys: [variantQueryKeys.all, variantQueryKeys.lists()],
    successMessage: 'Variant deleted successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const resetForm = () => {
    setSku('');
    setAttributeRows([emptyAttributeRow()]);
    setPrice('');
    setSalePrice('');
    setStock('');
    setImage('');
    setWeight('');
  };

  const openCreateModal = () => {
    setEditingVariant(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (variant: Variant) => {
    setEditingVariant(variant);
    setSku(variant.sku);
    const rows = Object.entries(variant.attributes || {}).map(([key, value]) => ({ key, value }));
    setAttributeRows(rows.length > 0 ? rows : [emptyAttributeRow()]);
    setPrice(variant.price !== undefined ? String(variant.price) : '');
    setSalePrice(variant.salePrice !== undefined && variant.salePrice !== null ? String(variant.salePrice) : '');
    setStock(variant.stock !== undefined ? String(variant.stock) : '');
    setImage(variant.image || '');
    setWeight(variant.weight !== undefined && variant.weight !== null ? String(variant.weight) : '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingVariant(null);
    resetForm();
  };

  const addAttributeRow = () => setAttributeRows((rows) => [...rows, emptyAttributeRow()]);

  const updateAttributeRow = (idx: number, field: 'key' | 'value', value: string) =>
    setAttributeRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));

  const removeAttributeRow = (idx: number) =>
    setAttributeRows((rows) => (rows.length === 1 ? rows : rows.filter((_, i) => i !== idx)));

  const buildAttributes = (): Record<string, string> => {
    const attrs: Record<string, string> = {};
    attributeRows.forEach((row) => {
      const key = row.key.trim();
      const value = row.value.trim();
      if (key && value) attrs[key] = value;
    });
    return attrs;
  };

  const toFiniteOrUndefined = (raw: string): number | undefined => {
    if (raw === '') return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skuValue = sku.trim();
    const priceValue = toFiniteOrUndefined(price);
    const stockValue = toFiniteOrUndefined(stock);
    const salePriceValue = toFiniteOrUndefined(salePrice);
    const weightValue = toFiniteOrUndefined(weight);

    if (!skuValue || priceValue === undefined || stockValue === undefined) return;
    if (priceValue < 0 || stockValue < 0 || (salePriceValue !== undefined && salePriceValue < 0)) return;

    const payload = {
      sku: skuValue,
      attributes: buildAttributes(),
      price: priceValue,
      salePrice: salePriceValue,
      stock: stockValue,
      image: image.trim(),
      weight: weightValue,
    };

    if (editingVariant) {
      updateMutation.mutate({ _id: editingVariant._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this variant?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: ColumnDef<Variant>[] = [
    {
      key: 'sku',
      header: 'SKU',
      render: (variant) => (
        <div className="flex items-center gap-3">
          {variant.image ? (
            <img
              src={variant.image}
              alt={variant.sku}
              className="w-9 h-9 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
              <Layers className="h-4 w-4" />
            </div>
          )}
          <code className="font-mono font-bold text-gray-900 dark:text-white">{variant.sku}</code>
        </div>
      ),
    },
    {
      key: 'attributes',
      header: 'Attributes',
      render: (variant) => {
        const entries = Object.entries(variant.attributes || {});
        return entries.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-sm">
            {entries.map(([key, value], idx) => (
              <span
                key={`${key}-${idx}`}
                className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded text-[11px] font-medium"
              >
                {key}: {value}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        );
      },
    },
    {
      key: 'price',
      header: 'Price',
      render: (variant) => (
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(variant.price)}</span>
          {variant.salePrice !== undefined && variant.salePrice !== null && (
            <span className="text-[11px] text-gray-400 line-through">{formatPrice(variant.salePrice)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (variant) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            variant.stock > 0
              ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
        </span>
      ),
    },
    {
      key: 'weight',
      header: 'Weight',
      render: (variant) =>
        variant.weight !== undefined && variant.weight !== null ? (
          <span className="text-gray-700 dark:text-gray-300">{variant.weight} kg</span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (variant) => new Date(variant.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (variant) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditModal(variant)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Edit"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(variant._id)}
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
        title="Product Variants"
        description="Manage SKU-level variants such as sizes, colors, pricing and inventory."
        columns={columns}
        data={variants}
        keyExtractor={(variant) => variant._id}
        loading={isLoading}
        emptyMessage="No variants found. Add your first variant!"
        emptyIcon={<Layers className="h-10 w-10 mb-2 text-gray-400 opacity-50" />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search variants...',
        }}
        headerActions={
          <button
            onClick={openCreateModal}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Variant
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
          itemUnitName: 'variants',
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingVariant ? 'Edit Variant' : 'Create New Variant'}
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
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingVariant ? 'Update Variant' : 'Create Variant'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="variant-sku">SKU</Label>
              <Input
                id="variant-sku"
                placeholder="e.g. TSH-BLK-XL"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant-image">Image URL</Label>
              <Input
                id="variant-image"
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
              <GalleryPickerButton
                onSelect={(urls) => {
                  if (urls[0]) setImage(urls[0]);
                }}
                selectedUrls={image ? [image] : []}
                label="Browse Gallery"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Variant Attributes</Label>
            <div className="space-y-2">
              {attributeRows.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="e.g. Color"
                    value={row.key}
                    onChange={(e) => updateAttributeRow(idx, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="e.g. Black"
                    value={row.value}
                    onChange={(e) => updateAttributeRow(idx, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttributeRow(idx)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    title="Remove attribute"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAttributeRow}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
            >
              <Plus className="h-3.5 w-3.5" /> Add Attribute
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="variant-price">Price ($)</Label>
              <Input
                id="variant-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 49.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant-sale-price">Sale Price ($)</Label>
              <Input
                id="variant-sale-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Optional"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant-stock">Stock</Label>
              <Input
                id="variant-stock"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 25"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant-weight">Weight (kg)</Label>
              <Input
                id="variant-weight"
                type="number"
                min="0"
                step="0.01"
                placeholder="Optional"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
