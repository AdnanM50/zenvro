'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Images, Upload, Link2, Loader2, Search, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/app/admin/_components/common/Modal';
import Pagination from '@/app/admin/_components/common/pagination';
import type { GalleryItem } from '@/types';
import { useApiGet, useApiPost, createQueryKeys } from '@/hooks';
import { getGallery, createGalleryItem } from '@/services/gallery.service';

const galleryQueryKeys = createQueryKeys('admin-gallery');

type Tab = 'library' | 'upload' | 'url';

interface GalleryPickerProps {
  open: boolean;
  onClose: () => void;
  /** Called with the list of selected image URLs. */
  onSelect: (urls: string[]) => void;
  /** When true the user can select multiple images. */
  multiple?: boolean;
  /** Cloudinary folder used when uploading from the picker. */
  folder?: string;
  /** URLs already selected (for highlight + de-duplication). */
  selectedUrls?: string[];
}

const GALLERY_LIMIT = 24;

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function GalleryPicker({
  open,
  onClose,
  onSelect,
  multiple = false,
  folder = 'velour/gallery',
  selectedUrls = [],
}: GalleryPickerProps) {
  const [tab, setTab] = useState<Tab>('library');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selection, setSelection] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [addingUrl, setAddingUrl] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: galleryResponse, isLoading } = useApiGet<GalleryItem[]>({
    queryKey: galleryQueryKeys.list({ search, page, limit: GALLERY_LIMIT }),
    queryFn: () => getGallery({ page, limit: GALLERY_LIMIT, search }),
    options: { enabled: open },
  });

  const createMutation = useApiPost<GalleryItem, { url: string; publicId?: string; source: 'upload' | 'url' }>({
    mutationFn: createGalleryItem,
    invalidateKeys: [galleryQueryKeys.all, galleryQueryKeys.lists()],
    successMessage: 'Image added to gallery',
  });

  const items = galleryResponse?.data || [];
  const meta = galleryResponse?.meta || { page: 1, limit: GALLERY_LIMIT, total: 0, totalPages: 1 };

  const selectedSet = useMemo(() => new Set(selectedUrls), [selectedUrls]);
  const previewSelection = useMemo(() => new Set(selection), [selection]);

  useEffect(() => {
    if (open) {
      setTab('library');
      setSearch('');
      setPage(1);
      setSelection([]);
      setUrlInput('');
    }
  }, [open]);

  const toggleSelect = (url: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelection((prev) => {
      if (prev.includes(url)) return prev.filter((u) => u !== url);
      if (!multiple) return [url];
      return [...prev, url];
    });
  };

  const insert = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (selection.length === 0) return;
    onSelect(selection);
    onClose();
  };

  const uploadAndAdd = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'Upload failed');

      const created = await createMutation.mutateAsync({
        url: data.data.url,
        publicId: data.data.publicId,
        source: 'upload',
      });

      const url = created.data.url;
      setSelection((prev) => (multiple && !prev.includes(url) ? [...prev, url] : multiple ? prev : [url]));
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAndAdd(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) uploadAndAdd(file);
  };

  const addUrl = async () => {
    if (!isValidUrl(urlInput)) {
      toast.error('Please enter a valid image URL');
      return;
    }
    setAddingUrl(true);
    try {
      const created = await createMutation.mutateAsync({ url: urlInput.trim(), source: 'url' });
      const url = created.data.url;
      setSelection((prev) => (multiple && !prev.includes(url) ? [...prev, url] : multiple ? prev : [url]));
      setUrlInput('');
    } catch {
      toast.error('Could not add image from URL');
    } finally {
      setAddingUrl(false);
    }
  };

  const tabButtonClass = (active: boolean) =>
    `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
      active
        ? 'bg-black dark:bg-white text-white dark:text-black'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Media Library"
      maxWidth="4xl"
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {selection.length > 0
              ? `${selection.length} image${selection.length > 1 ? 's' : ''} selected`
              : 'Select an image to insert'}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={insert}
              disabled={selection.length === 0}
              className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Insert {multiple && selection.length > 1 ? `(${selection.length})` : ''}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
          <button type="button" className={tabButtonClass(tab === 'library')} onClick={() => setTab('library')}>
            <Images className="h-4 w-4" /> Media Library
          </button>
          <button type="button" className={tabButtonClass(tab === 'upload')} onClick={() => setTab('upload')}>
            <Upload className="h-4 w-4" /> Upload
          </button>
          <button type="button" className={tabButtonClass(tab === 'url')} onClick={() => setTab('url')}>
            <Link2 className="h-4 w-4" /> From URL
          </button>
        </div>

        {/* ── Media Library ── */}
        {tab === 'library' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search gallery..."
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100"
              />
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs font-medium">Loading media library...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
                <Images className="h-10 w-10 opacity-50" />
                <p className="text-sm font-medium">No images found</p>
                <p className="text-xs">Upload an image or add one from a URL to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[40vh] overflow-y-auto pr-1">
                {items.map((item) => {
                  const isSelected = previewSelection.has(item.url) || selectedSet.has(item.url);
                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={(e) => toggleSelect(item.url, e)}
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelect([item.url]);
                        onClose();
                      }}
                      title={item.title || item.url}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-gray-100 dark:bg-gray-800 group transition-all ${
                        isSelected
                          ? 'border-black dark:border-white ring-2 ring-black/20 dark:ring-white/20'
                          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <img src={item.url} alt={item.altText || item.title || 'Gallery image'} className="w-full h-full object-cover" />
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-sm">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                      {item.title && (
                        <span className="absolute bottom-0 inset-x-0 px-2 py-1 bg-black/60 text-white text-[10px] truncate opacity-0 group-hover:opacity-100 transition-opacity text-left">
                          {item.title}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {meta.totalPages > 1 && (
              <Pagination
                page={meta.page}
                limit={meta.limit}
                total={meta.total}
                totalPages={meta.totalPages}
                onPageChange={setPage}
                showPageSizeSelector={false}
                showPageJump={false}
                itemUnitName="images"
              />
            )}
          </div>
        )}

        {/* ── Upload ── */}
        {tab === 'upload' && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl py-16 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click or drag an image here</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, GIF or SVG. Max 5MB.</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* ── From URL ── */}
        {tab === 'url' && (
          <div className="space-y-3 py-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Paste a direct image URL (https://...). The image will be added to your gallery and selected.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addUrl();
                  }
                }}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={addUrl}
                disabled={addingUrl || !urlInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {addingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Add &amp; Select
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
