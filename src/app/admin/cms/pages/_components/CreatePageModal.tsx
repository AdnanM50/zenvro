'use client';

import React, { useState } from 'react';
import Modal from '@/app/admin/_components/common/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PageStatus } from '@/types';
import { slugify } from '@/lib/slugify';

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; slug: string; status: PageStatus }) => void;
  isLoading?: boolean;
}

export default function CreatePageModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreatePageModalProps) {
  const [title, setTitle] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [status, setStatus] = useState<PageStatus>('published');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      slug: customSlug.trim() ? slugify(customSlug) : slugify(title),
      status,
    });
    setTitle('');
    setCustomSlug('');
    setStatus('published');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New CMS Page" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="page-title">Page Title *</Label>
          <Input
            id="page-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!customSlug) {
                setCustomSlug(slugify(e.target.value));
              }
            }}
            placeholder="e.g. Return & Exchange Policy"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="page-slug">Page URL Slug</Label>
          <div className="flex items-center mt-1">
            <span className="bg-gray-100 text-gray-500 text-xs px-3 py-2 border border-r-0 border-gray-200 rounded-l-xl">
              /
            </span>
            <Input
              id="page-slug"
              value={customSlug}
              onChange={(e) => setCustomSlug(slugify(e.target.value))}
              placeholder="return-exchange-policy"
              className="rounded-l-none"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="page-status">Initial Status</Label>
          <select
            id="page-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PageStatus)}
            className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="px-4 py-2 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Page'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
