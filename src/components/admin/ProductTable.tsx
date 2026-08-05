'use client';

import React, { useState } from 'react';
import { Package, Plus, Edit3, Trash2, Star } from 'lucide-react';
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductStatus,
  ProductGender,
  ProductSEO,
} from '@/types';
import { defaultProductSEO } from '@/types';
import { useApiGet, useApiPost, useApiPut, useApiDelete, createQueryKeys } from '@/hooks';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/services/product.service';
import DataTable, { ColumnDef } from '@/app/admin/_components/common/DataTable';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const productQueryKeys = createQueryKeys('admin-products');

interface SpecificationRow {
  key: string;
  value: string;
}

const emptySpecificationRow = (): SpecificationRow => ({ key: '', value: '' });

const formatPrice = (value: number | undefined) =>
  value === undefined || value === null ? '—' : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const splitCsv = (value: string): string[] =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const parseVariantsJson = (raw: string): CreateProductPayload['variants'] => {
  if (!raw.trim()) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const defaultSeoState: ProductSEO = { ...defaultProductSEO };

export default function ProductTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [collection, setCollection] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [gallery, setGallery] = useState('');
  const [video, setVideo] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('');
  const [lowStock, setLowStock] = useState('');
  const [sold, setSold] = useState('');
  const [status, setStatus] = useState<ProductStatus>('active');
  const [gender, setGender] = useState<ProductGender>('');
  const [material, setMaterial] = useState('');
  const [careInstruction, setCareInstruction] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [specificationRows, setSpecificationRows] = useState<SpecificationRow[]>([emptySpecificationRow()]);
  const [variantsJson, setVariantsJson] = useState('');
  const [seo, setSeo] = useState<ProductSEO>({ ...defaultSeoState });

  const { data: productResponse, isLoading, refetch } = useApiGet<Product[]>({
    queryKey: productQueryKeys.list({ search, page, limit }),
    queryFn: () => getProducts({ page, limit, search }),
  });

  const products = productResponse?.data || [];
  const meta = productResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const createMutation = useApiPost<Product, CreateProductPayload>({
    mutationFn: createProduct,
    invalidateKeys: [productQueryKeys.all, productQueryKeys.lists()],
    successMessage: 'Product created successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const updateMutation = useApiPut<Product, UpdateProductPayload>({
    mutationFn: updateProduct,
    invalidateKeys: [productQueryKeys.all, productQueryKeys.lists()],
    successMessage: 'Product updated successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const deleteMutation = useApiDelete({
    mutationFn: deleteProduct,
    invalidateKeys: [productQueryKeys.all, productQueryKeys.lists()],
    successMessage: 'Product deleted successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const resetForm = () => {
    setName('');
    setSlug('');
    setSku('');
    setBarcode('');
    setShortDescription('');
    setDescription('');
    setCategory('');
    setBrand('');
    setCollection('');
    setTags('');
    setFeaturedImage('');
    setGallery('');
    setVideo('');
    setRegularPrice('');
    setSalePrice('');
    setCostPrice('');
    setStock('');
    setLowStock('');
    setSold('');
    setStatus('active');
    setGender('');
    setMaterial('');
    setCareInstruction('');
    setIsFeatured(false);
    setIsNewArrival(false);
    setIsTrending(false);
    setSpecificationRows([emptySpecificationRow()]);
    setVariantsJson('');
    setSeo({ ...defaultSeoState });
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setSlug(product.slug);
    setSku(product.sku);
    setBarcode(product.barcode || '');
    setShortDescription(product.shortDescription || '');
    setDescription(product.description || '');
    setCategory(product.category || '');
    setBrand(product.brand || '');
    setCollection(product.collection || '');
    setTags((product.tags || []).join(', '));
    setFeaturedImage(product.featuredImage || '');
    setGallery((product.gallery || []).join(', '));
    setVideo(product.video || '');
    setRegularPrice(product.regularPrice !== undefined ? String(product.regularPrice) : '');
    setSalePrice(product.salePrice !== undefined && product.salePrice !== null ? String(product.salePrice) : '');
    setCostPrice(product.costPrice !== undefined && product.costPrice !== null ? String(product.costPrice) : '');
    setStock(product.stock !== undefined ? String(product.stock) : '');
    setLowStock(product.lowStock !== undefined ? String(product.lowStock) : '');
    setSold(product.sold !== undefined ? String(product.sold) : '');
    setStatus(product.status || 'active');
    setGender(product.gender || '');
    setMaterial(product.material || '');
    setCareInstruction(product.careInstruction || '');
    setIsFeatured(product.isFeatured || false);
    setIsNewArrival(product.isNewArrival || false);
    setIsTrending(product.isTrending || false);
    const rows = Object.entries(product.specifications || {}).map(([key, value]) => ({ key, value }));
    setSpecificationRows(rows.length > 0 ? rows : [emptySpecificationRow()]);
    setVariantsJson('');
    setSeo({ ...defaultSeoState, ...(product.seo || {}) });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  const addSpecificationRow = () => setSpecificationRows((rows) => [...rows, emptySpecificationRow()]);

  const updateSpecificationRow = (idx: number, field: 'key' | 'value', value: string) =>
    setSpecificationRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));

  const removeSpecificationRow = (idx: number) =>
    setSpecificationRows((rows) => (rows.length === 1 ? rows : rows.filter((_, i) => i !== idx)));

  const buildSpecifications = (): Record<string, string> => {
    const specs: Record<string, string> = {};
    specificationRows.forEach((row) => {
      const key = row.key.trim();
      const value = row.value.trim();
      if (key && value) specs[key] = value;
    });
    return specs;
  };

  const toFiniteOrUndefined = (raw: string): number | undefined => {
    if (raw === '') return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameValue = name.trim();
    const skuValue = sku.trim();
    const regularPriceValue = toFiniteOrUndefined(regularPrice);
    const stockValue = toFiniteOrUndefined(stock);

    if (!nameValue || !skuValue || regularPriceValue === undefined || stockValue === undefined) return;
    if (regularPriceValue < 0 || stockValue < 0) return;

    const salePriceValue = toFiniteOrUndefined(salePrice);
    const costPriceValue = toFiniteOrUndefined(costPrice);
    const lowStockValue = toFiniteOrUndefined(lowStock);
    const soldValue = toFiniteOrUndefined(sold);
    if (salePriceValue !== undefined && salePriceValue < 0) return;
    if (costPriceValue !== undefined && costPriceValue < 0) return;
    if (lowStockValue !== undefined && lowStockValue < 0) return;
    if (soldValue !== undefined && soldValue < 0) return;

    const payload: CreateProductPayload = {
      name: nameValue,
      slug: slug.trim() || undefined,
      sku: skuValue,
      barcode: barcode.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      category: category.trim(),
      brand: brand.trim(),
      collection: collection.trim(),
      tags: splitCsv(tags),
      featuredImage: featuredImage.trim(),
      gallery: splitCsv(gallery),
      video: video.trim(),
      regularPrice: regularPriceValue,
      salePrice: salePriceValue,
      costPrice: costPriceValue,
      stock: stockValue,
      lowStock: lowStockValue,
      sold: soldValue,
      status,
      isFeatured,
      isNewArrival,
      isTrending,
      gender,
      material: material.trim(),
      careInstruction: careInstruction.trim(),
      specifications: buildSpecifications(),
      variants: parseVariantsJson(variantsJson),
      seo,
    };

    if (editingProduct) {
      updateMutation.mutate({ _id: editingProduct._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (product) => (
        <div className="flex items-center gap-3">
          {product.featuredImage ? (
            <img
              src={product.featuredImage}
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
              <Package className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</div>
            <code className="font-mono text-[11px] text-gray-400">{product.sku}</code>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (product) =>
        product.category ? (
          <span className="text-gray-700 dark:text-gray-300">{product.category}</span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (product) => (
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(product.regularPrice)}</span>
          {product.salePrice !== undefined && product.salePrice !== null && product.salePrice > 0 && (
            <span className="text-[11px] text-gray-400 line-through">{formatPrice(product.salePrice)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product) => {
        const label =
          product.stock <= 0
            ? 'Out of stock'
            : product.lowStock > 0 && product.stock <= product.lowStock
              ? `Low stock (${product.stock})`
              : `${product.stock} in stock`;
        const tone =
          product.stock <= 0
            ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
            : product.lowStock > 0 && product.stock <= product.lowStock
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              : 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${tone}`}>
            {label}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (product) => {
        const tones: Record<ProductStatus, string> = {
          active: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
          draft: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
          archived: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${tones[product.status || 'draft']}`}>
            {product.status || 'draft'}
          </span>
        );
      },
    },
    {
      key: 'featured',
      header: 'Featured',
      align: 'center',
      render: (product) =>
        product.isFeatured ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" /> Featured
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (product) => new Date(product.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (product) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEditModal(product)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Edit"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(product._id)}
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
        title="Products"
        description="Manage your product catalog, pricing, inventory and SEO."
        columns={columns}
        data={products}
        keyExtractor={(product) => product._id}
        loading={isLoading}
        emptyMessage="No products found. Add your first product!"
        emptyIcon={<Package className="h-10 w-10 mb-2 text-gray-400 opacity-50" />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search products...',
        }}
        headerActions={
          <button
            onClick={openCreateModal}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Product
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
          itemUnitName: 'products',
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Create New Product'}
        maxWidth="3xl"
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
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basics */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Basics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Name</Label>
                <Input
                  id="product-name"
                  placeholder="e.g. Classic Cotton Tee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-sku">SKU</Label>
                <Input
                  id="product-sku"
                  placeholder="e.g. TSH-COT-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-slug">Slug</Label>
                <Input
                  id="product-slug"
                  placeholder="Auto-generated from name"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-barcode">Barcode</Label>
                <Input
                  id="product-barcode"
                  placeholder="e.g. 8801234567890"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="product-short-description">Short Description</Label>
                <Input
                  id="product-short-description"
                  placeholder="One-line summary shown on cards"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="product-description">Description</Label>
                <textarea
                  id="product-description"
                  rows={3}
                  placeholder="Full product description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Organization</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-category">Category</Label>
                <Input
                  id="product-category"
                  placeholder="Category ID"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-brand">Brand</Label>
                <Input
                  id="product-brand"
                  placeholder="Brand ID"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-collection">Collection</Label>
                <Input
                  id="product-collection"
                  placeholder="Collection ID"
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-tags">Tags</Label>
                <Input
                  id="product-tags"
                  placeholder="Comma separated tag IDs"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Media</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-featured-image">Featured Image URL</Label>
                <Input
                  id="product-featured-image"
                  placeholder="https://..."
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-video">Video URL</Label>
                <Input
                  id="product-video"
                  placeholder="https://..."
                  value={video}
                  onChange={(e) => setVideo(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="product-gallery">Gallery URLs</Label>
                <Input
                  id="product-gallery"
                  placeholder="Comma separated image URLs"
                  value={gallery}
                  onChange={(e) => setGallery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-regular-price">Regular Price ($)</Label>
                <Input
                  id="product-regular-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 59.99"
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-sale-price">Sale Price ($)</Label>
                <Input
                  id="product-sale-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-cost-price">Cost Price ($)</Label>
                <Input
                  id="product-cost-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-stock">Stock</Label>
                <Input
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 100"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-low-stock">Low Stock Threshold</Label>
                <Input
                  id="product-low-stock"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 10"
                  value={lowStock}
                  onChange={(e) => setLowStock(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-sold">Sold</Label>
                <Input
                  id="product-sold"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 42"
                  value={sold}
                  onChange={(e) => setSold(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Attributes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-status">Status</Label>
                <select
                  id="product-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProductStatus)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-gender">Gender</Label>
                <select
                  id="product-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as ProductGender)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100"
                >
                  <option value="">None</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                  <option value="kids">Kids</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-material">Material</Label>
                <Input
                  id="product-material"
                  placeholder="e.g. 100% Cotton"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-care-instruction">Care Instruction</Label>
                <Input
                  id="product-care-instruction"
                  placeholder="e.g. Machine wash cold"
                  value={careInstruction}
                  onChange={(e) => setCareInstruction(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <input
                  id="product-is-featured"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-black dark:text-white focus:ring-black/20"
                />
                <Label htmlFor="product-is-featured">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="product-is-new-arrival"
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-black dark:text-white focus:ring-black/20"
                />
                <Label htmlFor="product-is-new-arrival">New Arrival</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="product-is-trending"
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-black dark:text-white focus:ring-black/20"
                />
                <Label htmlFor="product-is-trending">Trending</Label>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Specifications</h3>
            <div className="space-y-2">
              {specificationRows.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="e.g. Material"
                    value={row.key}
                    onChange={(e) => updateSpecificationRow(idx, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="e.g. Cotton"
                    value={row.value}
                    onChange={(e) => updateSpecificationRow(idx, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecificationRow(idx)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    title="Remove specification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSpecificationRow}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
            >
              <Plus className="h-3.5 w-3.5" /> Add Specification
            </button>
          </div>

          {/* Variants */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Variants</h3>
            <div className="space-y-2">
              <Label htmlFor="product-variants">Variants (JSON array)</Label>
              <textarea
                id="product-variants"
                rows={3}
                placeholder='e.g. [{"sku":"TSH-COT-BLK-XL","price":59.99,"stock":25}]'
                value={variantsJson}
                onChange={(e) => setVariantsJson(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100"
              />
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                Each variant needs a SKU, price and stock. Leave empty to create a product without variants.
              </p>
            </div>
          </div>

          {/* SEO */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">SEO</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-seo-title">SEO Title</Label>
                <Input
                  id="product-seo-title"
                  placeholder="e.g. Classic Cotton Tee"
                  value={seo.title}
                  onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-seo-description">SEO Description</Label>
                <Input
                  id="product-seo-description"
                  placeholder="Short SEO description"
                  value={seo.description}
                  onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-seo-keywords">SEO Keywords</Label>
                <Input
                  id="product-seo-keywords"
                  placeholder="Comma separated keywords"
                  value={seo.keywords.join(', ')}
                  onChange={(e) => setSeo({ ...seo, keywords: splitCsv(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-seo-canonical">Canonical URL</Label>
                <Input
                  id="product-seo-canonical"
                  placeholder="https://..."
                  value={seo.canonical}
                  onChange={(e) => setSeo({ ...seo, canonical: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-seo-og-image">OG Image URL</Label>
                <Input
                  id="product-seo-og-image"
                  placeholder="https://..."
                  value={seo.ogImage}
                  onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-seo-robots">Robots</Label>
                <Input
                  id="product-seo-robots"
                  placeholder="e.g. index"
                  value={seo.robots}
                  onChange={(e) => setSeo({ ...seo, robots: e.target.value })}
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
