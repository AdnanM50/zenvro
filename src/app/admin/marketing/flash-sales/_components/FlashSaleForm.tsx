'use client';

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import type {
  FlashSale,
  CreateFlashSalePayload,
  FlashSaleDiscountType,
  FlashSaleStatus,
} from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import ProductSearchPicker from '@/components/admin/ProductSearchPicker';

const selectClassName =
  'w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100';

const inputClassName =
  'w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100';

export interface FlashSaleFormHandle {
  submit: () => void;
}

interface FlashSaleFormProps {
  sale: FlashSale | null;
  onSubmit: (payload: CreateFlashSalePayload) => void;
}

const FlashSaleForm = forwardRef<FlashSaleFormHandle, FlashSaleFormProps>(function FlashSaleForm(
  { sale, onSubmit },
  ref,
) {
  const [title, setTitle] = useState(sale?.title ?? '');
  const [description, setDescription] = useState(sale?.description ?? '');
  const [discountType, setDiscountType] = useState<FlashSaleDiscountType>(sale?.discountType ?? 'percentage');
  const [discountValue, setDiscountValue] = useState(
    sale?.discountValue !== undefined ? String(sale.discountValue) : '',
  );
  const [startsAt, setStartsAt] = useState(sale?.startsAt ?? '');
  const [endsAt, setEndsAt] = useState(sale?.endsAt ?? '');
  const [productIds, setProductIds] = useState<string[]>(sale?.productIds ?? []);
  const [showOnHome, setShowOnHome] = useState(sale?.showOnHome ?? false);
  const [sortOrder, setSortOrder] = useState(
    sale?.sortOrder !== undefined ? String(sale.sortOrder) : '0',
  );
  const [status, setStatus] = useState<FlashSaleStatus>(sale?.status ?? 'inactive');

  const toFiniteOrUndefined = (raw: string): number | undefined => {
    if (raw === '') return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const titleValue = title.trim();
    const valueNum = toFiniteOrUndefined(discountValue);

    if (!titleValue || valueNum === undefined || valueNum <= 0) return;
    if (discountType === 'percentage' && valueNum > 100) return;
    if (!startsAt.trim() || !endsAt.trim()) return;
    if (Date.parse(endsAt) <= Date.parse(startsAt)) return;

    const parsedSortOrder = toFiniteOrUndefined(sortOrder);
    if (parsedSortOrder === undefined || parsedSortOrder < 0 || !Number.isInteger(parsedSortOrder)) {
      return;
    }

    onSubmit({
      title: titleValue,
      description: description.trim() || undefined,
      discountType,
      discountValue: valueNum,
      startsAt: startsAt.trim(),
      endsAt: endsAt.trim(),
      productIds,
      showOnHome,
      sortOrder: parsedSortOrder,
      status,
    });
  };

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(new Event('submit') as unknown as React.FormEvent),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Basics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sale-title">Title</Label>
            <Input
              id="sale-title"
              placeholder="e.g. 24 Hour Flash Sale"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sale-status">Status</Label>
            <select
              id="sale-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as FlashSaleStatus)}
              className={selectClassName}
            >
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="ended">Ended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="sale-description">Description</Label>
            <textarea
              id="sale-description"
              rows={2}
              placeholder="Optional short description."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sale-discount-type">Discount Type</Label>
            <select
              id="sale-discount-type"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as FlashSaleDiscountType)}
              className={selectClassName}
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sale-discount-value">
              Discount Value ({discountType === 'percentage' ? '%' : '$'})
            </Label>
            <Input
              id="sale-discount-value"
              type="number"
              min="0"
              step="0.01"
              placeholder={discountType === 'percentage' ? 'e.g. 20' : 'e.g. 5.00'}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              required
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Schedule
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sale-starts-at">Starts At</Label>
            <Input
              id="sale-starts-at"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sale-ends-at">Ends At</Label>
            <Input
              id="sale-ends-at"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Products & Placement
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sale-sort-order">Sort Order</Label>
            <Input
              id="sale-sort-order"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 1"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 self-end">
            <div>
              <div className="text-xs font-semibold text-gray-900 dark:text-white">Show on home page</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                Turn off to hide this sale from the storefront.
              </div>
            </div>
            <Switch
              id="sale-show-on-home"
              checked={showOnHome}
              onCheckedChange={setShowOnHome}
              size="sm"
            />
          </div>
        </div>

        <ProductSearchPicker
          value={productIds}
          onChange={setProductIds}
          label="Select Products"
          placeholder="Search products by name..."
          helperText="Search for products by name and click to add them to this flash sale."
        />
      </section>
    </form>
  );
});

export default FlashSaleForm;
