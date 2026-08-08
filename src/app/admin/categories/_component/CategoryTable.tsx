'use client';

import { useState } from 'react';
import { Plus, Search, Loader2, FolderTree, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Category } from '@/types';
import { useApiPost, useApiPut, useApiDelete, createQueryKeys } from '@/hooks';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from '@/services/category.service';
import CategoryRow from './CategoryRow';
import Pagination from '@/app/admin/_components/common/pagination';
import CategoryFormModal from './CategoryFormModal';

interface CategoryFormData {
  name: string;
  slug?: string;
  parentCategory?: string;
  image?: string;
  description?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    canonical?: string;
    ogImage?: string;
    robots?: string;
  };
  isActive: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CategoryTableProps {
  categories: Category[];
  loading?: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  title?: string;
  description?: string;
  showHeader?: boolean;
  onSave?: (form: CategoryFormData, editingId: string | null) => Promise<void>;
  onDelete?: (_id: string) => void;
  onToggleActive?: (_id: string) => void;
  emptyMessage?: string;
  columns?: ('children' | 'seo' | 'status' | 'created' | 'actions')[];
}

const categoryKeys = createQueryKeys('categories');

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function CategoryTable({
  categories = [],
  loading = false,
  search: searchProp,
  onSearchChange,
  pagination,
  onPageChange,
  title = 'Categories',
  description = 'Manage your product categories',
  showHeader = true,
  onSave,
  onDelete,
  onToggleActive,
  emptyMessage = 'No categories found',
  columns = ['children', 'seo', 'status', 'created', 'actions'],
}: CategoryTableProps) {
  const [internalSearch, setInternalSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<CategoryFormData> | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const invalidateKeys = [categoryKeys.lists()];

  const createMutation = useApiPost<Category, CreateCategoryPayload>({
    mutationFn: createCategory,
    invalidateKeys,
  });

  const updateMutation = useApiPut<Category, UpdateCategoryPayload>({
    mutationFn: updateCategory,
    invalidateKeys,
  });

  const deleteMutation = useApiDelete({
    mutationFn: deleteCategory,
    invalidateKeys,
  });

  const search = searchProp !== undefined ? searchProp : internalSearch;
  const setSearch = onSearchChange || setInternalSearch;

  const rootCategories = categories.filter((c) => !c.parentCategory);
  const childMap = categories.reduce<Record<string, Category[]>>((acc, c) => {
    if (c.parentCategory) {
      if (!acc[c.parentCategory]) acc[c.parentCategory] = [];
      acc[c.parentCategory].push(c);
    }
    return acc;
  }, {});

  const filtered = rootCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openCreate = (parentId?: string) => {
    setEditingId(null);
    setInitialData({ parentCategory: parentId || '' });
    setShowForm(true);
    setError('');
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat._id);
    setInitialData({
      name: cat.name,
      slug: cat.slug,
      parentCategory: cat.parentCategory || '',
      image: cat.image,
      description: cat.description,
      seo: cat.seo || { title: '', description: '', keywords: [], canonical: '', ogImage: '', robots: 'index' },
      isActive: cat.isActive,
    });
    setShowForm(true);
    setError('');
  };

  const handleSave = async (form: CategoryFormData) => {
    if (onSave) {
      await onSave(form, editingId);
      setShowForm(false);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload: CreateCategoryPayload = {
        ...form,
        parentCategory: form.parentCategory || undefined,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      };
      if (editingId) {
        await updateMutation.mutateAsync({ _id: editingId, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setShowForm(false);
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (_id: string) => {
    if (onDelete) { onDelete(_id); return; }
    if (!confirm('Delete this category and all its subcategories?')) return;
    deleteMutation.mutate(_id);
  };

  const handleToggleActive = (_id: string) => {
    if (onToggleActive) { onToggleActive(_id); return; }
    const category = categories.find((c) => c._id === _id);
    if (!category) return;
    updateMutation.mutate({ _id, isActive: !category.isActive });
  };

  return (
    <div className="flex flex-col gap-6">
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <FolderTree className="h-6 w-6 text-gray-400" />
              {title}
            </h1>
            {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
          </div>
          <button
            onClick={() => openCreate()}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10"
          />
        </div>
        <div className="flex gap-3">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100">
            <span className="text-gray-500 dark:text-gray-400">Total:</span>{' '}
            <span className="font-bold">{pagination?.total ?? categories.length}</span>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100">
            <span className="text-gray-500 dark:text-gray-400">Active:</span>{' '}
            <span className="font-bold text-green-600 dark:text-green-400">{categories.filter((c) => c.isActive).length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FolderTree className="h-12 w-12 mb-3" />
            <p className="text-sm font-medium">{emptyMessage}</p>
            <button onClick={() => openCreate()} className="mt-3 text-sm text-black dark:text-white font-medium hover:underline">
              Create your first category
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-950/50">
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Slug</th>
                    {columns.includes('children') && <th className="px-4 py-3 font-medium">Children</th>}
                    {columns.includes('seo') && <th className="px-4 py-3 font-medium">SEO</th>}
                    {columns.includes('status') && <th className="px-4 py-3 font-medium">Status</th>}
                    {columns.includes('created') && <th className="px-4 py-3 font-medium">Created</th>}
                    {columns.includes('actions') && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filtered.map((cat) => (
                    <CategoryRow
                      key={cat._id}
                      category={cat}
                      children={childMap[cat._id] || []}
                      isExpanded={expandedRows.has(cat._id)}
                      onToggleExpand={() => toggleExpand(cat._id)}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                      onAddChild={openCreate}
                      columns={columns}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && (
              <Pagination
                page={pagination.page}
                limit={pagination.limit}
                total={pagination.total}
                totalPages={pagination.totalPages}
                onPageChange={(p) => onPageChange?.(p)}
                itemUnitName="categories"
              />
            )}
          </>
        )}
      </div>

      <CategoryFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        initialData={initialData}
        editing={!!editingId}
        saving={saving}
        error={error}
        categories={categories}
      />
    </div>
  );
}
