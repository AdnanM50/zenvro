import { NextRequest, NextResponse } from 'next/server';
import { InventoryModel } from '@/models/inventory.model';
import type { InventoryItem } from '@/types';
import { api } from '@/lib/api-response';

export interface InventoryMiddlewareResult {
  inventoryItem: InventoryItem;
}

export async function requireInventoryItem(
  request: NextRequest,
  inventoryId?: string
): Promise<InventoryMiddlewareResult | NextResponse> {
  const id = inventoryId || new URL(request.url).searchParams.get('_id') || new URL(request.url).searchParams.get('id');
  if (!id) return api.badRequest('Inventory item ID is required');

  const inventoryItem = await InventoryModel.findById(id);
  if (!inventoryItem) return api.notFound('Inventory item not found');

  return { inventoryItem };
}

export function validateInventoryPayload(data: Record<string, unknown>): NextResponse | null {
  if ('quantity' in data && (typeof data.quantity !== 'number' || data.quantity < 0)) {
    return api.badRequest('Inventory quantity must be a non-negative number');
  }

  if ('reserved' in data && (typeof data.reserved !== 'number' || data.reserved < 0)) {
    return api.badRequest('Reserved inventory must be a non-negative number');
  }

  return null;
}
