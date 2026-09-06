import type { Variant, CreateVariantPayload } from './variant';

/** Lifecycle status of a product listing */
export type ProductStatus = 'draft' | 'active' | 'archived';

/** Audience/gender targeting of a product */
export type ProductGender = 'men' | 'women' | 'unisex' | 'kids' | '';

/** Rich SEO metadata for a product listing */
export interface ProductSEO {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  twitterCard: string;
  structuredData: string;
  robots: string;
}

/** Media assets for a product listing */
export interface ProductMedia {
  featuredImage?: string;
  gallery?: string[];
  videoUrl?: string;
}

/** Core product entity returned by the API */
export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  barcode: string;
  shortDescription: string;
  description: string;
  category: string;
  brand: string;
  collection: string;
  tags: string[];
  featuredImage: string;
  gallery: string[];
  video: string;
  media?: ProductMedia;
  regularPrice: number;
  salePrice: number;
  costPrice: number;
  stock: number;
  lowStock: number;
  sold: number;
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  isTrending: boolean;
  gender: ProductGender;
  material: string;
  careInstruction: string;
  specifications: Record<string, string>;
  variants: Variant[];
  seo: ProductSEO;
  createdAt: Date;
  updatedAt: Date;
}

/** Payload for creating a new product */
export interface CreateProductPayload {
  name: string;
  slug?: string;
  sku: string;
  barcode?: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  brand?: string;
  collection?: string;
  tags?: string[];
  featuredImage?: string;
  gallery?: string[];
  video?: string;
  media?: ProductMedia;
  regularPrice: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  lowStock?: number;
  sold?: number;
  status?: ProductStatus;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  gender?: ProductGender;
  material?: string;
  careInstruction?: string;
  specifications?: Record<string, string>;
  variants?: CreateVariantPayload[];
  seo?: ProductSEO;
}

/** Payload for updating an existing product (partial, _id required) */
export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  _id: string;
}

/** Query parameters for listing/searching products */
export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  status?: ProductStatus;
  gender?: ProductGender;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  ids?: string[];
}

export const defaultProductSEO: ProductSEO = {
  title: '',
  description: '',
  keywords: [],
  canonical: '',
  ogImage: '',
  ogTitle: '',
  ogDescription: '',
  ogType: 'product',
  twitterCard: 'summary_large_image',
  structuredData: '',
  robots: 'index',
};
