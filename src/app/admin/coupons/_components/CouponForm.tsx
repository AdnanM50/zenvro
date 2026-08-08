'use client';

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import type {
  Coupon,
  CreateCouponPayload,
  CouponType,
  CouponStatus,
  CouponAppliesTo,
} from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const selectClassName =
  'w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100';

export interface CouponFormHandle {
  submit: () => void;
}

interface CouponFormProps {
  coupon: Coupon | null;
  onSubmit: (payload: CreateCouponPayload) => void;
}

const CouponForm = forwardRef<CouponFormHandle, CouponFormProps>(function CouponForm(
  { coupon, onSubmit },
  ref,
) {
  const [name, setName] = useState(coupon?.name ?? '');
  const [code, setCode] = useState(coupon?.code ?? '');
  const [type, setType] = useState<CouponType>(coupon?.type ?? 'percentage');
  const [value, setValue] = useState(coupon?.value !== undefined ? String(coupon.value) : '');
  const [minOrderAmount, setMinOrderAmount] = useState(
    coupon?.minOrderAmount != null ? String(coupon.minOrderAmount) : '',
  );
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(
    coupon?.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : '',
  );
  const [usageLimit, setUsageLimit] = useState(
    coupon?.usageLimit != null ? String(coupon.usageLimit) : '',
  );
  const [perUserLimit, setPerUserLimit] = useState(
    coupon?.perUserLimit != null ? String(coupon.perUserLimit) : '',
  );
  const [startDate, setStartDate] = useState(coupon?.startDate ?? '');
  const [endDate, setEndDate] = useState(coupon?.endDate ?? '');
  const [status, setStatus] = useState<CouponStatus>(coupon?.status ?? 'active');
  const [appliesTo, setAppliesTo] = useState<CouponAppliesTo>(coupon?.appliesTo ?? 'all');
  const [products, setProducts] = useState((coupon?.products ?? []).join(', '));
  const [categories, setCategories] = useState((coupon?.categories ?? []).join(', '));

  const toFiniteOrUndefined = (raw: string): number | undefined => {
    if (raw === '') return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  };

  const splitCsv = (value: string): string[] =>
    value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameValue = name.trim();
    const codeValue = code.trim();
    const valueNum = toFiniteOrUndefined(value);

    if (!nameValue || !codeValue || valueNum === undefined || valueNum <= 0) return;
    if (type === 'percentage' && valueNum > 100) return;

    onSubmit({
      name: nameValue,
      code: codeValue,
      type,
      value: valueNum,
      minOrderAmount: toFiniteOrUndefined(minOrderAmount),
      maxDiscountAmount: toFiniteOrUndefined(maxDiscountAmount),
      usageLimit: toFiniteOrUndefined(usageLimit),
      perUserLimit: toFiniteOrUndefined(perUserLimit),
      startDate: startDate.trim() || undefined,
      endDate: endDate.trim() || undefined,
      appliesTo,
      products: appliesTo === 'products' ? splitCsv(products) : [],
      categories: appliesTo === 'categories' ? splitCsv(categories) : [],
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
            <Label htmlFor="coupon-name">Name</Label>
            <Input
              id="coupon-name"
              placeholder="e.g. Summer Sale"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon-code">Code</Label>
            <Input
              id="coupon-code"
              placeholder="e.g. SUMMER10"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon-type">Type</Label>
            <select
              id="coupon-type"
              value={type}
              onChange={(e) => setType(e.target.value as CouponType)}
              className={selectClassName}
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon-value">
              Value ({type === 'percentage' ? '%' : '$'})
            </Label>
            <Input
              id="coupon-value"
              type="number"
              min="0"
              step="0.01"
              placeholder={type === 'percentage' ? 'e.g. 10' : 'e.g. 5.00'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Limits
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="coupon-min-order">Minimum Order ($)</Label>
            <Input
              id="coupon-min-order"
              type="number"
              min="0"
              step="0.01"
              placeholder="Optional"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon-max-discount">Maximum Discount ($)</Label>
            <Input
              id="coupon-max-discount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Optional"
              value={maxDiscountAmount}
              onChange={(e) => setMaxDiscountAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon-usage-limit">Usage Limit</Label>
            <Input
              id="coupon-usage-limit"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 100"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon-per-user-limit">Per-User Limit</Label>
            <Input
              id="coupon-per-user-limit"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 1"
              value={perUserLimit}
              onChange={(e) => setPerUserLimit(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Validity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="coupon-start-date">Start Date</Label>
            <Input
              id="coupon-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon-end-date">End Date</Label>
            <Input
              id="coupon-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon-status">Status</Label>
            <select
              id="coupon-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as CouponStatus)}
              className={selectClassName}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon-applies-to">Applies To</Label>
            <select
              id="coupon-applies-to"
              value={appliesTo}
              onChange={(e) => setAppliesTo(e.target.value as CouponAppliesTo)}
              className={selectClassName}
            >
              <option value="all">All products</option>
              <option value="products">Specific products</option>
              <option value="categories">Specific categories</option>
            </select>
          </div>
        </div>
        {appliesTo === 'products' && (
          <div className="space-y-2">
            <Label htmlFor="coupon-products">Products</Label>
            <Input
              id="coupon-products"
              placeholder="Comma separated product IDs"
              value={products}
              onChange={(e) => setProducts(e.target.value)}
            />
          </div>
        )}
        {appliesTo === 'categories' && (
          <div className="space-y-2">
            <Label htmlFor="coupon-categories">Categories</Label>
            <Input
              id="coupon-categories"
              placeholder="Comma separated category IDs"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
            />
          </div>
        )}
      </section>
    </form>
  );
});

export default CouponForm;
