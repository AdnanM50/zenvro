'use client';

import React, { useState, useEffect } from 'react';
import type { Page, PageSection, PageSEO, PageStatus } from '@/types';
import { useApiGet, useApiPost, useApiPatch, useApiDelete, createQueryKeys } from '@/hooks';
import { getPages, createPage, updatePage, deletePage } from '@/services/page.service';
import PageListSidebar from './_components/PageListSidebar';
import PageEditor from './_components/PageEditor';
import CreatePageModal from './_components/CreatePageModal';
import { FileText, Sparkles } from 'lucide-react';

const pageQueryKeys = createQueryKeys('admin-cms-pages');

export default function AdminCmsPagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch all CMS pages
  const { data: pagesResponse, isLoading, refetch } = useApiGet<Page[]>({
    queryKey: pageQueryKeys.list({ search: searchQuery }),
    queryFn: () => getPages({ search: searchQuery }),
  });

  const pages = pagesResponse?.data || [];

  // Automatically select the first page if none is selected yet
  useEffect(() => {
    if (pages.length > 0 && !activePageId) {
      setActivePageId(pages[0]._id);
    }
  }, [pages, activePageId]);

  const activePage = pages.find((p) => p._id === activePageId) || pages[0] || null;

  // Mutations
  const createMutation = useApiPost({
    mutationFn: createPage,
    invalidateKeys: [pageQueryKeys.all, pageQueryKeys.lists()],
    successMessage: 'Page created successfully',
    options: {
      onSuccess: (res: any) => {
        setIsCreateModalOpen(false);
        if (res?.data?._id) {
          setActivePageId(res.data._id);
        }
        refetch();
      },
    },
  });

  const updateMutation = useApiPatch({
    mutationFn: updatePage,
    invalidateKeys: [pageQueryKeys.all, pageQueryKeys.lists()],
    successMessage: 'Page changes saved successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const deleteMutation = useApiDelete({
    mutationFn: deletePage,
    invalidateKeys: [pageQueryKeys.all, pageQueryKeys.lists()],
    successMessage: 'Page deleted successfully',
    options: {
      onSuccess: () => {
        setActivePageId(null);
        refetch();
      },
    },
  });

  const handleSavePage = (updatedData: {
    title: string;
    slug: string;
    status: PageStatus;
    sections: PageSection[];
    seo: PageSEO;
  }) => {
    if (!activePage) return;
    updateMutation.mutate({
      _id: activePage._id,
      ...updatedData,
    });
  };

  const handleCreatePage = (data: { title: string; slug: string; status: PageStatus }) => {
    createMutation.mutate(data);
  };

  const handleDeletePage = (pageId: string) => {
    deleteMutation.mutate(pageId);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 flex flex-col h-[calc(100vh-70px)] overflow-hidden">
      {/* Top Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">CMS Page & Section Control</h1>
          <p className="text-xs text-gray-500">
            Dynamically configure page sections, content blocks, and SEO metadata.
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 overflow-hidden">
        {/* Left Sub-Sidebar */}
        <PageListSidebar
          pages={pages}
          activePageId={activePageId}
          onSelectPage={(p) => setActivePageId(p._id)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          isLoading={isLoading}
        />

        {/* Right Main Editor Workspace */}
        {activePage ? (
          <PageEditor
            key={activePage._id}
            page={activePage}
            onSave={handleSavePage}
            onDeletePage={handleDeletePage}
            isSaving={updateMutation.isPending}
          />
        ) : (
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">No Page Selected</h3>
            <p className="text-xs text-gray-400 max-w-sm mt-1 mb-4">
              Select a page from the left sidebar to start customizing its content and dynamic sections.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition shadow-sm"
            >
              + Create New Page
            </button>
          </div>
        )}
      </div>

      {/* Create Page Modal */}
      <CreatePageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePage}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
