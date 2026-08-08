'use client';

import React, { forwardRef, useImperativeHandle, useState } from 'react';
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
  const [valuesInput, setValuesInput] = useState(
    attribute?.values ? attribute.values.join(', ') : '',
  );
  const [isVariant, setIsVariant] = useState(attribute?.isVariant ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedValues = valuesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmit({
      name,
      values: parsedValues,
      isVariant,
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
          placeholder="e.g. Size, Color, Ram"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attr-values">Option Values (Comma separated)</Label>
        <Input
          id="attr-values"
          placeholder="e.g. Small, Medium, Large, XL"
          value={valuesInput}
          onChange={(e) => setValuesInput(e.target.value)}
        />
        <p className="text-[11px] text-gray-400">Separate each option with a comma.</p>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="attr-variant"
          checked={isVariant}
          onChange={(e) => setIsVariant(e.target.checked)}
          className="rounded text-black focus:ring-0"
        />
        <Label htmlFor="attr-variant">Use for Product Variants</Label>
      </div>
    </form>
  );
});

export default AttributeForm;
