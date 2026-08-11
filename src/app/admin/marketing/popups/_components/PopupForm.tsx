'use client';

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import type {
  PopupBanner,
  CreatePopupBannerPayload,
  PopupBannerStatus,
} from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const inputClassName =
  'w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100';

export interface PopupFormHandle {
  submit: () => void;
}

interface PopupFormProps {
  banner: PopupBanner | null;
  onSubmit: (payload: CreatePopupBannerPayload) => void;
}

const PopupForm = forwardRef<PopupFormHandle, PopupFormProps>(function PopupForm(
  { banner, onSubmit },
  ref,
) {
  const [title, setTitle] = useState(banner?.title ?? '');
  const [description, setDescription] = useState(banner?.description ?? '');
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl ?? '');
  const [buttonText, setButtonText] = useState(banner?.buttonText ?? '');
  const [buttonLink, setButtonLink] = useState(banner?.buttonLink ?? '');
  const [startDate, setStartDate] = useState(banner?.startDate ?? '');
  const [endDate, setEndDate] = useState(banner?.endDate ?? '');
  const [status, setStatus] = useState<PopupBannerStatus>(banner?.status ?? 'inactive');
  const [sortOrder, setSortOrder] = useState(
    banner?.sortOrder !== undefined ? String(banner.sortOrder) : '0',
  );

  const [triggerType, setTriggerType] = useState(banner?.triggerType ?? 'delay');
  const [targetPage, setTargetPage] = useState(banner?.targetPage ?? 'all');
  const [discountCode, setDiscountCode] = useState(banner?.discountCode ?? '');

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
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      buttonText: buttonText.trim() || undefined,
      buttonLink: buttonLink.trim() || undefined,
      startDate: startDate.trim() || undefined,
      endDate: endDate.trim() || undefined,
      status,
      sortOrder: parsedSortOrder,
      triggerType,
      targetPage,
      discountCode: discountCode.trim() || undefined,
    });
  };

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(new Event('submit') as unknown as React.FormEvent),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Content & Promo Code
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="popup-title">Title</Label>
            <Input
              id="popup-title"
              placeholder="e.g. Unlock 20% Off Your First Order"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="popup-promo-code">Promo / Discount Code</Label>
            <Input
              id="popup-promo-code"
              placeholder="e.g. WELCOME20"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="popup-description">Description</Label>
            <textarea
              id="popup-description"
              rows={3}
              placeholder="Optional short description shown inside the popup."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClassName}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="popup-image-url">Image URL</Label>
            <Input
              id="popup-image-url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="popup-button-text">Button Text (CTA)</Label>
            <Input
              id="popup-button-text"
              placeholder="e.g. Claim My Discount Now"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="popup-button-link">Button Link</Label>
            <Input
              id="popup-button-link"
              placeholder="e.g. /products"
              value={buttonLink}
              onChange={(e) => setButtonLink(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Trigger & Page Targeting
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="popup-trigger-type">Trigger Event</Label>
            <select
              id="popup-trigger-type"
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              className={inputClassName}
            >
              <option value="delay">After 5 Seconds Delay</option>
              <option value="scroll">After 35% Page Scroll</option>
              <option value="exit_intent">On Mouse Exit Intent</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="popup-target-page">Target Page</Label>
            <select
              id="popup-target-page"
              value={targetPage}
              onChange={(e) => setTargetPage(e.target.value)}
              className={inputClassName}
            >
              <option value="all">All Pages</option>
              <option value="home">Home Page Only</option>
              <option value="/products">Products Page Only</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="popup-start-date">Start Date</Label>
            <Input
              id="popup-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="popup-end-date">End Date</Label>
            <Input
              id="popup-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3">
            <div>
              <div className="text-xs font-semibold text-gray-900 dark:text-white">Show popup on the site</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                Turn off to hide this popup from visitors.
              </div>
            </div>
            <Switch
              id="popup-status"
              checked={status === 'active'}
              onCheckedChange={(checked) => setStatus(checked ? 'active' : 'inactive')}
              size="sm"
            />
          </div>
        </div>
      </section>
    </form>
  );
});

export default PopupForm;
