'use client';

import React from 'react';
import { Search, Plus, FileText, Info, Mail, ShieldAlert, FileCheck, Layers } from 'lucide-react';
import type { Page } from '@/types';

interface PageListSidebarProps {
  pages: Page[];
  activePageId: string | null;
  onSelectPage: (page: Page) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreateModal: () => void;
  isLoading?: boolean;
}

export default function PageListSidebar({
  pages,
  activePageId,
  onSelectPage,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  isLoading = false,
}: PageListSidebarProps) {
  const getPageIcon = (slug: string) => {
    switch (slug) {
      case 'about-us':
        return Info;
      case 'contact-us':
        return Mail;
      case 'privacy-policy':
        return ShieldAlert;
      case 'terms-conditions':
        return FileCheck;
      default:
        return FileText;
    }
  };

  return (
    <aside className="w-full lg:w-72 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">CMS Pages</h2>
            <p className="text-xs text-gray-400">Manage pages & sections</p>
          </div>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="w-8 h-8 rounded-xl bg-black text-white hover:bg-gray-800 transition flex items-center justify-center shadow-sm"
          title="Add New Page"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Filter pages..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>

      {/* Pages List */}
      <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-gray-400 animate-pulse">Loading pages...</div>
        ) : pages.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">No pages found</div>
        ) : (
          pages.map((page) => {
            const Icon = getPageIcon(page.slug);
            const isSelected = activePageId === page._id;

            return (
              <button
                key={page._id}
                onClick={() => onSelectPage(page)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-150 text-left ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-gray-400'}`}
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate">{page.title}</div>
                    <div className={`text-[10px] truncate ${isSelected ? 'text-orange-100' : 'text-gray-400'}`}>
                      /{page.slug}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : page.status === 'published'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}
                  >
                    {page.status}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
