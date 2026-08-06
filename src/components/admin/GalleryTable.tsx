'use client';

import React, { useRef, useState } from 'react';
import { Images, Upload, Link2, Search, Loader2, Copy, Check, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { GalleryItem } from '@/types';
import { useApiGet, useApiPost, useApiPut, useApiDelete, createQueryKeys } from '@/hooks';
import { getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '@/services/gallery.service';

const galleryQueryKeys = createQueryKeys('admin-gallery');

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function GalleryTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAlt, setEditAlt] = useState('');

  const { data: galleryResponse, isLoading, refetch } = useApiGet<GalleryItem[]>({
    queryKey: galleryQueryKeys.list({ search, page, limit }),
    queryFn: () => getGallery({ page, limit, search }),
  });

  const items = galleryResponse?.data || [];
  const meta = galleryResponse?.meta || { page: 1, limit: 24, total: 0, totalPages: 1 };

  const createMutation = useApiPost<GalleryItem, { url: string; publicId?: string; source: 'upload' | 'url' }>({
    mutationFn: createGalleryItem,
    invalidateKeys: [galleryQueryKeys.all, galleryQueryKeys.lists()],
    successMessage: 'Image added to gallery',
    options: { onSuccess: () => refetch() },
  });

  const updateMutation = useApiPut({
    mutationFn: updateGalleryItem,
    invalidateKeys: [galleryQueryKeys.all, galleryQueryKeys.lists()],
    successMessage: 'Image details updated',
    options: {
      onSuccess: () => {
        setEditModalOpen(false);
        setEditingItem(null);
        refetch();
      },
    },
  });

  const deleteMutation = useApiDelete({
    mutationFn: deleteGalleryItem,
    invalidateKeys: [galleryQueryKeys.all, galleryQueryKeys.lists()],
    successMessage: 'Image deleted from gallery',
    options: { onSuccess: () => refetch() },
  });

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'velour/gallery');

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'Upload failed');

      await createMutation.mutateAsync({
        url: data.data.url,
        publicId: data.data.publicId,
        source: 'upload',
      });
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => upload(file));
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleAddUrl = () => {
    if (!isValidUrl(urlInput)) {
      toast.error('Please enter a valid image URL');
      return;
    }
    createMutation.mutate(
      { url: urlInput.trim(), source: 'url' },
      {
        onSuccess: () => {
          setUrlInput('');
          setUrlModalOpen(false);
        },
      },
    );
  };

  const handleCopy = (item: GalleryItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(item.url).then(() => {
        setCopiedId(item._id);
        setTimeout(() => setCopiedId(null), 1500);
      });
    }
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditAlt(item.altText || '');
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (!editingItem) return;
    updateMutation.mutate({
      _id: editingItem._id,
      title: editTitle.trim(),
      altText: editAlt.trim(),
    });
  };

  const handleDelete = (item: GalleryItem) => {
    if (confirm('Are you sure you want to delete this image from the gallery?')) {
      deleteMutation.mutate(item._id);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Media Library</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Upload images or add them by URL. Reuse them anywhere via the gallery picker.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search gallery..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-xs"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
          <button
            type="button"
            onClick={() => {
              setUrlInput('');
              setUrlModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Link2 className="h-4 w-4" /> Add from URL
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-2 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xs font-medium">Loading media library...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-2 text-gray-400">
            <Images className="h-10 w-10 opacity-50" />
            <p className="text-sm font-medium">No images in the gallery yet</p>
            <p className="text-xs">Upload images or add them from a URL to get started.</p>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800"
                >
                  <img
                    src={item.url}
                    alt={item.altText || item.title || 'Gallery image'}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  />
                  {item.title && (
                    <span className="absolute bottom-0 inset-x-0 px-2 py-1 bg-black/60 text-white text-[10px] truncate text-left">
                      {item.title}
                    </span>
                  )}
                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      title="Copy URL"
                      className="p-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {copiedId === item._id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      title="Edit title / alt text"
                      className="p-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      title="Delete"
                      className="p-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={meta.page}
              limit={meta.limit}
              total={meta.total}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              pageSizeOptions={[12, 24, 48, 96]}
              itemUnitName="images"
            />
          </div>
        )}
      </div>

      {/* Add from URL modal */}
      <Modal
        isOpen={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        title="Add Image from URL"
        footer={
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setUrlModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddUrl}
              disabled={createMutation.isPending || !urlInput.trim()}
              className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40"
            >
              {createMutation.isPending ? 'Adding...' : 'Add to Gallery'}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Paste a direct image URL (https://...). It will be added to your media library.
          </p>
          <div className="space-y-2">
            <Label htmlFor="gallery-url">Image URL</Label>
            <Input
              id="gallery-url"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddUrl();
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Image Details"
        footer={
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEditSave}
              disabled={updateMutation.isPending}
              className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {editingItem && (
            <img
              src={editingItem.url}
              alt="Preview"
              className="w-full h-40 object-cover rounded-xl border border-gray-200 dark:border-gray-800"
            />
          )}
          <div className="space-y-2">
            <Label htmlFor="gallery-title">Title</Label>
            <Input
              id="gallery-title"
              placeholder="e.g. Summer Collection Hero"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gallery-alt">Alt Text</Label>
            <Input
              id="gallery-alt"
              placeholder="Descriptive text for accessibility & SEO"
              value={editAlt}
              onChange={(e) => setEditAlt(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
