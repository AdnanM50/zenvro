export interface InventoryItem {
  _id: string;
  productId: string;
  variantSku?: string;
  quantity: number;
  movementType: 'in' | 'out' | 'adjustment' | 'return' | 'damage';
  note?: Record<string, unknown> | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInventoryPayload {
  productId: string;
  variantSku?: string;
  quantity: number;
  movementType: 'in' | 'out' | 'adjustment' | 'return' | 'damage';
  note?: Record<string, unknown> | string;
}

export interface InventoryListParams {
  page?: number;
  limit?: number;
  productId?: string;
  variantSku?: string;
  movementType?: string;
  search?: string;
}
