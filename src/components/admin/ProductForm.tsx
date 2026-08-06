'use client';

import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  Product,
  CreateProductPayload,
  ProductStatus,
  ProductGender,
  ProductSEO,
} from '@/types';
import { defaultProductSEO } from '@/types';
import { useApiGet, useApiPost, useApiPut, createQueryKeys } from '@/hooks';
import { getProduct, createProduct, updateProduct } from '@/services/product.service';
import Stepper, { StepperStep } from '@/components/ui/Stepper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GalleryPickerButton from './GalleryPickerButton';

const productQueryKeys = createQueryKeys('admin-products');

const steps: StepperStep[] = [
  { id: 'basics', label: 'Basics & Organization' },
  { id: 'media', label: 'Media & Pricing' },
  { id: 'attributes', label: 'Attributes & SEO' },
];

interface SpecificationRow {
  key: string;
  value: string;
}

const emptySpecificationRow = (): SpecificationRow => ({ key: '', value: '' });

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

const toFiniteOrUndefined = (raw: string): number | undefined => {
  if (raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
};

const inputClass =
  'w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100';
const textareaClass = `${inputClass} font-mono`;
const sectionTitleClass =
  'text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500';

interface ProductFormProps {
  /** When provided, the form fetches this product and updates it on submit. */
  productId?: string;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const editing = Boolean(productId);

  const { data: productResponse, isLoading, isError } = useApiGet<Product>({
    queryKey: productQueryKeys.detail(productId ?? 'none'),
    queryFn: () => getProduct(productId as string),
    options: { enabled: Boolean(productId) },
  });

  const product = productResponse?.data;

  if (editing && (isLoading || (!product && !isError))) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm">Loading product...</span>
      </div>
    );
  }

  if (editing && isError) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
          Failed to load this product.
        </p>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mt-3"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Products
        </Link>
      </div>
    );
  }

  return (
    <ProductFormInner
      key={editing && product ? product._id : 'new'}
      initialProduct={product}
    />
  );
}

interface ProductFormInnerProps {
  initialProduct?: Product;
}

function ProductFormInner({ initialProduct }: ProductFormInnerProps) {
  const editing = Boolean(initialProduct);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const [name, setName] = useState(initialProduct?.name ?? '');
  const [slug, setSlug] = useState(initialProduct?.slug ?? '');
  const [sku, setSku] = useState(initialProduct?.sku ?? '');
  const [barcode, setBarcode] = useState(initialProduct?.barcode || '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [category, setCategory] = useState(initialProduct?.category || '');
  const [brand, setBrand] = useState(initialProduct?.brand || '');
  const [collection, setCollection] = useState(initialProduct?.collection || '');
  const [tags, setTags] = useState((initialProduct?.tags || []).join(', '));
  const [featuredImage, setFeaturedImage] = useState(initialProduct?.featuredImage || '');
  const [gallery, setGallery] = useState((initialProduct?.gallery || []).join(', '));
  const [video, setVideo] = useState(initialProduct?.video || '');
  const [regularPrice, setRegularPrice] = useState(
    initialProduct?.regularPrice !== undefined ? String(initialProduct.regularPrice) : ''
  );
  const [salePrice, setSalePrice] = useState(
    initialProduct?.salePrice !== undefined && initialProduct.salePrice !== null
      ? String(initialProduct.salePrice)
      : ''
  );
  const [costPrice, setCostPrice] = useState(
    initialProduct?.costPrice !== undefined && initialProduct.costPrice !== null
      ? String(initialProduct.costPrice)
      : ''
  );
  const [stock, setStock] = useState(
    initialProduct?.stock !== undefined ? String(initialProduct.stock) : ''
  );
  const [lowStock, setLowStock] = useState(
    initialProduct?.lowStock !== undefined ? String(initialProduct.lowStock) : ''
  );
  const [sold, setSold] = useState(
    initialProduct?.sold !== undefined ? String(initialProduct.sold) : ''
  );
  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status || 'active');
  const [gender, setGender] = useState<ProductGender>(initialProduct?.gender || '');
  const [material, setMaterial] = useState(initialProduct?.material || '');
  const [careInstruction, setCareInstruction] = useState(initialProduct?.careInstruction || '');
  const [isFeatured, setIsFeatured] = useState(initialProduct?.isFeatured || false);
  const [isNewArrival, setIsNewArrival] = useState(initialProduct?.isNewArrival || false);
  const [isTrending, setIsTrending] = useState(initialProduct?.isTrending || false);
  const [specificationRows, setSpecificationRows] = useState<SpecificationRow[]>(() => {
    const rows = Object.entries(initialProduct?.specifications || {}).map(([key, value]) => ({ key, value }));
    return rows.length > 0 ? rows : [emptySpecificationRow()];
  });
  const [variantsJson, setVariantsJson] = useState('');
  const [seo, setSeo] = useState<ProductSEO>({
    ...defaultProductSEO,
    ...(initialProduct?.seo || {}),
  });

  const createMutation = useApiPost<Product, CreateProductPayload>({
    mutationFn: createProduct,
    invalidateKeys: [productQueryKeys.all, productQueryKeys.lists()],
    successMessage: 'Product created successfully',
    options: {
      onSuccess: () => {
        router.push('/admin/products');
        router.refresh();
      },
    },
  });

  const updateMutation = useApiPut<Product, { _id: string } & CreateProductPayload>({
    mutationFn: updateProduct,
    invalidateKeys: [productQueryKeys.all, productQueryKeys.lists()],
    successMessage: 'Product updated successfully',
    options: {
      onSuccess: () => {
        router.push('/admin/products');
        router.refresh();
      },
    },
  });

  const nameValue = name.trim();
  const skuValue = sku.trim();
  const regularPriceValue = toFiniteOrUndefined(regularPrice);
  const stockValue = toFiniteOrUndefined(stock);
  const basicsValid = Boolean(nameValue && skuValue);
  const pricingValid =
    regularPriceValue !== undefined &&
    regularPriceValue >= 0 &&
    stockValue !== undefined &&
    stockValue >= 0;
  const isStepValid = (step: number) =>
    step === 0 ? basicsValid : step === 1 ? pricingValid : true;
  const formValid = basicsValid && pricingValid;

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;

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
      regularPrice: regularPriceValue as number,
      salePrice: salePriceValue,
      costPrice: costPriceValue,
      stock: stockValue as number,
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

    if (editing && initialProduct) {
      updateMutation.mutate({ _id: initialProduct._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-6">
      {/* Page header */}
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
          {editing ? 'Edit Product' : 'Create New Product'}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {editing
            ? 'Update the product details below, then save your changes.'
            : 'Complete the steps below to add a new product to your catalog.'}
        </p>
      </div>

      {/* Stepper */}
      <Stepper steps={steps} currentStep={currentStep} onStepChange={(step) => setCurrentStep(step)} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="p-6 space-y-8">
          {/* Step 1 — Basics & Organization */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className={sectionTitleClass}>Basics</h3>
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
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={sectionTitleClass}>Organization</h3>
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
            </div>
          )}

          {/* Step 2 — Media & Pricing */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className={sectionTitleClass}>Media</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-featured-image">Featured Image URL</Label>
                    <Input
                      id="product-featured-image"
                      placeholder="https://..."
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                    />
                    <GalleryPickerButton
                      onSelect={(urls) => {
                        if (urls[0]) setFeaturedImage(urls[0]);
                      }}
                      selectedUrls={featuredImage ? [featuredImage] : []}
                      label="Browse Gallery"
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
                    <GalleryPickerButton
                      multiple
                      onSelect={(urls) => {
                        setGallery((prev) => {
                          const existing = splitCsv(prev);
                          const merged = [...existing];
                          urls.forEach((u) => {
                            if (!merged.includes(u)) merged.push(u);
                          });
                          return merged.join(', ');
                        });
                      }}
                      selectedUrls={splitCsv(gallery)}
                      label="Browse Gallery (multi-select)"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={sectionTitleClass}>Pricing & Inventory</h3>
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
            </div>
          )}

          {/* Step 3 — Attributes & SEO */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className={sectionTitleClass}>Attributes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-status">Status</Label>
                    <select
                      id="product-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProductStatus)}
                      className={inputClass}
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
                      className={inputClass}
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

              <div className="space-y-4">
                <h3 className={sectionTitleClass}>Specifications</h3>
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

              <div className="space-y-4">
                <h3 className={sectionTitleClass}>Variants</h3>
                <div className="space-y-2">
                  <Label htmlFor="product-variants">Variants (JSON array)</Label>
                  <textarea
                    id="product-variants"
                    rows={3}
                    placeholder='e.g. [{"sku":"TSH-COT-BLK-XL","price":59.99,"stock":25}]'
                    value={variantsJson}
                    onChange={(e) => setVariantsJson(e.target.value)}
                    className={textareaClass}
                  />
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    Each variant needs a SKU, price and stock. Leave empty to create a product without variants.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={sectionTitleClass}>SEO</h3>
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
                    <GalleryPickerButton
                      onSelect={(urls) => {
                        if (urls[0]) setSeo({ ...seo, ogImage: urls[0] });
                      }}
                      selectedUrls={seo.ogImage ? [seo.ogImage] : []}
                      label="Browse Gallery"
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
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!isStepValid(currentStep)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!formValid || isSaving}
              className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
