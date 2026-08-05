/** Map of attribute name -> attribute value, e.g. { Color: 'Black', Size: 'XL' } */
export type VariantAttributes = Record<string, string>;

/** Core product variant entity returned by the API */
export interface Variant {
  _id: string;
  sku: string;
  attributes: VariantAttributes;
  price: number;
  salePrice?: number;
  stock: number;
  image: string;
  weight?: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Payload for creating a new product variant */
export interface CreateVariantPayload {
  sku: string;
  attributes?: VariantAttributes;
  price: number;
  salePrice?: number;
  stock: number;
  image?: string;
  weight?: number;
}

/** Payload for updating an existing variant (partial, _id required) */
export interface UpdateVariantPayload extends Partial<CreateVariantPayload> {
  _id: string;
}
