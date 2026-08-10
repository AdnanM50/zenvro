'use client';

import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { PageSEO } from '@/types';
import GalleryPickerButton from '@/app/admin/gallery/_components/GalleryPickerButton';
import {
  Search,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Sparkles,
  Star,
  Hash,
  Quote,
  X,
  Gauge,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PageSeoFormProps {
  seo: PageSEO;
  onChange: (updatedSeo: PageSEO) => void;
}

function ChipField({
  label,
  hint,
  icon: Icon,
  chipClassName,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  hint: string;
  icon: LucideIcon;
  chipClassName?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);

  const commit = () => {
    const next = draft.trim().replace(/,+$/, '').trim();
    if (!next) return;
    if (!values.some((v) => v.toLowerCase() === next.toLowerCase())) {
      onChange([...values, next]);
    }
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const items = e.clipboardData
      .getData('text')
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!items.length) return;
    const combined = [...values];
    for (const item of items) {
      if (!combined.some((v) => v.toLowerCase() === item.toLowerCase())) combined.push(item);
    }
    onChange(combined);
    setDraft('');
  };

  return (
    <div>
      <label className="block font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        {label}
        <span className="text-[10px] font-semibold text-gray-400 ml-auto">{values.length} added</span>
      </label>
      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 rounded-md border bg-white px-2.5 py-2 transition-all',
          focused
            ? 'border-orange-500 ring-4 ring-orange-500/10 shadow-sm'
            : 'border-gray-200 hover:border-gray-300'
        )}
      >
        {values.map((value, i) => (
          <span
            key={i}
            className={cn(
              'inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-[11px] font-medium border',
              chipClassName
            )}
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              className="p-0.5 rounded-full opacity-60 hover:opacity-100 transition"
              title="Remove"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 min-w-[160px] bg-transparent text-xs outline-none placeholder:text-gray-400 py-0.5"
          placeholder={values.length ? 'Add another...' : placeholder}
        />
      </div>
      <p className="mt-1 text-[11px] text-gray-400">{hint}</p>
    </div>
  );
}

export default function PageSeoForm({ seo, onChange }: PageSeoFormProps) {
  const handleChange = (field: keyof PageSEO, value: string) => {
    onChange({
      ...seo,
      [field]: value,
    });
  };

  const keywords: string[] = [
    ...(seo?.focusKeyword ? [seo.focusKeyword] : []),
    ...(seo?.metaKeywords
      ? seo.metaKeywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      : []),
    ...(seo?.additionalKeywords || []),
  ];

  const phrases = seo?.searchPhrases || [];

  const titleLen = seo?.metaTitle?.length || 0;
  const descLen = seo?.metaDescription?.length || 0;
  const checks = [
    titleLen >= 50 && titleLen <= 60,
    descLen >= 140 && descLen <= 160,
    keywords.length > 0,
    phrases.length > 0,
    Boolean(seo?.ogImage),
  ];
  const score = checks.filter(Boolean).length;
  const scoreTotal = checks.length;
  const scoreBadge =
    score === scoreTotal
      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
      : score >= 3
      ? 'bg-orange-50 text-orange-600 border-orange-200'
      : 'bg-red-50 text-red-500 border-red-200';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">SEO &amp; Social Sharing Metadata</h3>
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
            className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
            placeholder="Page title displayed on search engines..."
          />
          <div className="mt-1 flex justify-between text-[11px] text-gray-400">
            <span>Recommended length: 50-60 characters</span>
            <span className={titleLen > 60 ? 'text-amber-600 font-semibold' : ''}>{titleLen} chars</span>
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
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:bg-white focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="Brief snippet describing this page for search engine results..."
          />
          <div className="mt-1 flex justify-between text-[11px] text-gray-400">
            <span>Recommended length: 140-160 characters</span>
            <span className={descLen > 160 ? 'text-amber-600 font-semibold' : ''}>{descLen} chars</span>
          </div>
        </div>

        {/* Keyword Strategy */}
        <div className="relative overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50/50 p-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-xs">Keyword Strategy</h4>
              <p className="text-[11px] text-gray-400">Add the exact words and sentences people use to find this page</p>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              Primary Focus Keyword
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-100/70 border border-amber-200 rounded-full px-1.5 py-px ml-auto">
                #1 target
              </span>
            </label>
            <Input
              type="text"
              value={seo?.focusKeyword || ''}
              onChange={(e) => handleChange('focusKeyword', e.target.value)}
              className="bg-white focus:bg-white focus:border-orange-500 rounded-md h-10"
              placeholder="e.g. premium velour streetwear"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              The single term this page should rank for first. Always placed at the front of your keyword list.
            </p>
          </div>

          <ChipField
            label="Additional Keywords"
            icon={Hash}
            hint="Press Enter or comma to add. Backspace on an empty field removes the last one. Paste a list to import everything at once."
            chipClassName="bg-orange-50 text-orange-700 border-orange-200"
            values={seo?.additionalKeywords || []}
            onChange={(next) => onChange({ ...seo, additionalKeywords: next })}
            placeholder="e.g. sustainable fashion, archive drop"
          />

          <ChipField
            label="Search Phrases / Sentences"
            icon={Quote}
            hint="Full sentences people type into Google. These get bundled into your searchable keyword index."
            chipClassName="bg-indigo-50 text-indigo-700 border-indigo-200"
            values={seo?.searchPhrases || []}
            onChange={(next) => onChange({ ...seo, searchPhrases: next })}
            placeholder="e.g. where to buy velour jacket online"
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
              className="flex-1 bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
              placeholder="https://..."
            />
            <GalleryPickerButton onSelect={(urls) => handleChange('ogImage', urls[0] || '')} label="Select Image" />
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
            className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
            placeholder="https://zenvro.com/..."
          />
        </div>

        {/* Google Search Result Mockup Preview */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h4 className="text-xs font-semibold text-gray-500">Search Result Preview</h4>
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 border',
                scoreBadge
              )}
            >
              <Gauge className="w-3 h-3" />
              SEO Score {score}/{scoreTotal}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-sans">
            <div className="flex items-center gap-2 text-[11px] text-gray-600 truncate">
              <span className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shrink-0">
                <span className="text-[9px] font-bold">Z</span>
              </span>
              <span className="truncate">{seo?.canonicalUrl || 'https://zenvro.com'}</span>
            </div>
            <div className="text-sm font-medium text-blue-700 hover:underline cursor-pointer truncate mt-0.5">
              {seo?.metaTitle || 'Page Title'}
            </div>
            <div className="text-xs text-gray-600 line-clamp-2 mt-0.5">
              {seo?.metaDescription || 'Add a meta description to preview how this page will look in search results.'}
            </div>
          </div>

          {/* Search Visibility Index */}
          <div className="mt-3 bg-gray-50 rounded-xl border border-gray-200 p-3">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
              Search Visibility Index
            </div>
            {keywords.length === 0 && phrases.length === 0 ? (
              <span className="text-[11px] text-gray-400">No keywords or search phrases added yet...</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border bg-orange-50 text-orange-700 border-orange-200"
                  >
                    {seo?.focusKeyword && keyword === seo.focusKeyword && (
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                    )}
                    {keyword}
                  </span>
                ))}
                {phrases.map((phrase, i) => (
                  <span
                    key={`p-${i}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border bg-indigo-50 text-indigo-700 border-indigo-200"
                  >
                    <Quote className="w-3 h-3" />
                    {phrase}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
