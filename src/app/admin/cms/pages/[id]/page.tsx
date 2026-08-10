'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApiGet, useApiPatch, createQueryKeys } from '@/hooks';
import { getPageById, updatePage } from '@/services/page.service';
import PageEditor from '../_components/PageEditor';
import { ArrowLeft, Layers, Loader2, Sparkles } from 'lucide-react';
import type { Page, PageSection, PageSEO, PageStatus } from '@/types';

const pageQueryKeys = createQueryKeys('admin-cms-page-detail');

export default function DedicatedPageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params?.id as string;

  const { data: response, isLoading, refetch } = useApiGet<Page>({
    queryKey: pageQueryKeys.detail(pageId),
    queryFn: () => getPageById(pageId),
    options: {
      enabled: Boolean(pageId),
    },
  });

  const page = response?.data;

  const updateMutation = useApiPatch({
    mutationFn: updatePage,
    invalidateKeys: [pageQueryKeys.all],
    successMessage: 'Page updated successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const handleSave = (updatedData: {
    title: string;
    slug: string;
    status: PageStatus;
    sections: PageSection[];
    seo: PageSEO;
  }) => {
    if (!pageId) return;
    updateMutation.mutate({
      _id: pageId,
      ...updatedData,
    });
  };

  const handleDelete = () => {
    router.push('/admin/cms/pages');
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-[600px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-12">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
        <p className="text-xs font-semibold text-gray-600">Loading Page Editor Workspace...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex-1 min-h-[600px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Page Not Found</h3>
        <p className="text-xs text-gray-400 max-w-sm mt-1 mb-4">
          The CMS page you are looking for does not exist or has been deleted.
        </p>
        <button
          onClick={() => router.push('/admin/cms/pages')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Pages
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Navigation Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => router.push('/admin/cms/pages')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Pages
          </button>
          <div className="h-4 w-px bg-gray-200 shrink-0" />
          <h1 className="text-xs sm:text-base font-bold text-gray-900 truncate">
            Editing: <span className="text-orange-600">{page.title}</span>
          </h1>
        </div>
      </div>

      {/* Full Page Editor */}
      <PageEditor
        key={page._id}
        page={page}
        onSave={handleSave}
        onDeletePage={handleDelete}
        isSaving={updateMutation.isPending}
      />
    </div>
  );
}
