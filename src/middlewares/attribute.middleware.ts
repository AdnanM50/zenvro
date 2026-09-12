import { NextRequest, NextResponse } from 'next/server';
import { AttributeModel } from '@/models/attribute.model';
import type { Attribute } from '@/types';
import { api } from '@/lib/api-response';

export interface AttributeMiddlewareResult {
  attribute: Attribute;
}

export async function requireAttribute(
  request: NextRequest,
  attributeId?: string
): Promise<AttributeMiddlewareResult | NextResponse> {
  const id = attributeId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Attribute ID is required');

  const attribute = await AttributeModel.findById(id);
  if (!attribute) return api.notFound('Attribute not found');

  return { attribute };
}

export function validateAttributePayload(data: Record<string, unknown>): NextResponse | null {
  if ('name' in data && (!data.name || typeof data.name !== 'string' || !data.name.trim())) {
    return api.badRequest('Attribute name is required');
  }

  if ('values' in data && (!Array.isArray(data.values) || data.values.length === 0)) {
    return api.badRequest('Attribute values must be a non-empty array');
  }

  return null;
}
