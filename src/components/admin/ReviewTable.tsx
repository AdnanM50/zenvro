'use client';

import React, { useState } from 'react';
import { MessageSquare, Check, X, Trash2, Eye, EyeOff, ShieldCheck, ShieldOff } from 'lucide-react';
import type { Review, ReviewStatus } from '@/types';
import { useApiGet } from '@/hooks';
import {
  getAdminReviews,
  updateReviewApproval,
  deleteReview,
} from '@/services/review.service';
import { useUpdateReviewApproval, useDeleteReview } from '@/hooks';
import DataTable, { ColumnDef } from '@/app/admin/_components/common/DataTable';
import ConfirmDialog from '@/app/admin/_components/common/ConfirmDialog';

const statusTones: Record<ReviewStatus, string> = {
  pending: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  approved: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  rejected: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
};

function renderStars(rating: number) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-amber-500' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function ReviewTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: response, isLoading, refetch } = useApiGet<Review[]>({
    queryKey: ['admin-reviews', 'list', { search, page, limit }],
    queryFn: () => getAdminReviews({ search, page, limit }),
  });

  const reviews = response?.data || [];
  const meta = response?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const approveMutation = useUpdateReviewApproval({
    options: {
      onSuccess: () => refetch(),
    },
  });

  const deleteMutation = useDeleteReview({
    options: {
      onSuccess: () => refetch(),
    },
  });

  const handleApprove = (review: Review) => {
    approveMutation.mutate({
      _id: review._id,
      status: review.status === 'approved' ? 'pending' : 'approved',
    });
  };

  const handleReject = (review: Review) => {
    approveMutation.mutate({ _id: review._id, status: 'rejected' });
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

  const columns: ColumnDef<Review>[] = [
    {
      key: 'review',
      header: 'Review',
      render: (r) => (
        <div className="max-w-[280px]">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-gray-900 dark:text-white truncate">{r.title || 'Untitled'}</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">{r.comment}</p>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (r) => (
        <div className="flex flex-col items-start gap-0.5">
          {renderStars(r.rating)}
          <span className="text-[10px] text-gray-400">{r.rating}/5</span>
        </div>
      ),
    },
    {
      key: 'product',
      header: 'Product',
      render: (r) => (
        <code className="font-mono text-[11px] text-gray-600 dark:text-gray-300 select-all">{r.product}</code>
      ),
    },
    {
      key: 'user',
      header: 'User',
      render: (r) => (
        <code className="font-mono text-[11px] text-gray-600 dark:text-gray-300 select-all">{r.user}</code>
      ),
    },
    {
      key: 'purchase',
      header: 'Verified',
      render: (r) =>
        r.isVerifiedPurchase ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <ShieldCheck className="h-3 w-3" /> Purchased
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            <ShieldOff className="h-3 w-3" /> Guest
          </span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${statusTones[r.status || 'pending']}`}>
          {r.status || 'pending'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleApprove(r)}
            className="p-1.5 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg text-gray-400 hover:text-green-600 transition-colors"
            title={r.status === 'approved' ? 'Unapprove' : 'Approve'}
          >
            {r.status === 'approved' ? <EyeOff className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          </button>
          {r.status !== 'rejected' && (
            <button
              onClick={() => handleReject(r)}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
              title="Reject"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => handleDelete(r._id)}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Reviews"
        description="Moderate customer reviews, approve or reject submissions."
        columns={columns}
        data={reviews}
        keyExtractor={(r) => r._id}
        loading={isLoading}
        emptyMessage="No reviews found"
        emptyIcon={<MessageSquare className="h-10 w-10 mb-2 text-gray-400 opacity-50" />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search reviews...',
        }}
        pagination={{
          page: meta.page,
          limit: meta.limit,
          total: meta.total,
          totalPages: meta.totalPages,
          onPageChange: setPage,
          onLimitChange: (newLimit) => {
            setLimit(newLimit);
            setPage(1);
          },
          itemUnitName: 'reviews',
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        description="Are you sure you want to delete this review? This action cannot be undone."
      />
    </>
  );
}
