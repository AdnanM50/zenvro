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
  Sparkles,
  Globe,
  Share2,
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
  CreateVariantPayload,
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
  { id: 'attributes', label: 'Variants, Attributes & SEO' },
];

interface SpecificationRow {
  key: string;
  value: string;
}

interface AttributeRow {
  key: string;
  value: string;
}

interface VisualVariantItem {
  id: string;
  sku: string;
  price: string;
  salePrice: string;
  stock: string;
  image: string;
  weight: string;
  attributes: AttributeRow[];
}

const emptySpecificationRow = (): SpecificationRow => ({ key: '', value: '' });

const createEmptyVariant = (index: number): VisualVariantItem => ({
  id: `variant-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
  sku: `VAR-SKU-${index + 1}`,
  price: '',
  salePrice: '',
  stock: '0',
  image: '',
  weight: '',
  attributes: [{ key: 'Color', value: '' }, { key: 'Size', value: '' }],
});

const splitCsv = (value: string): string[] =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const toFiniteOrUndefined = (raw: string): number | undefined => {
  if (raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
};

const inputClass =
  'w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100 shadow-sm';
const sectionTitleClass =
  'text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500';

interface ProductFormProps {
  productId?: string;
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
  
  // Sold count is read-only & automatic
  const soldCount = initialProduct?.sold !== undefined ? initialProduct.sold : 0;

  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status || 'draft');
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

  // Visual Variant Builder state
  const [variantItems, setVariantItems] = useState<VisualVariantItem[]>(() => {
    if (initialProduct?.variants && initialProduct.variants.length > 0) {
      return initialProduct.variants.map((v, i) => ({
        id: v._id || `variant-${i}`,
        sku: v.sku || '',
        price: v.price !== undefined ? String(v.price) : '',
        salePrice: v.salePrice !== undefined && v.salePrice !== null ? String(v.salePrice) : '',
        stock: v.stock !== undefined ? String(v.stock) : '0',
        image: v.image || '',
        weight: v.weight !== undefined && v.weight !== null ? String(v.weight) : '',
        attributes: Object.entries(v.attributes || {}).map(([key, value]) => ({ key, value })),
      }));
    }
    return [];
  });

  // SEO state with focusKeyword, ogTitle, ogDescription, and sitemap settings
  const [seo, setSeo] = useState<ProductSEO>({
    ...defaultProductSEO,
    ...(initialProduct?.seo || {}),
    focusKeyword: initialProduct?.seo?.focusKeyword || '',
    ogTitle: initialProduct?.seo?.ogTitle || '',
    ogDescription: initialProduct?.seo?.ogDescription || '',
    sitemap: {
      include: initialProduct?.seo?.sitemap?.include ?? true,
      priority: initialProduct?.seo?.sitemap?.priority ?? 0.8,
      changefreq: initialProduct?.seo?.sitemap?.changefreq ?? 'weekly',
    },
  });

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

  const addSeoKeyword = (value: string) => {
    const nextKeyword = value.trim();
    if (!nextKeyword || seo.keywords.includes(nextKeyword)) return;
    setSeo({ ...seo, keywords: [...seo.keywords, nextKeyword] });
    setKeywordDraft('');
  };

  const removeSeoKeyword = (keyword: string) => {
    setSeo({ ...seo, keywords: seo.keywords.filter((item) => item !== keyword) });
  };

  // Variant Helpers
  const addVariant = () => {
    setVariantItems((items) => [...items, createEmptyVariant(items.length)]);
  };

  const removeVariant = (id: string) => {
    setVariantItems((items) => items.filter((item) => item.id !== id));
  };

  const updateVariantField = (id: string, field: keyof VisualVariantItem, value: any) => {
    setVariantItems((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addVariantAttribute = (variantId: string) => {
    setVariantItems((items) =>
      items.map((item) =>
        item.id === variantId
          ? { ...item, attributes: [...item.attributes, { key: '', value: '' }] }
          : item
      )
    );
  };

  const updateVariantAttribute = (
    variantId: string,
    attrIdx: number,
    field: 'key' | 'value',
    value: string
  ) => {
    setVariantItems((items) =>
      items.map((item) => {
        if (item.id !== variantId) return item;
        const nextAttrs = item.attributes.map((attr, i) =>
          i === attrIdx ? { ...attr, [field]: value } : attr
        );
        return { ...item, attributes: nextAttrs };
      })
    );
  };

  const removeVariantAttribute = (variantId: string, attrIdx: number) => {
    setVariantItems((items) =>
      items.map((item) => {
        if (item.id !== variantId) return item;
        return { ...item, attributes: item.attributes.filter((_, i) => i !== attrIdx) };
      })
    );
  };

  const buildVariantPayloads = (): CreateVariantPayload[] => {
    return variantItems
      .filter((v) => v.sku.trim())
      .map((v) => {
        const attrMap: Record<string, string> = {};
        v.attributes.forEach((attr) => {
          if (attr.key.trim() && attr.value.trim()) {
            attrMap[attr.key.trim()] = attr.value.trim();
          }
        });

        return {
          sku: v.sku.trim(),
          price: toFiniteOrUndefined(v.price) ?? 0,
          salePrice: toFiniteOrUndefined(v.salePrice),
          stock: toFiniteOrUndefined(v.stock) ?? 0,
          image: v.image.trim(),
          weight: toFiniteOrUndefined(v.weight),
          attributes: attrMap,
        };
      });
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
  
  // Validate variant SKUs
  const variantsValid = variantItems.every(
    (v) => v.sku.trim() !== '' && toFiniteOrUndefined(v.price) !== undefined
  );

  const isStepValid = (step: number) =>
    step === 0 ? basicsValid : step === 1 ? pricingValid : variantsValid;

  const formValid = basicsValid && pricingValid && variantsValid;

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
    if (salePriceValue !== undefined && salePriceValue < 0) return;
    if (costPriceValue !== undefined && costPriceValue < 0) return;
    if (lowStockValue !== undefined && lowStockValue < 0) return;

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
      sold: soldCount,
      status,
      isFeatured,
      isNewArrival,
      isTrending,
      gender,
      material: material.trim(),
      careInstruction: careInstruction.trim(),
      specifications: buildSpecifications(),
      variants: buildVariantPayloads(),
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
            ? 'Update product specifications, SEO metadata, gallery media, and variant attributes.'
            : 'Fill out the product details, organizational hierarchy, gallery images, variants, and SEO attributes.'}
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
                    <Label htmlFor="product-name">Name *</Label>
                    <Input
                      id="product-name"
                      placeholder="e.g. Premium Silk Evening Dress"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-sku">SKU (Required) *</Label>
                    <Input
                      id="product-sku"
                      placeholder="e.g. DR-SLK-001"
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
                <h3 className={sectionTitleClass}>MEDIA (Featured & Gallery Images)</h3>
                <div className="space-y-6">
                  {/* Featured Image */}
                  <div className="space-y-2">
                    <Label htmlFor="featured-image-file">Featured Main Image *</Label>
                    {featuredImage ? (
                      <div className="group relative h-44 w-full sm:w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <Image
                          src={featuredImage}
                          alt="Featured Image"
                          fill
                          sizes="288px"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => document.getElementById('featured-image-file')?.click()}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-800 shadow-sm transition-colors hover:bg-gray-100"
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
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 p-6 min-h-[140px] text-center transition-colors hover:border-gray-400 dark:hover:border-gray-600">
                        {uploadingFeatured ? (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Uploading featured image...
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => document.getElementById('featured-image-file')?.click()}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                              >
                                <Upload className="h-4 w-4 text-gray-500" />
                                Upload Main Image
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

                  {/* Product Gallery Images */}
                  <div className="space-y-2">
                    <Label>Product Gallery Images</Label>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative group flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        {uploadingGallery ? (
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => document.getElementById('gallery-files-input')?.click()}
                              className="flex h-full w-full flex-col items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              title="Add gallery image"
                            >
                              <Plus className="h-6 w-6" />
                              <span className="text-[10px] mt-1 font-medium">Add Image</span>
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

                      {galleryUrls.map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className="group relative h-24 w-24 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
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
                    <Label htmlFor="product-regular-price">Regular Price ($) *</Label>
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
                      placeholder="Optional sale price"
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
                      placeholder="Optional cost price"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-stock">Stock Quantity *</Label>
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

                  {/* Read-only / Automatic Sold Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="product-sold">Sold Count</Label>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        Automatic / Read-Only
                      </span>
                    </div>
                    <Input
                      id="product-sold"
                      type="number"
                      value={soldCount}
                      readOnly
                      disabled
                      className="bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Variants, Attributes & SEO */}
          {currentStep === 2 && (
            <div className="space-y-8">
              {/* Product Status & Badges */}
              <div className="space-y-4">
                <h3 className={sectionTitleClass}>Status & Badges</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-status">Product Status (Draft / Published / Archived)</Label>
                    <select
                      id="product-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProductStatus)}
                      className={inputClass}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-gender">Target Gender / Audience</Label>
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
                      placeholder="e.g. 100% Mulberry Silk"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-care-instruction">Care Instruction</Label>
                    <Input
                      id="product-care-instruction"
                      placeholder="e.g. Dry clean only"
                      value={careInstruction}
                      onChange={(e) => setCareInstruction(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="product-is-featured"
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black/20"
                    />
                    <Label htmlFor="product-is-featured">Featured Product</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="product-is-new-arrival"
                      type="checkbox"
                      checked={isNewArrival}
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black/20"
                    />
                    <Label htmlFor="product-is-new-arrival">New Arrival</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="product-is-trending"
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black/20"
                    />
                    <Label htmlFor="product-is-trending">Trending Item</Label>
                  </div>
                </div>
              </div>

              {/* Visual Variant Builder with Attributes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={sectionTitleClass}>Visual Variant Builder</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Define unique SKUs, stock levels, prices, and attribute key-value pairs (Color, Size, Material) per variant.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Variant
                  </button>
                </div>

                {variantItems.length === 0 ? (
                  <div className="text-center py-8 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <Sparkles className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No variants created yet.</p>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline"
                    >
                      + Create first variant
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {variantItems.map((variant, vIdx) => (
                      <div
                        key={variant.id}
                        className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/40 space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            Variant #{vIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeVariant(variant.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove variant"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Variant fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[11px]">Variant SKU *</Label>
                            <Input
                              placeholder="e.g. VAR-BLK-L"
                              value={variant.sku}
                              onChange={(e) => updateVariantField(variant.id, 'sku', e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">Price ($) *</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Price"
                              value={variant.price}
                              onChange={(e) => updateVariantField(variant.id, 'price', e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">Sale Price ($)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Sale price"
                              value={variant.salePrice}
                              onChange={(e) => updateVariantField(variant.id, 'salePrice', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px]">Stock *</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="Stock"
                              value={variant.stock}
                              onChange={(e) => updateVariantField(variant.id, 'stock', e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        {/* Variant Attributes */}
                        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-gray-500">
                              Attributes (Color, Size, Material, etc.)
                            </span>
                            <button
                              type="button"
                              onClick={() => addVariantAttribute(variant.id)}
                              className="text-[11px] text-purple-600 dark:text-purple-400 font-medium hover:underline flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" /> Add Attribute
                            </button>
                          </div>

                          <div className="space-y-2">
                            {variant.attributes.map((attr, aIdx) => (
                              <div key={aIdx} className="flex items-center gap-2">
                                <Input
                                  placeholder="Attribute Name (e.g. Color)"
                                  value={attr.key}
                                  onChange={(e) =>
                                    updateVariantAttribute(variant.id, aIdx, 'key', e.target.value)
                                  }
                                  className="flex-1 text-xs"
                                />
                                <Input
                                  placeholder="Attribute Value (e.g. Midnight Black)"
                                  value={attr.value}
                                  onChange={(e) =>
                                    updateVariantAttribute(variant.id, aIdx, 'value', e.target.value)
                                  }
                                  className="flex-1 text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeVariantAttribute(variant.id, aIdx)}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <h3 className={sectionTitleClass}>Product Specifications</h3>
                <div className="space-y-2">
                  {specificationRows.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        placeholder="Specification Name (e.g. Fabric)"
                        value={row.key}
                        onChange={(e) => updateSpecificationRow(idx, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Specification Value (e.g. 100% Silk)"
                        value={row.value}
                        onChange={(e) => updateSpecificationRow(idx, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecificationRow(idx)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addSpecificationRow}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 dark:text-purple-400 hover:text-purple-900"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Specification Row
                </button>
              </div>

              {/* SEO & Sitemap Settings */}
              <div className="space-y-4">
                <h3 className={sectionTitleClass}>Search Engine Optimization (SEO) & Sitemap</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Focus Keyword */}
                  <div className="space-y-2">
                    <InfoLabel
                      htmlFor="product-seo-focus-keyword"
                      info="Primary search term targeted by this product page for ranking."
                    >
                      Focus Keyword
                    </InfoLabel>
                    <Input
                      id="product-seo-focus-keyword"
                      placeholder="e.g. silk evening dress"
                      value={seo.focusKeyword || ''}
                      onChange={(e) => setSeo({ ...seo, focusKeyword: e.target.value })}
                    />
                  </div>

                  {/* SEO Title */}
                  <div className="space-y-2">
                    <InfoLabel
                      htmlFor="product-seo-title"
                      info="Meta title tag shown in search engine results."
                    >
                      SEO Title
                    </InfoLabel>
                    <Input
                      id="product-seo-title"
                      placeholder="Meta title tag"
                      value={seo.title}
                      onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                    />
                  </div>

                  {/* SEO Description */}
                  <div className="space-y-2 sm:col-span-2">
                    <InfoLabel
                      htmlFor="product-seo-description"
                      info="Short summary shown below title tag on Google search snippets."
                    >
                      SEO Description
                    </InfoLabel>
                    <Input
                      id="product-seo-description"
                      placeholder="Short search engine meta description"
                      value={seo.description}
                      onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                    />
                  </div>

                  {/* OpenGraph Title */}
                  <div className="space-y-2">
                    <InfoLabel
                      htmlFor="product-seo-og-title"
                      info="Title shown when sharing this product link on Facebook, Twitter, and WhatsApp."
                    >
                      OG Title (Social Sharing)
                    </InfoLabel>
                    <Input
                      id="product-seo-og-title"
                      placeholder="OpenGraph title"
                      value={seo.ogTitle || ''}
                      onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                    />
                  </div>

                  {/* OpenGraph Description */}
                  <div className="space-y-2">
                    <InfoLabel
                      htmlFor="product-seo-og-description"
                      info="Description shown when sharing this product on social platforms."
                    >
                      OG Description (Social Sharing)
                    </InfoLabel>
                    <Input
                      id="product-seo-og-description"
                      placeholder="OpenGraph description"
                      value={seo.ogDescription || ''}
                      onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
                    />
                  </div>

                  {/* OG Image */}
                  <div className="space-y-2">
                    <InfoLabel
                      htmlFor="product-seo-og-image"
                      info="Image thumbnail shown in social media preview cards."
                    >
                      OG Image URL
                    </InfoLabel>
                    <Input
                      id="product-seo-og-image"
                      placeholder="https://..."
                      value={seo.ogImage}
                      onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                    />
                  </div>

                  {/* Canonical URL */}
                  <div className="space-y-2">
                    <InfoLabel
                      htmlFor="product-seo-canonical"
                      info="Canonical URL to prevent duplicate content indexing issues."
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

                  {/* SEO Keywords */}
                  <div className="space-y-2 sm:col-span-2">
                    <InfoLabel
                      htmlFor="product-seo-keywords"
                      info="Enter keywords separated by comma or enter key."
                    >
                      Secondary SEO Keywords
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
                              className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-gray-400 hover:text-gray-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sitemap Settings Box */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 space-y-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      Sitemap Settings
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        id="sitemap-include"
                        type="checkbox"
                        checked={seo.sitemap?.include ?? true}
                        onChange={(e) =>
                          setSeo({
                            ...seo,
                            sitemap: {
                              include: e.target.checked,
                              priority: seo.sitemap?.priority ?? 0.8,
                              changefreq: seo.sitemap?.changefreq ?? 'weekly',
                            },
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black/20"
                      />
                      <Label htmlFor="sitemap-include" className="text-xs">
                        Include in XML Sitemap
                      </Label>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="sitemap-priority" className="text-[11px]">
                        Sitemap Priority
                      </Label>
                      <select
                        id="sitemap-priority"
                        value={seo.sitemap?.priority ?? 0.8}
                        onChange={(e) =>
                          setSeo({
                            ...seo,
                            sitemap: {
                              include: seo.sitemap?.include ?? true,
                              priority: Number(e.target.value),
                              changefreq: seo.sitemap?.changefreq ?? 'weekly',
                            },
                          })
                        }
                        className={inputClass}
                      >
                        <option value="1.0">1.0 (Highest)</option>
                        <option value="0.9">0.9</option>
                        <option value="0.8">0.8 (Default Product)</option>
                        <option value="0.7">0.7</option>
                        <option value="0.5">0.5 (Normal)</option>
                        <option value="0.3">0.3</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="sitemap-changefreq" className="text-[11px]">
                        Change Frequency
                      </Label>
                      <select
                        id="sitemap-changefreq"
                        value={seo.sitemap?.changefreq ?? 'weekly'}
                        onChange={(e) =>
                          setSeo({
                            ...seo,
                            sitemap: {
                              include: seo.sitemap?.include ?? true,
                              priority: seo.sitemap?.priority ?? 0.8,
                              changefreq: e.target.value as any,
                            },
                          })
                        }
                        className={inputClass}
                      >
                        <option value="always">Always</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="px-6 pb-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
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
              {isSaving ? 'Saving Product...' : editing ? 'Update Product' : 'Create Product'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
