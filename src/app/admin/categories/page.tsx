'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Loader2, FolderTree } from 'lucide-react';
import type { Category } from '@/types';
import CategoryFormModal from '@/components/admin/CategoryFormModal';
import CategoryRow from '@/components/admin/CategoryRow';

interface CategoryFormData {
  name: string;
  slug?: string;
  parentCategory?: string;
  image?: string;
  banner?: string;
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<CategoryFormData> | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (res.ok) setCategories(data.categories);
    } catch {
      console.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const rootCategories = categories.filter((c) => !c.parentCategory);
  const childMap = categories.reduce<Record<string, Category[]>>((acc, c) => {
    if (c.parentCategory) {
      if (!acc[c.parentCategory]) acc[c.parentCategory] = [];
      acc[c.parentCategory].push(c);
    }
    return acc;
  }, {});

  const filtered = rootCategories.filter((c) =>
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
      banner: cat.banner,
      description: cat.description,
      seo: cat.seo || { title: '', description: '', keywords: [], canonical: '', ogImage: '', robots: 'index' },
      isActive: cat.isActive,
    });
    setShowForm(true);
    setError('');
  };

  const handleSave = async (form: CategoryFormData) => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        parentCategory: form.parentCategory || undefined,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      };

      const res = await fetch('/api/admin/categories', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: editingId ? JSON.stringify({ _id: editingId, ...payload }) : JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setShowForm(false);
      fetchCategories();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (_id: string) => {
    if (!confirm('Delete this category and all its subcategories?')) return;
    try {
      const res = await fetch(`/api/admin/categories?_id=${_id}`, { method: 'DELETE' });
      if (res.ok) fetchCategories();
    } catch {
      console.error('Delete failed');
    }
  };

  const handleToggleActive = async (_id: string) => {
    try {
      await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id, isActive: !categories.find((c) => c._id === _id)?.isActive }),
      });
      fetchCategories();
    } catch {
      console.error('Toggle failed');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-gray-400" />
            Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product categories</p>
        </div>
        <button
          onClick={() => openCreate()}
          className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm">
            <span className="text-gray-500">Total:</span>{' '}
            <span className="font-bold">{categories.length}</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm">
            <span className="text-gray-500">Active:</span>{' '}
            <span className="font-bold text-green-600">{categories.filter((c) => c.isActive).length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FolderTree className="h-12 w-12 mb-3" />
            <p className="text-sm font-medium">No categories found</p>
            <button onClick={() => openCreate()} className="mt-3 text-sm text-black font-medium hover:underline">
              Create your first category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500">
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Children</th>
                  <th className="px-4 py-3 font-medium">SEO</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
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
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
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
