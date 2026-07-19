'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Globe } from 'lucide-react';
import type { Category, CategoryFormData } from '@/types';
import ImageUpload from './ImageUpload';

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  form: CategoryFormData;
  setForm: (form: CategoryFormData) => void;
  editing: boolean;
  saving: boolean;
  error: string;
  categories: Category[];
}

export default function CategoryFormModal({
  open,
  onClose,
  onSave,
  form,
  setForm,
  editing,
  saving,
  error,
  categories,
}: CategoryFormModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold">{editing ? 'Edit Category' : 'Create Category'}</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{error}</div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    placeholder="auto-generated from name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Parent Category</label>
                <select
                  value={form.parentCategory}
                  onChange={(e) => setForm({ ...form, parentCategory: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                >
                  <option value="">None (Root Category)</option>
                  {categories.filter((c) => !c.parentCategory).map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                  placeholder="Category description"
                />
              </div>

              {/* Media */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUpload
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url })}
                  label="Category Image"
                  folder="velour/categories"
                />
                <ImageUpload
                  value={form.banner}
                  onChange={(url) => setForm({ ...form, banner: url })}
                  label="Banner Image"
                  folder="velour/banners"
                />
              </div>

              {/* SEO */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" /> SEO Settings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">SEO Title</label>
                    <input
                      type="text"
                      value={form.seo.title}
                      onChange={(e) => setForm({ ...form, seo: { ...form.seo, title: e.target.value } })}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                      placeholder="Page title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Canonical URL</label>
                    <input
                      type="text"
                      value={form.seo.canonical}
                      onChange={(e) => setForm({ ...form, seo: { ...form.seo, canonical: e.target.value } })}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Meta Description</label>
                  <textarea
                    value={form.seo.description}
                    onChange={(e) => setForm({ ...form, seo: { ...form.seo, description: e.target.value } })}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                    placeholder="SEO description"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">OG Image</label>
                    <input
                      type="text"
                      value={form.seo.ogImage}
                      onChange={(e) => setForm({ ...form, seo: { ...form.seo, ogImage: e.target.value } })}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Robots</label>
                    <select
                      value={form.seo.robots}
                      onChange={(e) => setForm({ ...form, seo: { ...form.seo, robots: e.target.value } })}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    >
                      <option value="index">Index</option>
                      <option value="noindex">No Index</option>
                      <option value="nofollow">No Follow</option>
                      <option value="noindex,nofollow">No Index, No Follow</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={form.seo.keywords.join(', ')}
                    onChange={(e) => setForm({ ...form, seo: { ...form.seo, keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean) } })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    placeholder="keyword1, keyword2"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow"
                    animate={{ x: form.isActive ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
