/** Map of attribute name -> attribute value, e.g. { Color: 'Olive', Size: 'M' } */
export type VariantAttributes = Record<string, string>;

export type VariantStatus = 'active' | 'inactive';

/** Core product variant entity returned by the API */
export interface Variant {
  _id: string;
  productId: string; // ObjectId reference to Product
  sku: string;
  attributes: VariantAttributes;
  price: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  sold?: number;
  image?: string;
  weight?: number;
  status: VariantStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** Payload for creating a new product variant */
export interface CreateVariantPayload {
  productId?: string;
  sku: string;
  attributes?: VariantAttributes;
  price: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  sold?: number;
  image?: string;
  weight?: number;
  status?: VariantStatus;
}

/** Payload for updating an existing variant (partial, _id required) */
export interface UpdateVariantPayload extends Partial<CreateVariantPayload> {
  _id: string;
}

/** Query parameters for listing variants */
export interface VariantListParams {
  page?: number;
  limit?: number;
  search?: string;
  productId?: string;
}
