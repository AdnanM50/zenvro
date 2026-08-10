'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Edit3,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Layers,
  Globe,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { Page } from '@/types';
import { getPagePublicPath } from '@/lib/pagePaths';

interface PagePreviewHubProps {
  page: Page;
  onDeletePage: (id: string) => void;
}

export default function PagePreviewHub({ page }: PagePreviewHubProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState(0);

  const previewPath = getPagePublicPath(page.slug);

  const activeSectionsCount = (page.sections || []).filter((s) => s.isActive).length;
  const hasSeo = Boolean(page.seo?.metaTitle && page.seo?.metaDescription);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
      {/* Top Page Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">{page.title}</h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  page.status === 'published'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}
              >
                {page.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">/{page.slug}</p>
          </div>
        </div>

        {/* Quick Stats & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
            <span className="text-gray-500 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-orange-500" />
              {activeSectionsCount} Active Sections
            </span>
            <span className="h-3 w-px bg-gray-200" />
            <span className="text-gray-500 font-medium flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              {hasSeo ? (
                <span className="text-emerald-600 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> SEO Ready
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-0.5">
                  <AlertCircle className="w-3 h-3" /> Needs SEO
                </span>
              )}
            </span>
          </div>

          <Link
            href={`/admin/cms/pages/${page._id}`}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition shadow-md shadow-orange-500/20"
          >
            <Edit3 className="w-4 h-4" /> Edit Page Content & Settings
          </Link>
        </div>
      </div>

      {/* Live Preview Viewport Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider px-2">Live Viewport:</span>
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              device === 'desktop'
                ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-2xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop (100%)
          </button>
          <button
            type="button"
            onClick={() => setDevice('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              device === 'tablet'
                ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-2xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" /> Tablet (768px)
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              device === 'mobile'
                ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-2xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile (375px)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewKey((k) => k + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <a
            href={previewPath}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-black hover:bg-gray-800 rounded-xl transition shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Public Page
          </a>
        </div>
      </div>

      {/* Frame Canvas */}
      <div className="bg-gray-900/90 rounded-2xl p-4 sm:p-6 flex justify-center items-start min-h-[680px] overflow-x-auto colorful-scrollbar shadow-inner">
        <div
          className={`bg-white rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 border border-gray-700 flex flex-col ${
            device === 'desktop'
              ? 'w-full max-w-[1280px] h-[720px]'
              : device === 'tablet'
              ? 'w-[768px] h-[720px]'
              : 'w-[375px] h-[640px]'
          }`}
        >
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            </div>
            <div className="flex-1 bg-white px-3 py-1 rounded-lg border border-gray-200 text-gray-500 font-mono text-[11px] truncate flex items-center justify-between">
              <span>https://zenvro.com{previewPath}</span>
              <span className="text-[10px] text-emerald-600 font-semibold uppercase">LIVE PREVIEW</span>
            </div>
          </div>

          <iframe
            key={previewKey}
            src={previewPath}
            title="Live Preview Page"
            className="w-full flex-1 border-none bg-white"
          />
        </div>
      </div>
    </div>
  );
}
