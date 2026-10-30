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
import { Sparkles, Zap, Tag, ArrowRight, Eye, Wand2 } from 'lucide-react';

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
  const [status, setStatus] = useState<PopupBannerStatus>(banner?.status ?? 'active');
  const [sortOrder, setSortOrder] = useState(
    banner?.sortOrder !== undefined ? String(banner.sortOrder) : '0',
  );

  const [triggerType, setTriggerType] = useState(banner?.triggerType ?? 'delay');
  const [targetPage, setTargetPage] = useState(banner?.targetPage ?? 'home');
  const [discountCode, setDiscountCode] = useState(banner?.discountCode ?? '');
  const [badgeText, setBadgeText] = useState(banner?.badgeText ?? '');
  const [imageBadgeText, setImageBadgeText] = useState(banner?.imageBadgeText ?? '');
  const [footerText, setFooterText] = useState(banner?.footerText ?? '');
  const [showLivePreview, setShowLivePreview] = useState(true);

  const handleApplyTemplate = () => {
    setTitle('Unlock 20% Off Your First Order');
    setDescription('Join the VELORA inner circle and get instant access to secret flash deals & free express shipping.');
    setImageUrl('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop');
    setDiscountCode('WELCOME20');
    setButtonText('Claim My Discount Now');
    setButtonLink('/products');
    setBadgeText('Exclusive Reward');
    setImageBadgeText('Limited Offer');
    setFooterText('No spam. Unsubscribe anytime.');
    setStatus('active');
  };

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
      badgeText: badgeText.trim() || undefined,
      imageBadgeText: imageBadgeText.trim() || undefined,
      footerText: footerText.trim() || undefined,
    });
  };

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(new Event('submit') as unknown as React.FormEvent),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick Fill Button */}
      {!banner && (
        <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Welcome Discount Preset:</strong> Fill the form with the 20% welcome promo template.
          </div>
          <button
            type="button"
            onClick={handleApplyTemplate}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Apply Preset
          </button>
        </div>
      )}

      {/* Live Preview Toggle */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Popup Configuration
        </h3>
        <button
          type="button"
          onClick={() => setShowLivePreview(!showLivePreview)}
          className="text-xs text-primary-fixed hover:underline flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          {showLivePreview ? 'Hide Live Preview' : 'Show Live Preview'}
        </button>
      </div>

      {/* Real-time Visual Preview Card */}
      {showLivePreview && (
        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4 sm:p-5 text-white shadow-xl">
          <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
            <Eye className="w-3 h-3" /> Live Visitor Preview
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 rounded-2xl overflow-hidden border border-gray-800 bg-gray-900/60 min-h-[260px]">
            {/* Image Column */}
            <div className="sm:col-span-5 relative bg-gray-900 min-h-[160px] sm:min-h-full overflow-hidden">
              <img
                src={
                  imageUrl ||
                  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'
                }
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/30" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  <Zap className="w-2.5 h-2.5 fill-black" />
                  {imageBadgeText || 'Limited Offer'}
                </span>
              </div>
            </div>

            {/* Content Column */}
            <div className="sm:col-span-7 p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Sparkles className="w-3 h-3" />
                  </span>
                  <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest">
                    {badgeText || 'Exclusive Reward'}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-extrabold text-white leading-tight mb-1">
                  {title || 'Unlock 20% Off Your First Order'}
                </h4>
                <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                  {description ||
                    'Join the VELORA inner circle and get instant access to secret flash deals & free express shipping.'}
                </p>

                {(discountCode || title) && (
                  <div className="mb-3 p-2 bg-gray-950/80 border border-dashed border-amber-500/40 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      <div>
                        <div className="text-[8px] text-gray-500 uppercase">Promo Code</div>
                        <div className="font-mono font-bold text-amber-300 text-xs tracking-wider">
                          {discountCode || 'WELCOME20'}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      Copy Code
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md">
                  {buttonText || 'Claim My Discount Now'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div className="text-[9px] text-center text-gray-500 mt-1.5">
                  {footerText || 'No spam. Unsubscribe anytime.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Fields */}
      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Headline & Promo Code
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="popup-title">Popup Title *</Label>
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

          <div className="space-y-2">
            <Label htmlFor="popup-badge-text">Top Badge Text</Label>
            <Input
              id="popup-badge-text"
              placeholder="e.g. Exclusive Reward"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="popup-image-badge-text">Image Badge Text</Label>
            <Input
              id="popup-image-badge-text"
              placeholder="e.g. Limited Offer"
              value={imageBadgeText}
              onChange={(e) => setImageBadgeText(e.target.value)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="popup-description">Description</Label>
            <textarea
              id="popup-description"
              rows={3}
              placeholder="e.g. Join the VELORA inner circle and get instant access to secret flash deals & free express shipping."
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

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="popup-footer-text">Footer Note</Label>
            <Input
              id="popup-footer-text"
              placeholder="e.g. No spam. Unsubscribe anytime."
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Trigger & Targeting */}
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
              <option value="delay">After 4 Seconds Delay</option>
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

          <div className="space-y-2">
            <Label htmlFor="popup-sort-order">Sort Order</Label>
            <Input
              id="popup-sort-order"
              type="number"
              min="0"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3">
            <div>
              <div className="text-xs font-semibold text-gray-900 dark:text-white">Active Status</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                Turn on to display this popup to visitors based on the schedule & trigger.
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
