'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Globe } from 'lucide-react';
import type { Category } from '@/types';
import ImageUpload from './ImageUpload';
import GalleryPickerButton from './GalleryPickerButton';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  parentCategory: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    canonical: z.string().optional(),
    ogImage: z.string().optional(),
    robots: z.string().optional(),
  }).optional(),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormValues) => void;
  initialData?: Partial<CategoryFormValues>;
  editing: boolean;
  saving: boolean;
  error: string;
  categories: Category[];
}

export default function CategoryFormModal({
  open,
  onClose,
  onSave,
  initialData,
  editing,
  saving,
  error,
  categories,
}: CategoryFormModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      parentCategory: '',
      image: '',
      description: '',
      seo: {
        title: '',
        description: '',
        keywords: [],
        canonical: '',
        ogImage: '',
        robots: 'index',
      },
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name || '',
          slug: initialData.slug || '',
          parentCategory: initialData.parentCategory || '',
          image: initialData.image || '',
          description: initialData.description || '',
          seo: {
            title: initialData.seo?.title || '',
            description: initialData.seo?.description || '',
            keywords: initialData.seo?.keywords || [],
            canonical: initialData.seo?.canonical || '',
            ogImage: initialData.seo?.ogImage || '',
            robots: initialData.seo?.robots || 'index',
          },
          isActive: initialData.isActive ?? true,
        });
      } else {
        reset({
          name: '',
          slug: '',
          parentCategory: '',
          image: '',
          description: '',
          seo: {
            title: '',
            description: '',
            keywords: [],
            canonical: '',
            ogImage: '',
            robots: 'index',
          },
          isActive: true,
        });
      }
    }
  }, [open, initialData, reset]);

  const formValues = watch();

  const onSubmit = (data: CategoryFormValues) => {
    onSave(data);
  };

  const modalFooter = (
    <>
      <button
        onClick={onClose}
        className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit(onSubmit)}
        disabled={saving}
        className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {editing ? 'Update' : 'Create'}
      </button>
    </>
  );

  const rootCategories = categories.filter((c) => !c.parentCategory);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={editing ? 'Edit Category' : 'Create Category'}
      footer={modalFooter}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" autoComplete="off">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{error}</div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Category name"
              autoComplete="off"
              aria-invalid={!!errors.name}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="auto-generated from name"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Parent Category</Label>
          <Select
            value={formValues.parentCategory || null}
            onValueChange={(value) => setValue('parentCategory', value ?? '')}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="None (Root Category)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>None (Root Category)</SelectItem>
              {rootCategories.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            rows={3}
            placeholder="Category description"
            autoComplete="off"
          />
        </div>

        {/* Media */}
        <div className="space-y-1.5">
          <ImageUpload
            value={formValues.image || ''}
            onChange={(url) => setValue('image', url)}
            label="Category Image"
            folder="velour/categories"
          />
        </div>

        {/* SEO */}
        <div className=" p-4 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-400" /> SEO Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="seo.title">SEO Title</Label>
              <Input
                id="seo.title"
                {...register('seo.title')}
                placeholder="Page title"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seo.canonical">Canonical URL</Label>
              <Input
                id="seo.canonical"
                {...register('seo.canonical')}
                placeholder="https://..."
                autoComplete="off"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seo.description">Meta Description</Label>
            <Textarea
              id="seo.description"
              {...register('seo.description')}
              rows={2}
              placeholder="SEO description"
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="seo.ogImage">OG Image</Label>
            <Input
              id="seo.ogImage"
              {...register('seo.ogImage')}
              placeholder="https://..."
              autoComplete="off"
            />
            <GalleryPickerButton
              onSelect={(urls) => {
                if (urls[0]) setValue('seo.ogImage', urls[0]);
              }}
              selectedUrls={formValues.seo?.ogImage ? [formValues.seo.ogImage] : []}
              label="Browse Gallery"
            />
          </div>
            <div className="space-y-1.5">
              <Label>Robots</Label>
              <Select
                value={formValues.seo?.robots || 'index'}
                onValueChange={(value) => setValue('seo.robots', value ?? 'index')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="index">Index</SelectItem>
                  <SelectItem value="noindex">No Index</SelectItem>
                  <SelectItem value="nofollow">No Follow</SelectItem>
                  <SelectItem value="noindex,nofollow">No Index, No Follow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seo.keywords">Keywords (comma-separated)</Label>
            <Input
              id="seo.keywords"
              value={formValues.seo?.keywords?.join(', ') || ''}
              onChange={(e) => {
                const keywords = e.target.value.split(',').map((k) => k.trim()).filter(Boolean);
                setValue('seo.keywords', keywords);
              }}
              placeholder="keyword1, keyword2"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3">
          <Switch
            checked={formValues.isActive}
            onCheckedChange={(checked) => setValue('isActive', checked)}
          />
          <Label>Active</Label>
        </div>
      </form>
    </Modal>
  );
}
