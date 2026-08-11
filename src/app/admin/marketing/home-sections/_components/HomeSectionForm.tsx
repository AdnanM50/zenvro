'use client';

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import type {
  HomeSection,
  CreateHomeSectionPayload,
  HomeSectionType,
} from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import ProductSearchPicker from '@/components/admin/ProductSearchPicker';

const selectClassName =
  'w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100';

const inputClassName =
  'w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100';

const sectionTypeLabels: Record<HomeSectionType, string> = {
  'featured-products': 'Featured Products',
  'promo-banner': 'Promo Banner',
  'flash-sale': 'Flash Sale',
  custom: 'Custom Content',
};

export interface HomeSectionFormHandle {
  submit: () => void;
}

interface HomeSectionFormProps {
  section: HomeSection | null;
  onSubmit: (payload: CreateHomeSectionPayload) => void;
}

const HomeSectionForm = forwardRef<HomeSectionFormHandle, HomeSectionFormProps>(function HomeSectionForm(
  { section, onSubmit },
  ref,
) {
  const [title, setTitle] = useState(section?.title ?? '');
  const [subtitle, setSubtitle] = useState(section?.subtitle ?? '');
  const [sectionType, setSectionType] = useState<HomeSectionType>(section?.sectionType ?? 'featured-products');
  const [enabled, setEnabled] = useState(section?.enabled ?? true);
  const [sortOrder, setSortOrder] = useState(
    section?.sortOrder !== undefined ? String(section.sortOrder) : '0',
  );
  const [productIds, setProductIds] = useState<string[]>(section?.productIds ?? []);
  const [imageUrl, setImageUrl] = useState(section?.imageUrl ?? '');
  const [link, setLink] = useState(section?.link ?? '');
  const [linkText, setLinkText] = useState(section?.linkText ?? '');
  const [content, setContent] = useState(section?.content ?? '');

  const toFiniteOrUndefined = (raw: string): number | undefined => {
    if (raw === '') return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const titleValue = title.trim();
    if (!titleValue) return;

    const parsedSortOrder = toFiniteOrUndefined(sortOrder);
    if (parsedSortOrder === undefined || parsedSortOrder < 0 || !Number.isInteger(parsedSortOrder)) {
      return;
    }

    onSubmit({
      title: titleValue,
      subtitle: subtitle.trim() || undefined,
      sectionType,
      enabled,
      sortOrder: parsedSortOrder,
      productIds: sectionType === 'featured-products' || sectionType === 'flash-sale' ? productIds : [],
      imageUrl: sectionType === 'promo-banner' ? imageUrl.trim() || undefined : undefined,
      link: sectionType === 'promo-banner' ? link.trim() || undefined : undefined,
      linkText: sectionType === 'promo-banner' ? linkText.trim() || undefined : undefined,
      content: sectionType === 'custom' ? content.trim() || undefined : undefined,
    });
  };

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(new Event('submit') as unknown as React.FormEvent),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Section
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="section-title">Title</Label>
            <Input
              id="section-title"
              placeholder="e.g. Featured Products"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="section-type">Section Type</Label>
            <select
              id="section-type"
              value={sectionType}
              onChange={(e) => setSectionType(e.target.value as HomeSectionType)}
              className={selectClassName}
            >
              {(Object.keys(sectionTypeLabels) as HomeSectionType[]).map((type) => (
                <option key={type} value={type}>
                  {sectionTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="section-subtitle">Subtitle</Label>
            <Input
              id="section-subtitle"
              placeholder="Optional subtitle shown under the title."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="section-sort-order">Sort Order</Label>
            <Input
              id="section-sort-order"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 1"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3">
            <div>
              <div className="text-xs font-semibold text-gray-900 dark:text-white">Show on home page</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                Turn off to hide this section from the storefront.
              </div>
            </div>
            <Switch
              id="section-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
              size="sm"
            />
          </div>
        </div>
      </section>

      {(sectionType === 'featured-products' || sectionType === 'flash-sale') && (
        <section className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Products
          </h3>
          <ProductSearchPicker
            value={productIds}
            onChange={setProductIds}
            label="Select Products"
            placeholder="Search products by name..."
            helperText="Search for products by name and click to add them to this section."
          />
        </section>
      )}

      {sectionType === 'promo-banner' && (
        <section className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Banner
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="section-image-url">Image URL</Label>
              <Input
                id="section-image-url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section-link-text">Button Text</Label>
              <Input
                id="section-link-text"
                placeholder="e.g. Shop Collection"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="section-link">Button Link</Label>
              <Input
                id="section-link"
                placeholder="e.g. /collections/new"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          </div>
        </section>
      )}

      {sectionType === 'custom' && (
        <section className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Content
          </h3>
          <div className="space-y-2">
            <Label htmlFor="section-content">Content</Label>
            <textarea
              id="section-content"
              rows={4}
              placeholder="Custom HTML or text content for this section."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={inputClassName}
            />
          </div>
        </section>
      )}
    </form>
  );
});

export default HomeSectionForm;
