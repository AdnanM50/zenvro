'use client';

import React, { useState } from 'react';
import { Globe, Share2, Search, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import type { ProductSEO } from '@/types';

interface SeoPreviewProps {
  seo: ProductSEO;
  productName: string;
  productSlug: string;
  featuredImage?: string;
}

export default function SeoPreview({
  seo,
  productName,
  productSlug,
  featuredImage,
}: SeoPreviewProps) {
  const [activeTab, setActiveTab] = useState<'google' | 'og' | 'twitter'>('google');

  const domain = 'https://zenvro.com';
  const displayTitle = seo.title || productName || 'Product Title Placeholder';
  const displaySlug = productSlug || 'product-slug';
  const displayUrl = `${domain}/products/${displaySlug}`;
  const displayDesc =
    seo.description ||
    'Discover our latest premium fashion item with high quality craftsmanship and contemporary design.';

  const ogTitle = seo.ogTitle || displayTitle;
  const ogDesc = seo.ogDescription || displayDesc;
  const ogImg = seo.ogImage || featuredImage || '';

  const twitterTitle = seo.twitterTitle || displayTitle;
  const twitterDesc = seo.twitterDescription || displayDesc;
  const twitterImg = seo.twitterImage || ogImg || '';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-semibold text-white">Live Search & Social Preview</h3>
        </div>
        <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'google'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('og')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'og'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Open Graph</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('twitter')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'twitter'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Twitter Card</span>
          </button>
        </div>
      </div>

      {/* Google Preview Tab */}
      {activeTab === 'google' && (
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-sans">
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <span className="truncate max-w-md">{displayUrl}</span>
          </div>
          <h4 className="text-lg text-blue-400 font-medium hover:underline cursor-pointer truncate mb-1">
            {displayTitle} | Zenvro
          </h4>
          <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{displayDesc}</p>
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center gap-4 text-[11px] text-slate-500">
            <span>Robots: <strong className="text-slate-300">{seo.robots || 'index, follow'}</strong></span>
            <span>Focus Keyword: <strong className="text-slate-300">{seo.focusKeyword || 'None'}</strong></span>
          </div>
        </div>
      )}

      {/* Open Graph Tab */}
      {activeTab === 'og' && (
        <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden max-w-md mx-auto">
          {ogImg ? (
            <div className="relative w-full h-48 bg-slate-900">
              <Image
                src={ogImg}
                alt="OG Preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-full h-36 bg-slate-800 flex items-center justify-center text-slate-500 text-xs">
              No Open Graph Image Set
            </div>
          )}
          <div className="p-3 bg-slate-900">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              zenvro.com
            </span>
            <h5 className="text-sm font-semibold text-white line-clamp-1">{ogTitle}</h5>
            <p className="text-xs text-slate-400 line-clamp-2 mt-1">{ogDesc}</p>
          </div>
        </div>
      )}

      {/* Twitter Card Tab */}
      {activeTab === 'twitter' && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden max-w-md mx-auto">
          {twitterImg ? (
            <div className="relative w-full h-48 bg-slate-900">
              <Image
                src={twitterImg}
                alt="Twitter Preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-full h-36 bg-slate-800 flex items-center justify-center text-slate-500 text-xs">
              No Twitter Image Set
            </div>
          )}
          <div className="p-3 bg-slate-950">
            <span className="text-[11px] text-slate-400 block mb-0.5">{domain}</span>
            <h5 className="text-sm font-semibold text-white line-clamp-1">{twitterTitle}</h5>
            <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{twitterDesc}</p>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-400">
        <div className="flex items-center space-x-1.5 bg-slate-800/40 p-2 rounded border border-slate-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="truncate">Sitemap: {seo.sitemap?.include ? 'Included' : 'Excluded'}</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-slate-800/40 p-2 rounded border border-slate-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="truncate">Priority: {seo.sitemap?.priority ?? 0.8}</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-slate-800/40 p-2 rounded border border-slate-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="truncate">Freq: {seo.sitemap?.changefreq ?? 'weekly'}</span>
        </div>
      </div>
    </div>
  );
}
