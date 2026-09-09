'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronDown,
  Image as ImageIcon,
  Info,
  Loader2,
  Plus,
  Tag as TagIcon,
  Trash2,
  X,
  Sparkles,
  Globe,
  Share2,
  Check,
  Layers,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductStatus,
  ProductGender,
  ProductSEO,
  Category,
  Brand,
  CollectionItem,
  Tag,
} from '@/types';
import { defaultProductSEO } from '@/types';
import { useApiGet, useApiPost, useApiPut } from '@/hooks';
import { getProduct, createProduct, updateProduct } from '@/services/product.service';
import { getCategories } from '@/services/category.service';
import { getBrands } from '@/services/brand.service';
import { getCollections } from '@/services/collection.service';
import { getTags } from '@/services/tag.service';
import Stepper, { StepperStep } from '@/components/ui/Stepper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import GalleryPickerButton from '../../app/admin/gallery/_components/GalleryPickerButton';
import SeoPreview from './SeoPreview';

const steps: StepperStep[] = [
  { id: 'basics', label: 'Step 1 — Basics & Organization' },
  { id: 'media', label: 'Step 2 — Media & Pricing' },
  { id: 'attributes', label: 'Step 3 — Attributes & SEO' },
];

interface SpecificationRow {
  key: string;
  value: string;
}

const emptySpecificationRow = (): SpecificationRow => ({ key: '', value: '' });

const sectionTitleClass =
  'text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2';

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
    <div className="flex items-center gap-1.5 mb-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-gray-700 dark:text-gray-300">
        {children}
      </Label>
      <span
        tabIndex={0}
        title={info}
        aria-label={info}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 outline-none transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
      >
        <Info className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}

interface TagMultiSelectProps {
  tags: Tag[];
  selectedTagIds: string[];
  onChange: (selectedIds: string[]) => void;
}

function TagMultiSelect({ tags, selectedTagIds, onChange }: TagMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTags = useMemo(() => {
    if (!searchTerm.trim()) return tags;
    const term = searchTerm.toLowerCase();
    return tags.filter((t) => t.name.toLowerCase().includes(term));
  }, [tags, searchTerm]);

  const toggleTag = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedTagIds.includes(id)) {
      onChange(selectedTagIds.filter((tId) => tId !== id));
    } else {
      onChange([...selectedTagIds, id]);
    }
  };

  const selectedTagObjects = useMemo(() => {
    return selectedTagIds
      .map((id) => tags.find((t) => t._id === id) || { _id: id, name: id })
      .filter(Boolean);
  }, [selectedTagIds, tags]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 px-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer transition-colors outline-none select-none hover:border-gray-400 dark:hover:border-gray-600 focus-within:ring-4 focus-within:ring-gray-900/10 dark:focus-within:ring-white/10 shadow-xs"
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {selectedTagObjects.length === 0 ? (
            <span className="text-gray-400 dark:text-gray-500 text-sm">Select Tags & Badges (Multiple)...</span>
          ) : (
            selectedTagObjects.map((tag) => (
              <span
                key={tag._id}
                className="inline-flex items-center gap-1 bg-black dark:bg-white text-white dark:text-black px-2.5 py-0.5 rounded-full text-xs font-medium shadow-xs"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={(e) => toggleTag(tag._id, e)}
                  className="p-0.5 rounded-full hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown className={`pointer-events-none size-4 text-gray-500 dark:text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-1.5 text-gray-900 dark:text-gray-100 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 animate-in fade-in-0 zoom-in-95">
          <div className="p-1 mb-1 border-b border-gray-100 dark:border-gray-800">
            <Input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-xs w-full"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-h-44 overflow-y-auto space-y-0.5 scrollbar-thin">
            {filteredTags.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400 text-center">No tags found</div>
            ) : (
              filteredTags.map((tag) => {
                const selected = selectedTagIds.includes(tag._id);
                return (
                  <div
                    key={tag._id}
                    onClick={(e) => toggleTag(tag._id, e)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                      selected
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{tag.name}</span>
                    {selected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductForm({ productId }: ProductFormProps) {
  const editing = Boolean(productId);

  const { data: productResponse, isLoading, isError } = useApiGet<Product>({
    queryKey: ['admin-products', 'detail', productId ?? 'none'],
    queryFn: () => getProduct(productId as string),
    options: { enabled: Boolean(productId) },
  });

  const product = productResponse?.data;

  if (editing && (isLoading || (!product && !isError))) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin text-black dark:text-white" />
        <span className="ml-2 text-sm font-medium">Loading product...</span>
      </div>
    );
  }

  if (editing && isError) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
          Failed to load product.
        </p>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mt-3"
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

function ProductFormInner({ initialProduct }: { initialProduct?: Product }) {
  const router = useRouter();
  const editing = Boolean(initialProduct);

  const [activeStep, setActiveStep] = useState(0);

  // Fetch dropdown data
  const { data: categoriesData } = useApiGet<Category[]>({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });
  const { data: brandsData } = useApiGet<Brand[]>({
    queryKey: ['brands'],
    queryFn: () => getBrands(),
  });
  const { data: collectionsData } = useApiGet<CollectionItem[]>({
    queryKey: ['collections'],
    queryFn: () => getCollections(),
  });
  const { data: tagsData } = useApiGet<Tag[]>({
    queryKey: ['tags'],
    queryFn: () => getTags(),
  });

  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];
  const collections = collectionsData?.data || [];
  const tagsList = tagsData?.data || [];

  // Dynamic Specification state
  const initialSpecs: SpecificationRow[] = useMemo(() => {
    if (initialProduct?.specifications) {
      const entries = Object.entries(initialProduct.specifications);
      if (entries.length > 0) {
        return entries.map(([key, value]) => ({ key, value }));
      }
    }
    return [emptySpecificationRow()];
  }, [initialProduct]);

  const [specifications, setSpecifications] = useState<SpecificationRow[]>(initialSpecs);

  // Step 1: Basics & Organization
  const [name, setName] = useState(initialProduct?.name || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [barcode, setBarcode] = useState(initialProduct?.barcode || '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || '');
  const [description, setDescription] = useState(initialProduct?.description || '');

  const initialCatId = typeof initialProduct?.category === 'object' && initialProduct?.category ? (initialProduct.category as Category)._id : (initialProduct?.category || '');
  const initialBrandId = typeof initialProduct?.brand === 'object' && initialProduct?.brand ? (initialProduct.brand as Brand)._id : (initialProduct?.brand || '');
  const initialColId = typeof initialProduct?.collection === 'object' && initialProduct?.collection ? (initialProduct.collection as CollectionItem)._id : (initialProduct?.collection || '');
  const initialTagIds = Array.isArray(initialProduct?.tags)
    ? initialProduct.tags.map((t) => (typeof t === 'object' && t ? (t as Tag)._id : t))
    : [];

  const [category, setCategory] = useState(initialCatId);
  const [brand, setBrand] = useState(initialBrandId);
  const [collection, setCollection] = useState(initialColId);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTagIds);

  const selectedCategoryName = useMemo(() => {
    if (!category) return '';
    const match = categories.find((c) => c._id === category);
    if (match) return match.name;
    if (typeof initialProduct?.category === 'object' && initialProduct?.category && (initialProduct.category as Category)._id === category) {
      return (initialProduct.category as Category).name;
    }
    return category;
  }, [category, categories, initialProduct]);

  const selectedBrandName = useMemo(() => {
    if (!brand) return '';
    const match = brands.find((b) => b._id === brand);
    if (match) return match.name;
    if (typeof initialProduct?.brand === 'object' && initialProduct?.brand && (initialProduct.brand as Brand)._id === brand) {
      return (initialProduct.brand as Brand).name;
    }
    return brand;
  }, [brand, brands, initialProduct]);

  const selectedCollectionName = useMemo(() => {
    if (!collection) return '';
    const match = collections.find((c) => c._id === collection);
    if (match) return match.name;
    if (typeof initialProduct?.collection === 'object' && initialProduct?.collection && (initialProduct.collection as CollectionItem)._id === collection) {
      return (initialProduct.collection as CollectionItem).name;
    }
    return collection;
  }, [collection, collections, initialProduct]);

  // Step 2: Media & Pricing
  const [featuredImage, setFeaturedImage] = useState(initialProduct?.media?.featuredImage || initialProduct?.featuredImage || '');
  const [gallery, setGallery] = useState<string[]>(initialProduct?.media?.gallery || initialProduct?.gallery || []);
  const [videoUrl, setVideoUrl] = useState(initialProduct?.media?.videoUrl || '');

  const [regularPrice, setRegularPrice] = useState(initialProduct?.regularPrice ? String(initialProduct.regularPrice) : '');
  const [salePrice, setSalePrice] = useState(initialProduct?.salePrice ? String(initialProduct.salePrice) : '');
  const [costPrice, setCostPrice] = useState(initialProduct?.costPrice ? String(initialProduct.costPrice) : '');
  const [stock, setStock] = useState(initialProduct?.stock ? String(initialProduct.stock) : '0');
  const [lowStock, setLowStock] = useState(initialProduct?.lowStock ? String(initialProduct.lowStock) : '5');
  const sold = initialProduct?.sold ?? 0;

  // Step 3: Attributes & SEO
  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status || 'published');
  const [gender, setGender] = useState<ProductGender>(initialProduct?.gender || 'unisex');
  const [material, setMaterial] = useState(initialProduct?.material || '');
  const [careInstruction, setCareInstruction] = useState(initialProduct?.careInstructions || initialProduct?.careInstruction || '');

  const [isFeatured, setIsFeatured] = useState(Boolean(initialProduct?.isFeatured));
  const [isNewArrival, setIsNewArrival] = useState(Boolean(initialProduct?.isNewArrival));
  const [isTrending, setIsTrending] = useState(Boolean(initialProduct?.isTrending));

  // SEO Fields
  const initialSEO = initialProduct?.seo || defaultProductSEO;
  const [seoTitle, setSeoTitle] = useState(initialSEO.title || '');
  const [seoDescription, setSeoDescription] = useState(initialSEO.description || '');
  const [focusKeyword, setFocusKeyword] = useState(initialSEO.focusKeyword || '');
  const [keywordsInput, setKeywordsInput] = useState(Array.isArray(initialSEO.keywords) ? initialSEO.keywords.join(', ') : '');
  const [canonicalUrl, setCanonicalUrl] = useState(initialSEO.canonical || '');
  const [robots, setRobots] = useState(initialSEO.robots || 'index, follow');
  const [ogTitle, setOgTitle] = useState(initialSEO.ogTitle || '');
  const [ogDescription, setOgDescription] = useState(initialSEO.ogDescription || '');
  const [ogImage, setOgImage] = useState(initialSEO.ogImage || '');
  const [twitterTitle, setTwitterTitle] = useState(initialSEO.twitterTitle || '');
  const [twitterDescription, setTwitterDescription] = useState(initialSEO.twitterDescription || '');
  const [twitterImage, setTwitterImage] = useState(initialSEO.twitterImage || '');
  const [includeInSitemap, setIncludeInSitemap] = useState(initialSEO.sitemap?.include ?? true);
  const [sitemapPriority, setSitemapPriority] = useState(String(initialSEO.sitemap?.priority ?? 0.8));
  const [changeFrequency, setChangeFrequency] = useState(initialSEO.sitemap?.changefreq ?? 'weekly');

  const [errorMsg, setErrorMsg] = useState('');

  const createMutation = useApiPost<Product, CreateProductPayload>({
    mutationFn: createProduct,
    invalidateKeys: [['admin-products']],
  });

  const updateMutation = useApiPut<Product, UpdateProductPayload>({
    mutationFn: updateProduct,
    invalidateKeys: [['admin-products']],
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editing && !slug) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const addSpecRow = () => setSpecifications((prev) => [...prev, emptySpecificationRow()]);
  const removeSpecRow = (idx: number) => setSpecifications((prev) => prev.filter((_, i) => i !== idx));
  const updateSpecRow = (idx: number, field: 'key' | 'value', val: string) => {
    setSpecifications((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const removeGalleryImage = (idx: number) => setGallery((prev) => prev.filter((_, i) => i !== idx));

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const currentSEO: ProductSEO = useMemo(
    () => ({
      title: seoTitle || name,
      description: seoDescription || shortDescription,
      focusKeyword,
      keywords: keywordsInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      canonical: canonicalUrl,
      robots,
      ogTitle: ogTitle || seoTitle || name,
      ogDescription: ogDescription || seoDescription || shortDescription,
      ogImage: ogImage || featuredImage,
      twitterTitle: twitterTitle || ogTitle || seoTitle || name,
      twitterDescription: twitterDescription || ogDescription || seoDescription || shortDescription,
      twitterImage: twitterImage || ogImage || featuredImage,
      sitemap: {
        include: includeInSitemap,
        priority: Number(sitemapPriority) || 0.8,
        changefreq: changeFrequency as 'weekly',
      },
    }),
    [
      seoTitle,
      name,
      seoDescription,
      shortDescription,
      focusKeyword,
      keywordsInput,
      canonicalUrl,
      robots,
      ogTitle,
      ogDescription,
      ogImage,
      featuredImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      includeInSitemap,
      sitemapPriority,
      changeFrequency,
    ]
  );

  const validateStep = (stepIdx: number): boolean => {
    setErrorMsg('');

    if (stepIdx === 0) {
      if (!name.trim()) {
        setErrorMsg('Product name is required');
        return false;
      }
      if (!sku.trim()) {
        setErrorMsg('SKU is required');
        return false;
      }
      if (!category) {
        setErrorMsg('Category is required');
        return false;
      }
      if (!brand) {
        setErrorMsg('Brand is required');
        return false;
      }
    }

    if (stepIdx === 1) {
      if (!regularPrice || isNaN(Number(regularPrice)) || Number(regularPrice) < 0) {
        setErrorMsg('Valid regular price is required');
        return false;
      }
      if (!stock || isNaN(Number(stock)) || Number(stock) < 0) {
        setErrorMsg('Valid stock quantity is required');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(steps.length - 1, prev + 1));
    }
  };

  const handlePrev = () => {
    setErrorMsg('');
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      return;
    }

    const specsRecord: Record<string, string> = {};
    specifications.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsRecord[s.key.trim()] = s.value.trim();
      }
    });

    const payload: CreateProductPayload = {
      name: name.trim(),
      sku: sku.trim(),
      slug: slug.trim() || undefined,
      barcode: barcode.trim() || undefined,
      shortDescription: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      category,
      brand,
      collection: collection || undefined,
      tags: selectedTags,
      featuredImage,
      gallery,
      video: videoUrl,
      media: {
        featuredImage,
        gallery,
        videoUrl,
      },
      regularPrice: Number(regularPrice),
      salePrice: salePrice ? Number(salePrice) : undefined,
      costPrice: costPrice ? Number(costPrice) : undefined,
      stock: Number(stock),
      lowStock: lowStock ? Number(lowStock) : undefined,
      status,
      gender,
      material: material.trim(),
      careInstruction: careInstruction.trim(),
      isFeatured,
      isNewArrival,
      isTrending,
      specifications: specsRecord,
      seo: currentSEO,
    };

    try {
      if (editing && initialProduct?._id) {
        await updateMutation.mutateAsync({ _id: initialProduct._id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push('/admin/products');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while saving product';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors mb-2"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Products
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {editing ? `Edit Product: ${initialProduct?.name}` : 'Create New Product'}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Step {activeStep + 1} of 3 — {steps[activeStep].label}
          </p>
        </div>

        {editing && (
          <Link
            href={`/admin/variants?productId=${initialProduct?._id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-semibold shadow-xs hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <Layers className="w-4 h-4" />
            Manage Variants
          </Link>
        )}
      </div>

      {/* Stepper */}
      <div className="bg-white dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <Stepper
          steps={steps}
          currentStep={activeStep}
          onStepChange={(index: number) => {
            if (index < activeStep || validateStep(activeStep)) {
              setActiveStep(index);
            }
          }}
        />
      </div>

      {/* Error Notification */}
      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
        {/* ================= STEP 1: BASICS & ORGANIZATION ================= */}
        {activeStep === 0 && (
          <div className="p-6 space-y-6">
            <div className="space-y-5">
              <h2 className={sectionTitleClass}>
                <Sparkles className="w-4 h-4 text-purple-500" /> Basic Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <InfoLabel htmlFor="name" info="The full display name of the fashion item.">
                    Product Name <span className="text-red-500">*</span>
                  </InfoLabel>
                  <Input
                    id="name"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Classic Olive Green Denim Jacket"
                  />
                </div>

                <div className="space-y-2">
                  <InfoLabel htmlFor="sku" info="Unique Stock Keeping Unit code for inventory tracking.">
                    SKU Code <span className="text-red-500">*</span>
                  </InfoLabel>
                  <Input
                    id="sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. JKT-OLV-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <InfoLabel htmlFor="slug" info="URL-friendly identifier. Auto-generated from name if left empty.">
                    URL Slug
                  </InfoLabel>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="classic-olive-green-denim-jacket"
                  />
                </div>

                <div className="space-y-2">
                  <InfoLabel htmlFor="barcode" info="GTIN / EAN / UPC Barcode number.">
                    Barcode (GTIN / UPC)
                  </InfoLabel>
                  <Input
                    id="barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="e.g. 8901234567890"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <InfoLabel htmlFor="shortDescription" info="A concise summary displayed on product cards.">
                  Short Description
                </InfoLabel>
                <Textarea
                  id="shortDescription"
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Elevate your everyday look with our tailored olive jacket..."
                />
              </div>

              <div className="space-y-2">
                <InfoLabel htmlFor="description" info="Detailed product description, features, fit guide, and highlights.">
                  Full Description
                </InfoLabel>
                <Textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Crafted from premium 100% organic cotton denim..."
                />
              </div>
            </div>

            {/* Organization */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-900 space-y-5">
              <h2 className={sectionTitleClass}>
                <TagIcon className="w-4 h-4 text-purple-500" /> Organization & Taxonomy
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                <div className="space-y-2 w-full">
                  <InfoLabel htmlFor="category" info="Primary category classification (Required).">
                    Category <span className="text-red-500">*</span>
                  </InfoLabel>
                  <Select value={category} onValueChange={(val: string | null) => val && setCategory(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category">
                        {selectedCategoryName || 'Select Category'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 w-full">
                  <InfoLabel htmlFor="brand" info="Product manufacturer or brand (Required).">
                    Brand <span className="text-red-500">*</span>
                  </InfoLabel>
                  <Select value={brand} onValueChange={(val: string | null) => val && setBrand(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Brand">
                        {selectedBrandName || 'Select Brand'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b._id} value={b._id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 w-full">
                  <InfoLabel htmlFor="collection" info="Seasonal or curational collection (Optional).">
                    Collection
                  </InfoLabel>
                  <Select value={collection} onValueChange={(val: string | null) => setCollection(val || '')}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Collection (Optional)">
                        {selectedCollectionName || 'Select Collection (Optional)'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((col) => (
                        <SelectItem key={col._id} value={col._id}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags Multi-select */}
              <div className="space-y-2 w-full">
                <InfoLabel htmlFor="tags-select" info="Curated tags & taxonomy badges (Optional, multi-select).">
                  Tags & Badges (Optional)
                </InfoLabel>
                <TagMultiSelect
                  tags={tagsList}
                  selectedTagIds={selectedTags}
                  onChange={setSelectedTags}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: MEDIA & PRICING ================= */}
        {activeStep === 1 && (
          <div className="p-6 space-y-6">
            {/* Media */}
            <div className="space-y-5">
              <h2 className={sectionTitleClass}>
                <ImageIcon className="w-4 h-4 text-purple-500" /> Media & Visual Assets
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <InfoLabel info="Primary image shown in product catalogs and card previews.">
                    Featured Image URL
                  </InfoLabel>
                  <div className="flex gap-2">
                    <Input
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                    <GalleryPickerButton
                      label="Browse"
                      onSelect={(urls: string[]) => {
                        if (urls[0]) setFeaturedImage(urls[0]);
                      }}
                    />
                  </div>

                  {featuredImage && (
                    <div className="mt-3 relative w-28 h-28 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-900">
                      <Image
                        src={featuredImage}
                        alt="Featured"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => setFeaturedImage('')}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <InfoLabel info="Optional product video link (e.g. YouTube or mp4).">
                    Video URL (Optional)
                  </InfoLabel>
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              {/* Gallery */}
              <div className="space-y-2">
                <InfoLabel info="Secondary product showcase images.">
                  Product Gallery Images
                </InfoLabel>
                <div className="flex gap-2 mb-3">
                  <GalleryPickerButton
                    multiple
                    label="Add Images from Gallery"
                    onSelect={(urls: string[]) => {
                      setGallery((prev) => Array.from(new Set([...prev, ...urls])));
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {gallery.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative w-full h-24 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-900 group"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Gallery ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-900 space-y-5">
              <h2 className={sectionTitleClass}>
                <Upload className="w-4 h-4 text-purple-500" /> Pricing & Inventory
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <InfoLabel htmlFor="regularPrice" info="Standard selling price before discounts (Required).">
                    Regular Price ($) <span className="text-red-500">*</span>
                  </InfoLabel>
                  <Input
                    id="regularPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(e.target.value)}
                    placeholder="99.99"
                  />
                </div>

                <div className="space-y-2">
                  <InfoLabel htmlFor="salePrice" info="Discounted price displayed during sales.">
                    Sale Price ($)
                  </InfoLabel>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="79.99"
                  />
                </div>

                <div className="space-y-2">
                  <InfoLabel htmlFor="costPrice" info="Internal cost price for profit margin analysis.">
                    Cost Price ($)
                  </InfoLabel>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="35.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <InfoLabel htmlFor="stock" info="Total available inventory quantity (Required).">
                    Current Stock <span className="text-red-500">*</span>
                  </InfoLabel>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="50"
                  />
                </div>

                <div className="space-y-2">
                  <InfoLabel htmlFor="lowStock" info="Threshold to trigger low stock alerts.">
                    Low Stock Threshold
                  </InfoLabel>
                  <Input
                    id="lowStock"
                    type="number"
                    min="0"
                    value={lowStock}
                    onChange={(e) => setLowStock(e.target.value)}
                    placeholder="5"
                  />
                </div>

                {/* Sold Field (Readonly) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Total Sold Units
                    </Label>
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded font-medium">
                      Auto-Calculated
                    </span>
                  </div>
                  <Input
                    disabled
                    readOnly
                    value={sold}
                    className="bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-gray-400">
                    Calculated automatically from completed orders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ATTRIBUTES & SEO ================= */}
        {activeStep === 2 && (
          <div className="p-6 space-y-6">
            {/* Status & Attributes */}
            <div className="space-y-5">
              <h2 className={sectionTitleClass}>
                <Sparkles className="w-4 h-4 text-purple-500" /> Attributes & Display Badges
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                <div className="space-y-2 w-full">
                  <InfoLabel htmlFor="status" info="Publication state of the product.">
                    Publishing Status
                  </InfoLabel>
                  <Select
                    value={status}
                    onValueChange={(val: string | null) => val && setStatus(val as ProductStatus)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 w-full">
                  <InfoLabel htmlFor="gender" info="Target audience gender classification.">
                    Target Gender
                  </InfoLabel>
                  <Select
                    value={gender}
                    onValueChange={(val: string | null) => setGender((val || '') as ProductGender)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Gender (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="unisex">Unisex</SelectItem>
                      <SelectItem value="kids">Kids</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 w-full">
                  <InfoLabel htmlFor="material" info="Primary fabric composition (e.g., 100% Cotton).">
                    Fabric / Material
                  </InfoLabel>
                  <Input
                    id="material"
                    className="w-full"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="e.g. 100% Organic Cotton"
                  />
                </div>
              </div>

              <div className="space-y-2 w-full">
                <InfoLabel htmlFor="careInstruction" info="Washing and care directions.">
                  Care Instructions
                </InfoLabel>
                <Input
                  id="careInstruction"
                  className="w-full"
                  value={careInstruction}
                  onChange={(e) => setCareInstruction(e.target.value)}
                  placeholder="e.g. Machine wash cold, dry flat"
                />
              </div>

              {/* Badges Toggles */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-black dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    Featured Product
                  </span>
                </label>

                <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="w-4 h-4 rounded text-black dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    New Arrival
                  </span>
                </label>

                <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="w-4 h-4 rounded text-black dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    Trending Item
                  </span>
                </label>
              </div>

              {/* Dynamic Specifications */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-900 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    Dynamic Product Specifications
                  </Label>
                  <button
                    type="button"
                    onClick={addSpecRow}
                    className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Field
                  </button>
                </div>

                <div className="space-y-2">
                  {specifications.map((row, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="Spec Name (e.g., Fit)"
                        value={row.key}
                        onChange={(e) => updateSpecRow(idx, 'key', e.target.value)}
                      />
                      <Input
                        placeholder="Spec Value (e.g., Slim Fit)"
                        value={row.value}
                        onChange={(e) => updateSpecRow(idx, 'value', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecRow(idx)}
                        className="p-2 text-red-500 hover:text-red-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Complete SEO Section */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-900 space-y-5">
              <h2 className={sectionTitleClass}>
                <Globe className="w-4 h-4 text-purple-500" /> Complete Search Engine Optimization (SEO)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <InfoLabel htmlFor="seoTitle" info="Custom title tag for search engines. Defaults to product name.">
                    SEO Meta Title
                  </InfoLabel>
                  <Input
                    id="seoTitle"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Classic Olive Jacket | Zenvro Fashion"
                  />
                </div>

                <div className="space-y-2">
                  <InfoLabel htmlFor="focusKeyword" info="Primary keyword target for search optimization.">
                    Focus Keyword
                  </InfoLabel>
                  <Input
                    id="focusKeyword"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="olive green denim jacket"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <InfoLabel htmlFor="seoDescription" info="Meta description snippet for search results.">
                  Meta Description
                </InfoLabel>
                <Textarea
                  id="seoDescription"
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Shop our classic olive green denim jacket. Handcrafted from organic cotton with custom metallic hardware..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <InfoLabel htmlFor="keywordsInput" info="Comma-separated keywords list.">
                    Keywords (CSV)
                  </InfoLabel>
                  <Input
                    id="keywordsInput"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    placeholder="jacket, denim, olive green, mens fashion"
                  />
                </div>

                <div className="space-y-2">
                  <InfoLabel htmlFor="canonicalUrl" info="Canonical URL link rel to prevent duplicate content penalty.">
                    Canonical URL
                  </InfoLabel>
                  <Input
                    id="canonicalUrl"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://zenvro.com/products/classic-olive-jacket"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                <div className="space-y-2 w-full">
                  <InfoLabel htmlFor="robots" info="Robots index instructions for search spiders.">
                    Robots Directive
                  </InfoLabel>
                  <Select value={robots} onValueChange={(val: string | null) => val && setRobots(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Directive" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="index, follow">index, follow (Recommended)</SelectItem>
                      <SelectItem value="noindex, follow">noindex, follow</SelectItem>
                      <SelectItem value="index, nofollow">index, nofollow</SelectItem>
                      <SelectItem value="noindex, nofollow">noindex, nofollow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 w-full">
                  <InfoLabel htmlFor="ogImage" info="Custom image URL for Open Graph shares. Defaults to featured image.">
                    Open Graph / Facebook Image URL
                  </InfoLabel>
                  <Input
                    id="ogImage"
                    className="w-full"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Open Graph & Twitter Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-gray-100 dark:border-gray-900 w-full">
                <div className="space-y-2 w-full">
                  <InfoLabel htmlFor="ogTitle" info="Specific title for Facebook / LinkedIn shares.">
                    Open Graph Title
                  </InfoLabel>
                  <Input
                    id="ogTitle"
                    className="w-full"
                    value={ogTitle}
                    onChange={(e) => setOgTitle(e.target.value)}
                    placeholder="Defaults to SEO Title"
                  />
                </div>

                <div className="space-y-2 w-full">
                  <InfoLabel htmlFor="ogDescription" info="Specific description for Facebook / LinkedIn shares.">
                    Open Graph Description
                  </InfoLabel>
                  <Input
                    id="ogDescription"
                    className="w-full"
                    value={ogDescription}
                    onChange={(e) => setOgDescription(e.target.value)}
                    placeholder="Defaults to Meta Description"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                <div className="space-y-2 w-full">
                  <InfoLabel htmlFor="twitterTitle" info="Specific title for Twitter / X share cards.">
                    Twitter Card Title
                  </InfoLabel>
                  <Input
                    id="twitterTitle"
                    className="w-full"
                    value={twitterTitle}
                    onChange={(e) => setTwitterTitle(e.target.value)}
                    placeholder="Defaults to OG Title"
                  />
                </div>

                <div className="space-y-2 w-full">
                  <InfoLabel htmlFor="twitterDescription" info="Specific description for Twitter / X cards.">
                    Twitter Card Description
                  </InfoLabel>
                  <Input
                    id="twitterDescription"
                    className="w-full"
                    value={twitterDescription}
                    onChange={(e) => setTwitterDescription(e.target.value)}
                    placeholder="Defaults to OG Description"
                  />
                </div>

                <div className="space-y-2 w-full">
                  <InfoLabel htmlFor="twitterImage" info="Image URL for Twitter / X share cards.">
                    Twitter Image URL
                  </InfoLabel>
                  <Input
                    id="twitterImage"
                    className="w-full"
                    value={twitterImage}
                    onChange={(e) => setTwitterImage(e.target.value)}
                    placeholder="Defaults to OG Image"
                  />
                </div>
              </div>

              {/* Sitemap Settings */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    Include Product in XML Sitemap
                  </span>
                  <input
                    type="checkbox"
                    checked={includeInSitemap}
                    onChange={(e) => setIncludeInSitemap(e.target.checked)}
                    className="w-4 h-4 rounded text-black dark:text-white focus:ring-0 cursor-pointer"
                  />
                </div>

                {includeInSitemap && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 w-full">
                    <div className="space-y-1 w-full">
                      <Label className="text-xs text-gray-600 dark:text-gray-400 block">
                        Sitemap Priority (0.0 to 1.0)
                      </Label>
                      <Input
                        type="number"
                        className="w-full"
                        step="0.1"
                        min="0"
                        max="1.0"
                        value={sitemapPriority}
                        onChange={(e) => setSitemapPriority(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1 w-full">
                      <Label className="text-xs text-gray-600 dark:text-gray-400 block">
                        Change Frequency
                      </Label>
                      <Select
                        value={changeFrequency}
                        onValueChange={(val: string | null) => val && setChangeFrequency(val as 'weekly')}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="always">Always</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Live SEO Preview */}
              <div className="pt-2">
                <SeoPreview
                  seo={currentSEO}
                  productName={name}
                  productSlug={slug}
                  featuredImage={featuredImage}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeStep === 0}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-3">
            {activeStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{editing ? 'Update Product' : 'Create Product'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
