'use client';

import React, { useState, useMemo } from 'react';
import { Layers, Plus, Edit3, Trash2, Tag, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import type { Attribute, Variant, Product } from '@/types';
import { useApiGet, useApiPost, useApiPut, useApiDelete } from '@/hooks';
import { getVariants, createVariant, updateVariant, deleteVariant } from '@/services/variant.service';
import { getAttributes } from '@/services/attribute.service';
import { getProducts } from '@/services/product.service';
import DataTable, { ColumnDef } from '@/app/admin/_components/common/DataTable';
import Modal from '@/app/admin/_components/common/Modal';
import ConfirmDialog from '@/app/admin/_components/common/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import GalleryPickerButton from '../../app/admin/gallery/_components/GalleryPickerButton';

const formatPrice = (value: number | undefined) =>
  value === undefined || value === null
    ? '—'
    : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function VariantTable() {
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get('productId') || '';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedProductIdFilter, setSelectedProductIdFilter] = useState(initialProductId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Form Fields
  const [productId, setProductId] = useState(initialProductId);
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [sold, setSold] = useState(0);
  const [image, setImage] = useState('');
  const [weight, setWeight] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Dynamic Selected Variant Attributes map: { [attributeName]: selectedValue }
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  // Fetch Products for dropdown
  const { data: productsResponse } = useApiGet<Product[]>({
    queryKey: ['admin-products', 'list'],
    queryFn: () => getProducts({ limit: 100 }),
  });
  const products = productsResponse?.data || [];

  // Fetch Attributes from DB
  const { data: attributeResponse } = useApiGet<Attribute[]>({
    queryKey: ['admin-attributes', 'list'],
    queryFn: () => getAttributes({ limit: 100 }),
  });

  // Filter ONLY attributes where useForVariants === true
  const variantEnabledAttributes = useMemo(() => {
    const list = attributeResponse?.data || [];
    return list.filter((attr) => attr.useForVariants ?? attr.isVariant ?? true);
  }, [attributeResponse]);

  // Fetch Variants
  const { data: variantResponse, isLoading, refetch } = useApiGet<Variant[]>({
    queryKey: ['admin-variants', 'list', search, String(page), String(limit), selectedProductIdFilter],
    queryFn: () => getVariants({ page, limit, search, productId: selectedProductIdFilter }),
  });

  const variants = variantResponse?.data || [];
  const meta = variantResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Mutations
  const createMutation = useApiPost({
    mutationFn: createVariant,
    invalidateKeys: [['admin-variants']],
    successMessage: 'Variant created successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
      onError: (err: Error) => {
        setFormError(err.message || 'Failed to create variant');
      },
    },
  });

  const updateMutation = useApiPut({
    mutationFn: updateVariant,
    invalidateKeys: [['admin-variants']],
    successMessage: 'Variant updated successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
      onError: (err: Error) => {
        setFormError(err.message || 'Failed to update variant');
      },
    },
  });

  const deleteMutation = useApiDelete({
    mutationFn: deleteVariant,
    invalidateKeys: [['admin-variants']],
    successMessage: 'Variant deleted successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const resetForm = () => {
    setProductId(selectedProductIdFilter || (products[0]?._id ?? ''));
    setSku('');
    setSelectedAttributes({});
    setPrice('');
    setSalePrice('');
    setCostPrice('');
    setStock('0');
    setSold(0);
    setImage('');
    setWeight('');
    setStatus('active');
    setFormError('');
  };

  const openCreateModal = () => {
    setEditingVariant(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (variant: Variant) => {
    setEditingVariant(variant);
    setProductId(variant.productId);
    setSku(variant.sku);
    setSelectedAttributes(variant.attributes || {});
    setPrice(variant.price !== undefined ? String(variant.price) : '');
    setSalePrice(variant.salePrice !== undefined && variant.salePrice !== null ? String(variant.salePrice) : '');
    setCostPrice(variant.costPrice !== undefined && variant.costPrice !== null ? String(variant.costPrice) : '');
    setStock(variant.stock !== undefined ? String(variant.stock) : '0');
    setSold(variant.sold || 0);
    setImage(variant.image || '');
    setWeight(variant.weight !== undefined && variant.weight !== null ? String(variant.weight) : '');
    setStatus(variant.status || 'active');
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingVariant(null);
    resetForm();
  };

  const handleAttributeValueChange = (attrName: string, val: string) => {
    setSelectedAttributes((prev) => {
      const copy = { ...prev };
      if (val) {
        copy[attrName] = val;
      } else {
        delete copy[attrName];
      }
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!productId) {
      setFormError('Please select a parent Product');
      return;
    }

    if (!sku.trim()) {
      setFormError('SKU code is required');
      return;
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0 || price === '') {
      setFormError('Valid regular price is required');
      return;
    }

    const stockNum = Number(stock);
    if (isNaN(stockNum) || stockNum < 0 || stock === '') {
      setFormError('Valid stock quantity is required');
      return;
    }

    const payload = {
      productId,
      sku: sku.trim(),
      attributes: selectedAttributes,
      price: priceNum,
      salePrice: salePrice ? Number(salePrice) : undefined,
      costPrice: costPrice ? Number(costPrice) : undefined,
      stock: stockNum,
      image: image.trim() || undefined,
      weight: weight ? Number(weight) : undefined,
      status,
    };

    if (editingVariant) {
      updateMutation.mutate({ _id: editingVariant._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => setDeleteTarget(id);

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const productMap = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => map.set(p._id, p.name));
    return map;
  }, [products]);

  const selectedProductName = useMemo(() => {
    if (!productId) return '';
    const match = products.find((p) => p._id === productId);
    return match ? `${match.name} (${match.sku})` : productId;
  }, [productId, products]);

  const selectedFilterProductName = useMemo(() => {
    if (!selectedProductIdFilter || selectedProductIdFilter === 'ALL') return 'All Products';
    const match = products.find((p) => p._id === selectedProductIdFilter);
    return match ? match.name : selectedProductIdFilter;
  }, [selectedProductIdFilter, products]);

  const columns: ColumnDef<Variant>[] = [
    {
      key: 'image',
      header: 'Variant Image',
      render: (v) => (
        <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800">
          {v.image ? (
            <Image src={v.image} alt={v.sku} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <Layers className="h-4 w-4" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'product',
      header: 'Product Name',
      render: (v) => (
        <div className="font-semibold text-gray-900 dark:text-white text-xs truncate max-w-[180px]">
          {productMap.get(v.productId) || v.productId}
        </div>
      ),
    },
    {
      key: 'sku',
      header: 'SKU',
      render: (v) => (
        <span className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
          {v.sku}
        </span>
      ),
    },
    {
      key: 'attributes',
      header: 'Variant Options',
      render: (v) => {
        const entries = Object.entries(v.attributes || {});
        if (entries.length === 0) return <span className="text-gray-400 text-xs">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {entries.map(([k, val]) => (
              <span
                key={k}
                className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded text-[11px] font-semibold"
              >
                {k}: {val}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'price',
      header: 'Regular Price',
      render: (v) => formatPrice(v.price),
    },
    {
      key: 'salePrice',
      header: 'Sale Price',
      render: (v) => (v.salePrice ? formatPrice(v.salePrice) : '—'),
    },
    {
      key: 'stock',
      header: 'Stock / Sold',
      render: (v) => (
        <div className="text-xs">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{v.stock} in stock</span>
          <span className="text-gray-400 ml-1 font-normal">({v.sold || 0} sold)</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (v) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            v.status === 'active'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {v.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (v) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditModal(v)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Edit Variant"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(v._id)}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete Variant"
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
        title="Product Variants Collection"
        description="Manage dedicated inventory, SKUs, and pricing per product attribute combination."
        columns={columns}
        data={variants}
        keyExtractor={(v) => v._id}
        loading={isLoading}
        emptyMessage="No variants found. Add your first variant!"
        emptyIcon={<Layers className="h-10 w-10 mb-2 text-gray-400 opacity-50" />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search variants by SKU...',
        }}
        headerActions={
          <div className="flex items-center gap-3">
            <Select
              value={selectedProductIdFilter}
              onValueChange={(val: string | null) => {
                setSelectedProductIdFilter(val === 'ALL' || !val ? '' : val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-52 h-9 text-xs">
                <SelectValue placeholder="Filter by Product">
                  {selectedFilterProductName || 'Filter by Product'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Products</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={openCreateModal}
              className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-xs"
            >
              <Plus className="h-4 w-4" /> Add Variant
            </button>
          </div>
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
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs font-medium text-red-600 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Product Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="variant-product" className="text-xs font-semibold">
              Parent Product <span className="text-red-500">*</span>
            </Label>
            <Select value={productId} onValueChange={(val: string | null) => val && setProductId(val)}>
              <SelectTrigger id="variant-product" className="w-full text-xs">
                <SelectValue placeholder="Select Product">
                  {selectedProductName || 'Select Product'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name} ({p.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Variant Attributes Selection (Filtered: useForVariants: true) */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" /> Dynamic Variant Attributes
              </Label>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                {variantEnabledAttributes.length} Enabled Attributes
              </span>
            </div>

            {variantEnabledAttributes.length === 0 ? (
              <p className="text-xs text-gray-500">
                No attributes configured with <code className="font-mono">useForVariants: true</code>. Go to the Attributes module to enable Size, Color, etc. for variants.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {variantEnabledAttributes.map((attr) => {
                  const currentValue = selectedAttributes[attr.name] || '';
                  return (
                    <div key={attr._id} className="space-y-1">
                      <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {attr.name}
                      </Label>
                      {attr.values && attr.values.length > 0 ? (
                        <Select
                          value={currentValue}
                          onValueChange={(val: string | null) => handleAttributeValueChange(attr.name, val === 'NONE' || !val ? '' : val)}
                        >
                          <SelectTrigger className="w-full text-xs bg-white dark:bg-gray-950">
                            <SelectValue placeholder={`Select ${attr.name}`} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NONE">-- None --</SelectItem>
                            {attr.values.map((v) => (
                              <SelectItem key={v} value={v}>
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder={`Enter ${attr.name}`}
                          value={currentValue}
                          onChange={(e) => handleAttributeValueChange(attr.name, e.target.value)}
                          className="text-xs bg-white dark:bg-gray-950"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SKU & Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="variant-sku" className="text-xs font-semibold">
                Variant SKU <span className="text-red-500">*</span>
              </Label>
              <Input
                id="variant-sku"
                placeholder="e.g. JKT-OLV-M"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="variant-image" className="text-xs font-semibold">
                Variant Image URL (Optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="variant-image"
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="text-xs"
                />
                <GalleryPickerButton
                  label="Browse"
                  onSelect={(urls: string[]) => {
                    if (urls[0]) setImage(urls[0]);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="variant-price" className="text-xs font-semibold">
                Regular Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="variant-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="99.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="variant-sale-price" className="text-xs font-semibold">
                Sale Price ($)
              </Label>
              <Input
                id="variant-sale-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="79.99"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="variant-cost-price" className="text-xs font-semibold">
                Cost Price ($)
              </Label>
              <Input
                id="variant-cost-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="35.00"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Stock, Sold, Weight, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="variant-stock" className="text-xs font-semibold">
                Stock <span className="text-red-500">*</span>
              </Label>
              <Input
                id="variant-stock"
                type="number"
                min="0"
                placeholder="20"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500">Sold (Readonly)</Label>
              <Input disabled readOnly value={sold} className="text-xs bg-gray-100 dark:bg-gray-800" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="variant-weight" className="text-xs font-semibold">
                Weight (kg)
              </Label>
              <Input
                id="variant-weight"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="variant-status" className="text-xs font-semibold">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(val: string | null) => setStatus((val || 'active') as 'active' | 'inactive')}
              >
                <SelectTrigger id="variant-status" className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingVariant
                ? 'Update Variant'
                : 'Create Variant'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        description="Are you sure you want to delete this variant? This will permanently remove its inventory data."
      />
    </>
  );
}
