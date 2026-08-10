'use client';

import React from 'react';
import type { PageSEO } from '@/types';
import GalleryPickerButton from '@/app/admin/gallery/_components/GalleryPickerButton';
import { Search, Image as ImageIcon, Link as LinkIcon, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PageSeoFormProps {
  seo: PageSEO;
  onChange: (updatedSeo: PageSEO) => void;
}

export default function PageSeoForm({ seo, onChange }: PageSeoFormProps) {
  const handleChange = (field: keyof PageSEO, value: string) => {
    onChange({
      ...seo,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">SEO & Social Sharing Metadata</h3>
          <p className="text-xs text-gray-400">Optimize search engine rankings and social preview cards</p>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <label className="block font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            Meta Title
          </label>
          <Input
            type="text"
            value={seo?.metaTitle || ''}
            onChange={(e) => handleChange('metaTitle', e.target.value)}
            className="bg-gray-50 focus:bg-white focus:border-orange-500 h-10"
            placeholder="Page title displayed on search engines..."
          />
          <div className="mt-1 flex justify-between text-[11px] text-gray-400">
            <span>Recommended length: 50-60 characters</span>
            <span className={((seo?.metaTitle?.length || 0) > 60) ? 'text-amber-600 font-semibold' : ''}>
              {seo?.metaTitle?.length || 0} chars
            </span>
          </div>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            Meta Description
          </label>
          <textarea
            rows={3}
            value={seo?.metaDescription || ''}
            onChange={(e) => handleChange('metaDescription', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:bg-white focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="Brief snippet describing this page for search engine results..."
          />
          <div className="mt-1 flex justify-between text-[11px] text-gray-400">
            <span>Recommended length: 140-160 characters</span>
            <span className={((seo?.metaDescription?.length || 0) > 160) ? 'text-amber-600 font-semibold' : ''}>
              {seo?.metaDescription?.length || 0} chars
            </span>
          </div>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">Meta Keywords</label>
          <Input
            type="text"
            value={seo?.metaKeywords || ''}
            onChange={(e) => handleChange('metaKeywords', e.target.value)}
            className="bg-gray-50 focus:bg-white focus:border-orange-500 h-10"
            placeholder="Comma-separated keywords (e.g. about us, zenvro, store)"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
            Open Graph (OG) Preview Image URL
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={seo?.ogImage || ''}
              onChange={(e) => handleChange('ogImage', e.target.value)}
              className="flex-1 bg-gray-50 focus:bg-white focus:border-orange-500 h-10"
              placeholder="https://..."
            />
            <GalleryPickerButton
              onSelect={(urls) => handleChange('ogImage', urls[0] || '')}
              label="Select Image"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
            Canonical URL
          </label>
          <Input
            type="text"
            value={seo?.canonicalUrl || ''}
            onChange={(e) => handleChange('canonicalUrl', e.target.value)}
            className="bg-gray-50 focus:bg-white focus:border-orange-500 h-10"
            placeholder="https://zenvro.com/..."
          />
        </div>

        {/* Google Search Result Mockup Preview */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 mb-2">Search Result Preview</h4>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-sans">
            <div className="text-[11px] text-gray-600 truncate">{seo?.canonicalUrl || 'https://zenvro.com'}</div>
            <div className="text-sm font-medium text-blue-700 hover:underline cursor-pointer truncate">
              {seo?.metaTitle || 'Page Title'}
            </div>
            <div className="text-xs text-gray-600 line-clamp-2 mt-0.5">
              {seo?.metaDescription || 'Add a meta description to preview how this page will look in search results.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
