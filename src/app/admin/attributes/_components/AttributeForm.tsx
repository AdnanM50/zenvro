'use client';

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { X } from 'lucide-react';
import type { Attribute, CreateAttributePayload } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface AttributeFormHandle {
  submit: () => void;
}

interface AttributeFormProps {
  attribute: Attribute | null;
  onSubmit: (payload: CreateAttributePayload) => void;
}

const AttributeForm = forwardRef<AttributeFormHandle, AttributeFormProps>(function AttributeForm(
  { attribute, onSubmit },
  ref,
) {
  const [name, setName] = useState(attribute?.name ?? '');
  const [values, setValues] = useState<string[]>(attribute?.values ?? []);
  const [valueDraft, setValueDraft] = useState('');
  const [useForVariants, setUseForVariants] = useState(
    attribute?.useForVariants ?? attribute?.isVariant ?? true
  );

  const addValue = () => {
    const nextValue = valueDraft.trim();
    if (!nextValue || values.includes(nextValue)) return;
    setValues((currentValues) => [...currentValues, nextValue]);
    setValueDraft('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      values,
      useForVariants,
      isVariant: useForVariants,
    });
  };

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(new Event('submit') as unknown as React.FormEvent),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="attr-name">Attribute Name</Label>
        <Input
          id="attr-name"
          placeholder="e.g. Size, Color, Material, Fit, Pattern, Gender, Season, Occasion"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attr-values">Option Values</Label>
        <Input
          id="attr-values"
          placeholder="Type an option (e.g. Olive, S, M, XL) and press Enter"
          value={valueDraft}
          onChange={(e) => setValueDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addValue();
            }
          }}
          onBlur={addValue}
        />
        {values.length > 0 && (
          <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {values.map((value) => (
              <span
                key={value}
                className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <span className="truncate">{value}</span>
                <button
                  type="button"
                  onClick={() => setValues((currentValues) => currentValues.filter((item) => item !== value))}
                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                  aria-label={`Remove ${value}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-[11px] text-gray-400">Press Enter after each option value to add it.</p>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <Label htmlFor="useForVariants" className="text-xs font-semibold block text-gray-800 dark:text-gray-200">
            Use for Product Variants
          </Label>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            When enabled, this attribute appears in the Variant creation form (e.g. Size, Color).
          </p>
        </div>
        <input
          type="checkbox"
          id="useForVariants"
          checked={useForVariants}
          onChange={(e) => setUseForVariants(e.target.checked)}
          className="h-4 w-4 rounded text-black focus:ring-0 cursor-pointer"
        />
      </div>
    </form>
  );
});

export default AttributeForm;
