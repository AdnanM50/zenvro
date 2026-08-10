'use client';

import React, { useState } from 'react';
import { Quote, Plus, Edit3, Trash2, Star, UserCheck, Sparkles } from 'lucide-react';
import type { Testimonial } from '@/types';
import { useApiGet, useApiPost, useApiPatch, useApiDelete, createQueryKeys } from '@/hooks';
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '@/services/testimonial.service';
import DataTable, { ColumnDef } from '@/app/admin/_components/common/DataTable';
import Modal from '@/app/admin/_components/common/Modal';
import ConfirmDialog from '@/app/admin/_components/common/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GalleryPickerButton from '../../app/admin/gallery/_components/GalleryPickerButton';

const testimonialQueryKeys = createQueryKeys('admin-testimonials');

export default function TestimonialTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');
  const [avatar, setAvatar] = useState('');
  const [rating, setRating] = useState('5');
  const [reviewCount, setReviewCount] = useState('49');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Fetch Testimonials
  const { data: testimonialResponse, isLoading, refetch } = useApiGet<Testimonial[]>({
    queryKey: testimonialQueryKeys.list({ search, page, limit }),
    queryFn: () => getTestimonials({ page, limit, search }),
  });

  const testimonials = testimonialResponse?.data || [];
  const meta = testimonialResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Mutations
  const createMutation = useApiPost({
    mutationFn: createTestimonial,
    invalidateKeys: [testimonialQueryKeys.all, testimonialQueryKeys.lists()],
    successMessage: 'Testimonial created successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const updateMutation = useApiPatch({
    mutationFn: updateTestimonial,
    invalidateKeys: [testimonialQueryKeys.all, testimonialQueryKeys.lists()],
    successMessage: 'Testimonial updated successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  const deleteMutation = useApiDelete({
    mutationFn: deleteTestimonial,
    invalidateKeys: [testimonialQueryKeys.all, testimonialQueryKeys.lists()],
    successMessage: 'Testimonial deleted successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const resetForm = () => {
    setName('');
    setRole('');
    setQuote('');
    setAvatar('');
    setRating('5');
    setReviewCount('49');
    setIsFeatured(false);
    setStatus('active');
  };

  const openCreateModal = () => {
    setEditingTestimonial(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setName(testimonial.name);
    setRole(testimonial.role);
    setQuote(testimonial.quote);
    setAvatar(testimonial.avatar || '');
    setRating(String(testimonial.rating));
    setReviewCount(testimonial.reviewCount !== undefined ? String(testimonial.reviewCount) : '');
    setIsFeatured(testimonial.isFeatured ?? false);
    setStatus(testimonial.status);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTestimonial(null);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !quote.trim()) return;

    const payload = {
      name: name.trim(),
      role: role.trim(),
      quote: quote.trim(),
      avatar: avatar.trim() || undefined,
      rating: Number(rating) || 5,
      reviewCount: reviewCount ? Number(reviewCount) : undefined,
      isFeatured,
      status,
    };

    if (editingTestimonial) {
      updateMutation.mutate({ _id: editingTestimonial._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const columns: ColumnDef<Testimonial>[] = [
    {
      key: 'name',
      header: 'Author',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.avatar ? (
            <img
              src={item.avatar}
              alt={item.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-800"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-sm">
              {item.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              {item.name}
              {item.isFeatured && (
                <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-semibold border border-amber-200 dark:border-amber-800 flex items-center gap-0.5">
                  <Sparkles className="h-2.5 w-2.5" /> Featured
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.role}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'quote',
      header: 'Quote / Testimonial',
      render: (item) => (
        <p className="text-xs text-gray-700 dark:text-gray-300 max-w-md line-clamp-2 italic">
          &ldquo;{item.quote}&rdquo;
        </p>
      ),
    },
    {
      key: 'rating',
      header: 'Rating & Reviews',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <div className="flex items-center text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < item.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300 dark:text-gray-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-900 dark:text-white">{item.rating.toFixed(1)}</span>
          {item.reviewCount !== undefined && (
            <span className="text-[11px] text-gray-400">({item.reviewCount} Reviews)</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            item.status === 'active'
              ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
          }`}
        >
          {item.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEditModal(item)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
            title="Edit Testimonial"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item._id)}
            disabled={deleteMutation.isPending}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Delete Testimonial"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Quote className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Testimonials Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage customer feedback, hero block quotes, ratings, and social proof.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm shadow-md"
        >
          <Plus className="h-4 w-4" />
          Add Testimonial
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <Input
          type="text"
          placeholder="Search by author name, role, or quote..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-md"
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={testimonials}
        keyExtractor={(item) => item._id}
        loading={isLoading}
        emptyMessage="No testimonials found."        pagination={{
          page: meta.page,
          limit: meta.limit,
          total: meta.total,
          totalPages: meta.totalPages,
          onPageChange: setPage,
          onLimitChange: (l) => {
            setLimit(l);
            setPage(1);
          },
        }}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingTestimonial ? 'Edit Testimonial' : 'Create New Testimonial'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Author Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. EMMA WILLIAMS"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="role">Author Role / Designation *</Label>
              <Input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. FASHION STYLIST"
                required
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="quote">Testimonial Quote *</Label>
            <textarea
              id="quote"
              rows={4}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Everything is absolutely perfect! From the fabric quality to the flawless fit every piece feels premium..."
              required
              className="w-full mt-1.5 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <Label>Author Avatar Image URL</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <Input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
              <GalleryPickerButton onSelect={(urls) => urls[0] && setAvatar(urls[0])} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating">Rating (1 to 5) *</Label>
              <select
                id="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              >
                <option value="5">5.0 (Excellent)</option>
                <option value="4.5">4.5</option>
                <option value="4">4.0</option>
                <option value="3.5">3.5</option>
                <option value="3">3.0</option>
              </select>
            </div>

            <div>
              <Label htmlFor="reviewCount">Review Count Subtitle</Label>
              <Input
                id="reviewCount"
                type="number"
                value={reviewCount}
                onChange={(e) => setReviewCount(e.target.value)}
                placeholder="e.g. 49"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full mt-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                id="isFeatured"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black dark:focus:ring-white"
              />
              <Label htmlFor="isFeatured" className="cursor-pointer">
                Feature on Homepage
              </Label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingTestimonial
                ? 'Update Testimonial'
                : 'Create Testimonial'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        description="Are you sure you want to delete this testimonial? This action cannot be undone."
      />
    </div>
  );
}
