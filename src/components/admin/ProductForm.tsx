'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  Image as ImageIcon,
  Info,
  Loader2,
  Plus,
  Tag as TagIcon,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  Product,
  CreateProductPayload,
  ProductStatus,
  ProductGender,
  ProductSEO,
  Category,
  Brand,
  CollectionItem,
  Tag,
} from '@/types';
import { defaultProductSEO } from '@/types';
import { useApiGet, useApiPost, useApiPut, createQueryKeys } from '@/hooks';
import { getProduct, createProduct, updateProduct } from '@/services/product.service';
import { getCategories } from '@/services/category.service';
import { getBrands } from '@/services/brand.service';
import { getCollections } from '@/services/collection.service';
import { getTags } from '@/services/tag.service';
import Stepper, { StepperStep } from '@/components/ui/Stepper';
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
  'w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100 shadow-sm';
const textareaClass = `${inputClass} font-mono`;
const sectionTitleClass =
  'text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500';

interface ProductFormProps {
  /** When provided, the form fetches this product and updates it on submit. */
  productId?: string;
}

interface ProductImageSlotProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  selectedUrls: string[];
  folder?: string;
}

function InfoLabel({
  htmlFor,
  children,
  info,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  info: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{children}</Label>
      <span
        tabIndex={0}
        title={info}
        aria-label={info}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 outline-none transition-colors hover:text-gray-700 focus-visible:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 dark:focus-visible:text-gray-200"
      >
        <Info className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}

function ProductImageSlot({
  label,
  value,
  onChange,
  onRemove,
  selectedUrls,
  folder = 'velour/products',
}: ProductImageSlotProps) {
  const [uploading, setUploading] = useState(false);
  const inputId = React.useId();
  const slotLabel = label || 'image';

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success && data.data?.url) {
        onChange(data.data.url);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
      <div className="group relative h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {value ? (
          <Image
            src={value}
            alt={slotLabel}
            fill
            sizes="112px"
            className="h-full w-full object-cover"
          />
        ) : (
          <button
            type="button"
            onClick={() => document.getElementById(inputId)?.click()}
            className="flex h-full w-full items-center justify-center text-gray-300 transition-colors hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400"
            aria-label={`Upload ${slotLabel}`}
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImageIcon className="h-6 w-6" />
            )}
          </button>
        )}

        <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => document.getElementById(inputId)?.click()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-800 shadow-sm transition-colors hover:bg-gray-100"
            aria-label={`Upload ${slotLabel}`}
            title={label ? `Upload ${label}` : 'Upload image'}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </button>
          <GalleryPickerButton
            onSelect={(urls) => {
              if (urls[0]) onChange(urls[0]);
            }}
            folder={folder}
            selectedUrls={selectedUrls}
            label=""
            className="h-8 w-8 rounded-full border-0 bg-white p-0 text-gray-800 shadow-sm hover:bg-gray-100"
          />
          {value && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-sm transition-colors hover:bg-gray-100"
              aria-label={`Remove ${slotLabel}`}
              title={label ? `Remove ${label}` : 'Remove image'}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadImage(file);
          e.currentTarget.value = '';
        }}
        className="hidden"
      />
    </div>
  );
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
  const [tags, setTags] = useState<string[]>(initialProduct?.tags || []);
  const [featuredImage, setFeaturedImage] = useState(
    initialProduct?.media?.featuredImage || initialProduct?.featuredImage || ''
  );
  const [gallery, setGallery] = useState(
    (initialProduct?.media?.gallery || initialProduct?.gallery || []).join(', ')
  );
  const [video, setVideo] = useState(
    initialProduct?.media?.videoUrl || initialProduct?.video || ''
  );
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

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
  const [seoTitleOptions, setSeoTitleOptions] = useState<string[]>(() =>
    initialProduct?.seo?.title ? [initialProduct.seo.title] : ['']
  );
  const [keywordDraft, setKeywordDraft] = useState('');

  const { data: categoriesResponse } = useApiGet<Category[]>({
    queryKey: ['admin-categories-select'],
    queryFn: () => getCategories({ limit: 100 }),
  });
  const { data: brandsResponse } = useApiGet<Brand[]>({
    queryKey: ['admin-brands-select'],
    queryFn: () => getBrands({ limit: 100 }),
  });
  const { data: collectionsResponse } = useApiGet<CollectionItem[]>({
    queryKey: ['admin-collections-select'],
    queryFn: () => getCollections({ limit: 100 }),
  });
  const { data: tagsResponse } = useApiGet<Tag[]>({
    queryKey: ['admin-tags-select'],
    queryFn: () => getTags({ limit: 100 }),
  });

  const categoriesList = categoriesResponse?.data || [];
  const brandsList = brandsResponse?.data || [];
  const collectionsList = collectionsResponse?.data || [];
  const tagsList = tagsResponse?.data || [];
  const availableTags = tagsList.filter((tag) => !tags.includes(tag.name));
  const galleryUrls = splitCsv(gallery);
  const selectedImageUrls = [featuredImage, ...galleryUrls].filter(Boolean);

  const updateGalleryImage = (index: number, url: string) => {
    const nextGallery = [...galleryUrls];
    nextGallery[index] = url;
    setGallery(nextGallery.filter(Boolean).join(', '));
  };

  const removeGalleryImage = (index: number) => {
    setGallery(galleryUrls.filter((_, i) => i !== index).join(', '));
  };

  const addGalleryImages = (urls: string[]) => {
    const merged = [...galleryUrls];
    urls.forEach((url) => {
      if (url && url !== featuredImage && !merged.includes(url)) merged.push(url);
    });
    setGallery(merged.join(', '));
  };

  const handleFeaturedUpload = async (file: File) => {
    setUploadingFeatured(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'velour/products');

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success && data.data?.url) {
        setFeaturedImage(data.data.url);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploadingFeatured(false);
    }
  };

  const handleGalleryFilesUpload = async (files: File[]) => {
    setUploadingGallery(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'velour/products');

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success && data.data?.url) {
          addGalleryImages([data.data.url]);
        }
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploadingGallery(false);
    }
  };

  const updateSeoTitleOption = (index: number, value: string) => {
    setSeoTitleOptions((options) => {
      const nextOptions = options.map((option, i) => (i === index ? value : option));
      setSeo({ ...seo, title: nextOptions.find((option) => option.trim())?.trim() || '' });
      return nextOptions;
    });
  };

  const addSeoTitleOption = () => {
    setSeoTitleOptions((options) => (options.length >= 5 ? options : [...options, '']));
  };

  const removeSeoTitleOption = (index: number) => {
    setSeoTitleOptions((options) => {
      const nextOptions = options.length === 1 ? [''] : options.filter((_, i) => i !== index);
      setSeo({ ...seo, title: nextOptions.find((option) => option.trim())?.trim() || '' });
      return nextOptions;
    });
  };

  const addSeoKeyword = (value: string) => {
    const nextKeyword = value.trim();
    if (!nextKeyword || seo.keywords.includes(nextKeyword)) return;
    setSeo({ ...seo, keywords: [...seo.keywords, nextKeyword] });
    setKeywordDraft('');
  };

  const removeSeoKeyword = (keyword: string) => {
    setSeo({ ...seo, keywords: seo.keywords.filter((item) => item !== keyword) });
  };

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

    const galleryList = splitCsv(gallery);
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
      tags,
      featuredImage: featuredImage.trim(),
      gallery: galleryList,
      video: video.trim(),
      media: {
        featuredImage: featuredImage.trim(),
        gallery: galleryList,
        videoUrl: video.trim(),
      },
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
                    <Select
                      value={category || null}
                      onValueChange={(value) => setCategory(value ?? '')}
                    >
                      <SelectTrigger id="product-category" className="w-full">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Select Category</SelectItem>
                        {categoriesList.map((c) => (
                          <SelectItem key={c._id || c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                        {category && !categoriesList.some((c) => c.name === category) && (
                          <SelectItem value={category}>{category}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-brand">Brand</Label>
                    <Select
                      value={brand || null}
                      onValueChange={(value) => setBrand(value ?? '')}
                    >
                      <SelectTrigger id="product-brand" className="w-full">
                        <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Select Brand</SelectItem>
                        {brandsList.map((b) => (
                          <SelectItem key={b._id || b.name} value={b.name}>
                            {b.name}
                          </SelectItem>
                        ))}
                        {brand && !brandsList.some((b) => b.name === brand) && (
                          <SelectItem value={brand}>{brand}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-collection">Collection</Label>
                    <Select
                      value={collection || null}
                      onValueChange={(value) => setCollection(value ?? '')}
                    >
                      <SelectTrigger id="product-collection" className="w-full">
                        <SelectValue placeholder="Select Collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Select Collection</SelectItem>
                        {collectionsList.map((colItem) => (
                          <SelectItem key={colItem._id || colItem.name} value={colItem.name}>
                            {colItem.name}
                          </SelectItem>
                        ))}
                        {collection && !collectionsList.some((colItem) => colItem.name === collection) && (
                          <SelectItem value={collection}>{collection}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="space-y-2">
                      {availableTags.length > 0 && (
                        <Select
                          value={null}
                          onValueChange={(value) => {
                            if (value) {
                              setTags((currentTags) =>
                                currentTags.includes(value) ? currentTags : [...currentTags, value]
                              );
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select tag to add..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTags.map((t) => (
                              <SelectItem key={t._id || t.name} value={t.name}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {tags.length > 0 && (
                        <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            >
                              <TagIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                              <span className="truncate">{tag}</span>
                              <button
                                type="button"
                                onClick={() => setTags((currentTags) => currentTags.filter((t) => t !== tag))}
                                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                                aria-label={`Remove ${tag}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Media & Pricing */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className={sectionTitleClass}>MEDIA</h3>
                <div className="space-y-6">
                  {/* Featured Image * */}
                  <div className="space-y-2">
                    <Label htmlFor="featured-image-file">Featured Image *</Label>
                    {featuredImage ? (
                      <div className="group relative h-40 w-full sm:w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <Image
                          src={featuredImage}
                          alt="Featured Image"
                          fill
                          sizes="256px"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => document.getElementById('featured-image-file')?.click()}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-800 shadow-sm transition-colors hover:bg-gray-100"
                            aria-label="Change featured image"
                            title="Change image"
                          >
                            <Upload className="h-4 w-4" />
                          </button>
                          <GalleryPickerButton
                            onSelect={(urls) => {
                              if (urls[0]) setFeaturedImage(urls[0]);
                            }}
                            folder="velour/products"
                            selectedUrls={selectedImageUrls}
                            label=""
                            className="h-8 w-8 rounded-full border-0 bg-white p-0 text-gray-800 shadow-sm hover:bg-gray-100"
                          />
                          <button
                            type="button"
                            onClick={() => setFeaturedImage('')}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-sm transition-colors hover:bg-gray-100"
                            aria-label="Remove featured image"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 p-6 min-h-[130px] text-center transition-colors hover:border-gray-400 dark:hover:border-gray-600">
                        {uploadingFeatured ? (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Uploading...
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => document.getElementById('featured-image-file')?.click()}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                              >
                                <Upload className="h-4 w-4 text-gray-500" />
                                Upload Image
                              </button>
                              <GalleryPickerButton
                                onSelect={(urls) => {
                                  if (urls[0]) setFeaturedImage(urls[0]);
                                }}
                                folder="velour/products"
                                selectedUrls={selectedImageUrls}
                                label="Pick from Library"
                                className="h-8 px-3 text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <input
                      id="featured-image-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFeaturedUpload(file);
                        e.currentTarget.value = '';
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Product Gallery */}
                  <div className="space-y-2">
                    <Label>Product Gallery</Label>
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Plus tile */}
                      <div className="relative group flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        {uploadingGallery ? (
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => document.getElementById('gallery-files-input')?.click()}
                              className="flex h-full w-full flex-col items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              title="Add gallery image"
                              aria-label="Add gallery image"
                            >
                              <Plus className="h-6 w-6" />
                            </button>
                            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 rounded-xl">
                              <button
                                type="button"
                                onClick={() => document.getElementById('gallery-files-input')?.click()}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-800 shadow-sm hover:bg-gray-100"
                                title="Upload file"
                              >
                                <Upload className="h-3.5 w-3.5" />
                              </button>
                              <GalleryPickerButton
                                multiple
                                onSelect={addGalleryImages}
                                selectedUrls={selectedImageUrls}
                                label=""
                                className="h-7 w-7 rounded-full border-0 bg-white p-0 text-gray-800 shadow-sm hover:bg-gray-100"
                              />
                            </div>
                          </>
                        )}
                        <input
                          id="gallery-files-input"
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) handleGalleryFilesUpload(files);
                            e.currentTarget.value = '';
                          }}
                          className="hidden"
                        />
                      </div>

                      {/* Gallery items */}
                      {galleryUrls.map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className="group relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
                        >
                          <Image
                            src={url}
                            alt={`Gallery image ${index + 1}`}
                            fill
                            sizes="96px"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                            <GalleryPickerButton
                              onSelect={(urls) => {
                                if (urls[0]) updateGalleryImage(index, urls[0]);
                              }}
                              folder="velour/products"
                              selectedUrls={selectedImageUrls}
                              label=""
                              className="h-7 w-7 rounded-full border-0 bg-white p-0 text-gray-800 shadow-sm hover:bg-gray-100"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-500 shadow-sm transition-colors hover:bg-gray-100"
                              aria-label={`Remove gallery image ${index + 1}`}
                              title="Remove image"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Video URL */}
                  <div className="space-y-2">
                    <Label htmlFor="product-video">Video URL</Label>
                    <Input
                      id="product-video"
                      placeholder="https://..."
                      value={video}
                      onChange={(e) => setVideo(e.target.value)}
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
                    <InfoLabel
                      htmlFor="product-seo-title-0"
                      info="Search result title. You can draft up to 5 options; the first filled option is saved."
                    >
                      SEO Title
                    </InfoLabel>
                    <div className="space-y-2">
                      {seoTitleOptions.map((titleOption, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            id={index === 0 ? 'product-seo-title-0' : undefined}
                            placeholder={`Title option ${index + 1}`}
                            value={titleOption}
                            onChange={(e) => updateSeoTitleOption(index, e.target.value)}
                            className="flex-1"
                          />
                          {seoTitleOptions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSeoTitleOption(index)}
                              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                              aria-label={`Remove SEO title option ${index + 1}`}
                              title="Remove title option"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {seoTitleOptions.length < 5 && (
                      <button
                        type="button"
                        onClick={addSeoTitleOption}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 transition-colors hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Title Option
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <InfoLabel
                      htmlFor="product-seo-description"
                      info="Short summary used by search engines and social previews."
                    >
                      SEO Description
                    </InfoLabel>
                    <Input
                      id="product-seo-description"
                      placeholder="Short SEO description"
                      value={seo.description}
                      onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <InfoLabel
                      htmlFor="product-seo-keywords"
                      info="Add multiple search phrases that describe this product."
                    >
                      SEO Keywords
                    </InfoLabel>
                    <Input
                      id="product-seo-keywords"
                      placeholder="Type keyword and press Enter"
                      value={keywordDraft}
                      onChange={(e) => setKeywordDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          addSeoKeyword(keywordDraft);
                        }
                      }}
                      onBlur={() => addSeoKeyword(keywordDraft)}
                    />
                    {seo.keywords.length > 0 && (
                      <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        {seo.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                          >
                            <TagIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <span className="truncate">{keyword}</span>
                            <button
                              type="button"
                              onClick={() => removeSeoKeyword(keyword)}
                              className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                              aria-label={`Remove ${keyword}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <InfoLabel
                      htmlFor="product-seo-canonical"
                      info="Preferred URL search engines should treat as the main product page."
                    >
                      Canonical URL
                    </InfoLabel>
                    <Input
                      id="product-seo-canonical"
                      placeholder="https://..."
                      value={seo.canonical}
                      onChange={(e) => setSeo({ ...seo, canonical: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <InfoLabel
                      htmlFor="product-seo-og-image"
                      info="Image shown when this product is shared on social platforms."
                    >
                      OG Image URL
                    </InfoLabel>
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
                    <InfoLabel
                      htmlFor="product-seo-robots"
                      info="Controls whether search engines index or follow this product page."
                    >
                      Robots
                    </InfoLabel>
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
